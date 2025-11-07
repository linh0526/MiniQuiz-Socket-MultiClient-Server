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
  const [selectedAnswers, setSelectedAnswers] = useState([]); // Cho multiple choice
  const [orderedAnswers, setOrderedAnswers] = useState([]); // Cho order
  const [fillText, setFillText] = useState(''); // Cho fill in the blank
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setFillText('');
      setAnswerSubmitted(false);
      setAnswerResult(null);
      setStartTime(Date.now());
      
      // Khởi tạo orderedAnswers cho câu hỏi sắp xếp
      const questionType = currentQuestion.type || 'single';
      if (questionType === 'order') {
        const validAnswers = currentQuestion.answers
          .map((a, idx) => ({ text: a.text, index: idx }))
          .filter(a => a.text.trim());
        // Shuffle để người chơi sắp xếp lại
        const shuffled = [...validAnswers].sort(() => Math.random() - 0.5);
        setOrderedAnswers(shuffled);
      } else {
        setOrderedAnswers([]);
      }
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
    const questionType = currentQuestion.type || 'single';
    if (questionType === 'multiple') {
      // Toggle multiple selection
      setSelectedAnswers(prev => 
        prev.includes(answerIndex) 
          ? prev.filter(i => i !== answerIndex)
          : [...prev, answerIndex]
      );
    } else {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleOrderMove = (index, direction) => {
    if (answerSubmitted) return;
    const newOrder = [...orderedAnswers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      setOrderedAnswers(newOrder);
    }
  };

  const handleSubmitAnswer = () => {
    if (answerSubmitted) return;
    
    let answerData = null;
    
    const questionType = currentQuestion.type || 'single';
    
    if (questionType === 'single') {
      if (selectedAnswer === null) return;
      answerData = selectedAnswer;
    } else if (questionType === 'multiple') {
      if (selectedAnswers.length === 0) return;
      answerData = selectedAnswers;
    } else if (questionType === 'order') {
      if (orderedAnswers.length === 0) return;
      answerData = orderedAnswers.map(a => a.index);
    } else if (questionType === 'fill') {
      if (!fillText.trim()) return;
      answerData = fillText.trim();
    }
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setAnswerSubmitted(true);
    
    socket.emit('submit_answer', {
      roomId: roomId,
      questionIndex,
      answer: answerData,
      questionType: questionType,
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
        {(() => {
          const questionType = currentQuestion.type || 'single';
          
          return (
            <>
              <div className="question-type-indicator">
                {questionType === 'single' && '🔘 Một đáp án đúng'}
                {questionType === 'multiple' && '☑️ Nhiều đáp án đúng'}
                {questionType === 'order' && '🔢 Sắp xếp theo thứ tự'}
                {questionType === 'fill' && '✏️ Điền từ vào chỗ trống'}
              </div>
              
              <h2 className="question-text">
                {questionType === 'fill' 
                  ? currentQuestion.text.replace(/___/g, '______')
                  : currentQuestion.text
                }
              </h2>
              
              {questionType === 'fill' ? (
          <div className="fill-answer-form">
            <input
              type="text"
              value={fillText}
              onChange={(e) => setFillText(e.target.value)}
              placeholder="Nhập đáp án..."
              disabled={answerSubmitted}
              className="fill-input"
            />
          </div>
        ) : questionType === 'order' ? (
          <div className="order-answers-list">
            {orderedAnswers.map((answerItem, index) => (
              <div key={index} className="order-item">
                <div className="order-controls">
                  <button
                    className="order-btn"
                    onClick={() => handleOrderMove(index, 'up')}
                    disabled={answerSubmitted || index === 0}
                  >
                    ↑
                  </button>
                  <button
                    className="order-btn"
                    onClick={() => handleOrderMove(index, 'down')}
                    disabled={answerSubmitted || index === orderedAnswers.length - 1}
                  >
                    ↓
                  </button>
                </div>
                <div className="order-content">
                  <span className="order-number">{index + 1}.</span>
                  <span className="order-text">{answerItem.text}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`answers-grid ${questionType === 'multiple' ? 'multiple-grid' : ''}`}>
            {currentQuestion.answers.filter(a => a.text.trim()).map((answer, index) => {
              let className = 'answer-button';
              
              if (questionType === 'multiple') {
                if (selectedAnswers.includes(index)) {
                  className += ' selected';
                }
              } else {
                if (selectedAnswer === index) {
                  className += ' selected';
                }
              }
              
              if (answerSubmitted) {
                if (answer.correct) {
                  className += ' correct';
                } else if (
                  (questionType === 'single' && selectedAnswer === index) ||
                  (questionType === 'multiple' && selectedAnswers.includes(index))
                ) {
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
                  {questionType === 'multiple' && selectedAnswers.includes(index) && ' ✓'}
                </button>
              );
            })}
          </div>
        )}

              {!answerSubmitted && (
                <button 
                  className="btn-primary btn-large"
                  onClick={handleSubmitAnswer}
                  disabled={
                    (questionType === 'single' && selectedAnswer === null) ||
                    (questionType === 'multiple' && selectedAnswers.length === 0) ||
                    (questionType === 'fill' && !fillText.trim()) ||
                    (questionType === 'order' && orderedAnswers.length === 0)
                  }
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
            </>
          );
        })()}
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
