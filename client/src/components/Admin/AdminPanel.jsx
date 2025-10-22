import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';

const AdminPanel = () => {
  const { roomId, players, isHost } = useGame();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    answers: [
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false }
    ]
  });

  const addQuestion = () => {
    if (!newQuestion.text.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    const hasCorrectAnswer = newQuestion.answers.some(a => a.correct);
    if (!hasCorrectAnswer) {
      alert('Vui lòng chọn ít nhất một đáp án đúng');
      return;
    }

    setQuestions([...questions, { ...newQuestion }]);
    setNewQuestion({
      text: '',
      answers: [
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false }
      ]
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateAnswer = (answerIndex, field, value) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[answerIndex] = {
      ...updatedAnswers[answerIndex],
      [field]: value
    };
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const toggleCorrectAnswer = (answerIndex) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[answerIndex].correct = !updatedAnswers[answerIndex].correct;
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  if (!isHost) {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h3>🚫 Không có quyền truy cập</h3>
          <p>Chỉ host mới có thể truy cập bảng điều khiển</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🎛️ Bảng điều khiển Host</h2>
        <p>Phòng: {roomId}</p>
      </div>

      <div className="admin-content">
        <div className="players-management">
          <h3>👥 Quản lý người chơi ({players.length})</h3>
          <div className="players-list">
            {players.map((player) => (
              <div key={player.id} className="player-item">
                <span className="player-name">{player.username}</span>
                <span className="player-status">
                  {player.isReady ? '✅ Sẵn sàng' : '⏳ Chờ'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="questions-management">
          <h3>❓ Quản lý câu hỏi ({questions.length})</h3>
          
          <div className="add-question-form">
            <h4>Thêm câu hỏi mới</h4>
            <div className="form-group">
              <label>Câu hỏi:</label>
              <textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                placeholder="Nhập câu hỏi..."
                rows={3}
              />
            </div>

            <div className="answers-form">
              <label>Đáp án:</label>
              {newQuestion.answers.map((answer, index) => (
                <div key={index} className="answer-input">
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => updateAnswer(index, 'text', e.target.value)}
                    placeholder={`Đáp án ${index + 1}`}
                  />
                  <label className="correct-checkbox">
                    <input
                      type="checkbox"
                      checked={answer.correct}
                      onChange={() => toggleCorrectAnswer(index)}
                    />
                    Đúng
                  </label>
                </div>
              ))}
            </div>

            <button 
              className="btn-primary"
              onClick={addQuestion}
            >
              Thêm câu hỏi
            </button>
          </div>

          <div className="questions-list">
            <h4>Câu hỏi đã thêm:</h4>
            {questions.length === 0 ? (
              <p className="no-questions">Chưa có câu hỏi nào</p>
            ) : (
              questions.map((question, index) => (
                <div key={index} className="question-item">
                  <div className="question-text">
                    <strong>{index + 1}. {question.text}</strong>
                  </div>
                  <div className="question-answers">
                    {question.answers.map((answer, answerIndex) => (
                      <div 
                        key={answerIndex} 
                        className={`answer-item ${answer.correct ? 'correct' : ''}`}
                      >
                        {answer.text}
                        {answer.correct && ' ✓'}
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn-danger btn-small"
                    onClick={() => removeQuestion(index)}
                  >
                    Xóa
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="game-controls">
          <h3>🎮 Điều khiển game</h3>
          <div className="control-buttons">
            <button 
              className="btn-primary btn-large"
              disabled={questions.length === 0 || players.length < 2}
            >
              Bắt đầu game
            </button>
            <button 
              className="btn-secondary"
              disabled={true}
            >
              Tạm dừng
            </button>
            <button 
              className="btn-danger"
              disabled={true}
            >
              Kết thúc game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
