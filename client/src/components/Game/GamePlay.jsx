import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { socket } from '../../socket';

const GamePlay = () => {
  const { 
    currentQuestion, 
    questionIndex, 
    totalQuestions, 
    timeLeft, 
    leaderboard,
    isHost,
    roomId
  } = useGame();
  
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setAnswerResult(null);
      setStartTime(Date.now());
    }
  }, [currentQuestion]);

  useEffect(() => {
    socket.on('answer_result', (data) => {
      setAnswerResult(data);
    });

    return () => {
      socket.off('answer_result');
    };
  }, []);

  const handleAnswerSelect = (answerIndex) => {
    if (answerSubmitted) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || answerSubmitted) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setAnswerSubmitted(true);
    
    socket.emit('submit_answer', {
      roomId: roomId,
      questionIndex,
      answer: selectedAnswer,
      timeSpent
    });
  };

  const handleNextQuestion = () => {
    socket.emit('next_question', { roomId });
  };

  const handleEndGame = () => {
    socket.emit('end_game', { roomId });
  };

  if (!currentQuestion) {
    return (
      <div className="game-container">
        <div className="loading">
          <p>Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="question-progress">
          Câu {questionIndex + 1} / {totalQuestions}
        </div>
        <div className="timer">
          ⏰ {timeLeft}s
        </div>
      </div>

      <div className="question-container">
        <h2 className="question-text">{currentQuestion.text}</h2>
        
        <div className="answers-grid">
          {currentQuestion.answers.map((answer, index) => {
            let className = 'answer-button';
            
            if (selectedAnswer === index) {
              className += ' selected';
            }
            
            if (answerSubmitted) {
              if (answer.correct) {
                className += ' correct';
              } else if (selectedAnswer === index) {
                className += ' incorrect';
              }
            }
            
            return (
              <button
                key={index}
                className={className}
                onClick={() => handleAnswerSelect(index)}
                disabled={answerSubmitted}
              >
                {answer.text}
              </button>
            );
          })}
        </div>

        {!answerSubmitted && selectedAnswer !== null && (
          <button 
            className="btn-primary btn-large"
            onClick={handleSubmitAnswer}
          >
            Gửi câu trả lời
          </button>
        )}

        {answerSubmitted && answerResult && (
          <div className="answer-feedback">
            <div className={`feedback ${answerResult.isCorrect ? 'correct' : 'incorrect'}`}>
              {answerResult.isCorrect ? '✅ Đúng!' : '❌ Sai!'}
            </div>
            <div className="score-info">
              +{answerResult.points} điểm (Tổng: {answerResult.totalScore})
            </div>
          </div>
        )}
      </div>

      <div className="leaderboard">
        <h3>Bảng xếp hạng</h3>
        <div className="leaderboard-list">
          {leaderboard.slice(0, 5).map((player, index) => (
            <div key={player.id} className={`leaderboard-item ${index < 3 ? 'top' : ''}`}>
              <span className="rank">#{player.rank}</span>
              <span className="name">{player.username}</span>
              <span className="score">{player.score}</span>
            </div>
          ))}
        </div>
      </div>

      {isHost && answerSubmitted && (
        <div className="host-controls">
          {questionIndex < totalQuestions - 1 ? (
            <button 
              className="btn-primary"
              onClick={handleNextQuestion}
            >
              Câu tiếp theo
            </button>
          ) : (
            <button 
              className="btn-secondary"
              onClick={handleEndGame}
            >
              Kết thúc game
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GamePlay;
