const GameService = require('../services/GameService');

class GameController {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Tạo phòng mới
      socket.on('create_room', (data) => {
        try {
          const { username } = data;
          const game = GameService.createGame(socket.id);
          // Thêm host vào danh sách players
          if (username) {
            game.addPlayer(socket.id, username);
          }
          socket.join(game.roomId);
          socket.emit('room_created', {
            roomId: game.roomId,
            hostId: socket.id
          });
          // Gửi danh sách players cho host
          socket.emit('player_joined', {
            playerId: socket.id,
            username: username || 'Host',
            players: game.getAllPlayers()
          });
          console.log(`Room created: ${game.roomId} by ${socket.id}`);
        } catch (error) {
          socket.emit('error', { message: 'Không thể tạo phòng' });
        }
      });

      // Tham gia phòng
      socket.on('join_room', (data) => {
        try {
          const { roomId, username } = data;
          const game = GameService.getGame(roomId);
          
          if (!game) {
            socket.emit('error', { message: 'Phòng không tồn tại' });
            return;
          }

          if (game.gameState !== 'waiting') {
            socket.emit('error', { message: 'Game đã bắt đầu' });
            return;
          }

          const success = GameService.joinGame(roomId, socket.id, username);
          if (success) {
            socket.join(roomId);
            socket.emit('joined_room', { roomId, username });
            
            // Gửi danh sách players hiện tại cho người chơi mới
            socket.emit('player_joined', {
              playerId: socket.id,
              username,
              players: game.getAllPlayers()
            });
            
            // Thông báo cho tất cả người chơi khác trong phòng
            socket.to(roomId).emit('player_joined', {
              playerId: socket.id,
              username,
              players: game.getAllPlayers()
            });
          } else {
            socket.emit('error', { message: 'Không thể tham gia phòng' });
          }
        } catch (error) {
          socket.emit('error', { message: 'Lỗi khi tham gia phòng' });
        }
      });

      // Rời phòng
      socket.on('leave_room', (data) => {
        try {
          const { roomId } = data;
          const game = GameService.getGame(roomId);
          
          if (game) {
            const player = game.getPlayer(socket.id);
            const username = player?.username;
            
            // Xóa người chơi khỏi phòng
            GameService.leaveGame(roomId, socket.id);
            socket.leave(roomId);
            
            // Thông báo cho client rằng họ đã rời phòng
            socket.emit('left_room');
            
            // Lấy danh sách players sau khi đã remove
            const updatedPlayers = game.getAllPlayers();
            
            // Thông báo cho các người chơi khác trong phòng
            this.io.to(roomId).emit('player_left', {
              playerId: socket.id,
              username: username,
              players: updatedPlayers
            });

            // Xóa phòng nếu không còn ai
            if (game.players.size === 0) {
              GameService.deleteGame(roomId);
            }
          } else {
            // Nếu không tìm thấy phòng, vẫn emit left_room để client reset state
            socket.emit('left_room');
          }
        } catch (error) {
          console.error('Error leaving room:', error);
          // Vẫn emit left_room để client reset state
          socket.emit('left_room');
        }
      });

      // Bắt đầu game
      socket.on('start_game', (data) => {
        try {
          const { roomId, questions } = data;
          const game = GameService.getGame(roomId);
          
          if (!game || game.hostId !== socket.id) {
            socket.emit('error', { message: 'Chỉ host mới có thể bắt đầu game' });
            return;
          }

          if (game.players.size < 2) {
            socket.emit('error', { message: 'Cần ít nhất 2 người chơi' });
            return;
          }

          game.setQuestions(questions);
          game.gameState = 'playing';
          
          this.io.to(roomId).emit('game_started', {
            questions: game.questions,
            totalQuestions: questions.length
          });

          // Bắt đầu câu hỏi đầu tiên
          this.startQuestion(roomId);
        } catch (error) {
          socket.emit('error', { message: 'Lỗi khi bắt đầu game' });
        }
      });

      // Trả lời câu hỏi
      socket.on('submit_answer', (data) => {
        try {
          const { roomId, questionIndex, answer, questionType, timeSpent } = data;
          const game = GameService.getGame(roomId);
          
          if (!game || game.gameState !== 'playing') return;

          const question = game.questions[questionIndex];
          if (!question) return;

          const type = questionType || question.type || 'single';
          let isCorrect = false;
          let points = 0;

          // Chấm điểm theo từng loại câu hỏi
          if (type === 'single') {
            // Câu hỏi một đáp án đúng
            isCorrect = question.answers[answer]?.correct || false;
            points = isCorrect ? 10 : 0;
          } else if (type === 'multiple') {
            // Câu hỏi nhiều đáp án đúng
            const correctAnswers = question.answers
              .map((a, idx) => a.correct ? idx : -1)
              .filter(idx => idx !== -1)
              .sort((a, b) => a - b);
            const userAnswers = Array.isArray(answer) ? answer.sort((a, b) => a - b) : [];
            
            // So sánh mảng
            isCorrect = correctAnswers.length === userAnswers.length &&
              correctAnswers.every((val, idx) => val === userAnswers[idx]);
            points = isCorrect ? 10 : 0;
          } else if (type === 'order') {
            // Câu hỏi sắp xếp
            const correctOrder = question.correctOrder || 
              question.answers
                .map((a, idx) => idx)
                .filter(idx => question.answers[idx].text.trim());
            const userOrder = Array.isArray(answer) ? answer : [];
            
            // So sánh thứ tự
            isCorrect = correctOrder.length === userOrder.length &&
              correctOrder.every((val, idx) => val === userOrder[idx]);
            points = isCorrect ? 10 : 0;
          } else if (type === 'fill') {
            // Câu hỏi điền từ
            const correctText = (question.correctText || '').trim().toLowerCase();
            const userText = (answer || '').trim().toLowerCase();
            isCorrect = correctText === userText;
            points = isCorrect ? 10 : 0;
          }

          game.updatePlayerScore(socket.id, points);
          game.addAnswer(socket.id, questionIndex, answer, isCorrect, timeSpent);

          // Gửi kết quả cho người chơi
          socket.emit('answer_result', {
            isCorrect,
            points,
            totalScore: game.getPlayer(socket.id)?.score || 0
          });

          // Cập nhật leaderboard cho tất cả
          this.io.to(roomId).emit('leaderboard_update', game.getLeaderboard());
        } catch (error) {
          console.error('Error submitting answer:', error);
        }
      });

      // Chuyển câu hỏi tiếp theo
      socket.on('next_question', (data) => {
        try {
          const { roomId } = data;
          const game = GameService.getGame(roomId);
          
          if (!game || game.hostId !== socket.id) return;

          const hasNext = game.nextQuestion();
          if (hasNext) {
            this.startQuestion(roomId);
          } else {
            this.endGame(roomId);
          }
        } catch (error) {
          console.error('Error moving to next question:', error);
        }
      });

      // Kết thúc game
      socket.on('end_game', (data) => {
        try {
          const { roomId } = data;
          const game = GameService.getGame(roomId);
          
          if (!game || game.hostId !== socket.id) return;
          
          this.endGame(roomId);
        } catch (error) {
          console.error('Error ending game:', error);
        }
      });

      // Reset game
      socket.on('reset_game', (data) => {
        try {
          const { roomId } = data;
          const game = GameService.getGame(roomId);
          
          if (!game || game.hostId !== socket.id) return;
          
          game.resetGame();
          this.io.to(roomId).emit('game_reset', {
            players: game.getAllPlayers()
          });
        } catch (error) {
          console.error('Error resetting game:', error);
        }
      });

      // Ngắt kết nối
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // Tìm và xử lý người chơi rời khỏi tất cả phòng
        GameService.games.forEach((game, roomId) => {
          if (game.players.has(socket.id)) {
            const player = game.getPlayer(socket.id);
            const username = player?.username;
            
            // Xóa người chơi khỏi phòng
            GameService.leaveGame(roomId, socket.id);
            
            // Lấy danh sách players sau khi đã remove
            const updatedPlayers = game.getAllPlayers();
            
            // Thông báo cho các người chơi khác trong phòng
            this.io.to(roomId).emit('player_left', {
              playerId: socket.id,
              username: username,
              players: updatedPlayers
            });

            // Nếu là host rời khỏi, chuyển quyền host cho người khác
            if (game.hostId === socket.id && game.players.size > 0) {
              const newHost = game.getAllPlayers()[0];
              game.hostId = newHost.id;
              this.io.to(roomId).emit('host_changed', { newHostId: newHost.id });
            }

            // Xóa phòng nếu không còn ai
            if (game.players.size === 0) {
              GameService.deleteGame(roomId);
            }
          }
        });
      });
    });
  }

  startQuestion(roomId) {
    const game = GameService.getGame(roomId);
    if (!game) return;

    const question = game.getCurrentQuestion();
    if (!question) return;

    this.io.to(roomId).emit('question_started', {
      question,
      questionIndex: game.currentQuestionIndex,
      timeLimit: game.questionTimeLimit
    });

    // Timer cho câu hỏi
    game.timer = setTimeout(() => {
      this.io.to(roomId).emit('question_timeout', {
        questionIndex: game.currentQuestionIndex
      });
    }, game.questionTimeLimit * 1000);
  }

  endGame(roomId) {
    const game = GameService.getGame(roomId);
    if (!game) return;

    game.gameState = 'results';
    if (game.timer) {
      clearTimeout(game.timer);
      game.timer = null;
    }

    this.io.to(roomId).emit('game_ended', {
      leaderboard: game.getLeaderboard(),
      gameStats: game.getGameStats()
    });
  }
}

module.exports = GameController;
