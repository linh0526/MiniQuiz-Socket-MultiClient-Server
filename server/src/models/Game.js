class Game {
  constructor(roomId, hostId) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = new Map();
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.gameState = 'waiting'; // waiting, playing, results
    this.timer = null;
    this.questionTimeLimit = 30; // seconds
    this.createdAt = new Date();
  }

  addPlayer(playerId, username) {
    if (this.players.has(playerId)) return false;
    
    this.players.set(playerId, {
      id: playerId,
      username,
      score: 0,
      answers: [],
      isReady: false,
      joinedAt: new Date()
    });
    return true;
  }

  removePlayer(playerId) {
    return this.players.delete(playerId);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  updatePlayerScore(playerId, points) {
    const player = this.players.get(playerId);
    if (player) {
      player.score += points;
      return true;
    }
    return false;
  }

  addAnswer(playerId, questionIndex, answer, isCorrect, timeSpent) {
    const player = this.players.get(playerId);
    if (player) {
      player.answers.push({
        questionIndex,
        answer,
        isCorrect,
        timeSpent,
        timestamp: new Date()
      });
      return true;
    }
    return false;
  }

  setQuestions(questions) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex] || null;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    return this.currentQuestionIndex < this.questions.length;
  }

  getLeaderboard() {
    return this.getAllPlayers()
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));
  }

  resetGame() {
    this.currentQuestionIndex = 0;
    this.gameState = 'waiting';
    this.players.forEach(player => {
      player.score = 0;
      player.answers = [];
      player.isReady = false;
    });
  }

  getGameStats() {
    return {
      roomId: this.roomId,
      hostId: this.hostId,
      playerCount: this.players.size,
      gameState: this.gameState,
      currentQuestion: this.currentQuestionIndex + 1,
      totalQuestions: this.questions.length,
      createdAt: this.createdAt
    };
  }
}

module.exports = Game;
