import React, { useState } from "react";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const {
    roomId,
    players,
    isHost,
    gameState,
    socket,
    dispatch,
    loading,
    error,
    questions, // Lấy questions từ context
  } = useGame();

  const navigate = useNavigate();
  const [questionType, setQuestionType] = useState('single'); // single, multiple, order, fill
  const [newQuestion, setNewQuestion] = useState({
    type: 'single',
    text: "",
    answers: [
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
    ],
    correctOrder: [], // Cho câu hỏi sắp xếp
    correctText: "", // Cho câu hỏi điền từ
  });
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const resetQuestionForm = () => {
    setNewQuestion({
      type: questionType,
      text: "",
      answers: [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
      correctOrder: [],
      correctText: "",
    });
  };

  const addQuestion = () => {
    if (!newQuestion.text.trim()) {
      alert("Vui lòng nhập câu hỏi");
      return;
    }

    // Tạo một bản sao của answers để tránh mutation
    const answersCopy = newQuestion.answers.map(a => ({ ...a }));

    // Validation theo từng loại câu hỏi
    if (questionType === 'single' || questionType === 'multiple') {
      const hasCorrectAnswer = answersCopy.some((a) => a.correct);
      if (!hasCorrectAnswer) {
        alert("Vui lòng chọn ít nhất một đáp án đúng");
        return;
      }
      const hasAnswerText = answersCopy.some((a) => a.text.trim());
      if (!hasAnswerText) {
        alert("Vui lòng nhập ít nhất một đáp án");
        return;
      }
    } else if (questionType === 'order') {
      const hasAnswerText = answersCopy.some((a) => a.text.trim());
      if (!hasAnswerText || answersCopy.filter(a => a.text.trim()).length < 2) {
        alert("Vui lòng nhập ít nhất 2 đáp án để sắp xếp");
        return;
      }
    } else if (questionType === 'fill') {
      if (!newQuestion.correctText.trim()) {
        alert("Vui lòng nhập đáp án đúng cho câu hỏi điền từ");
        return;
      }
    }

    // Tạo question object mới với tất cả thông tin cần thiết
    let questionToAdd = {
      type: questionType,
      text: newQuestion.text.trim(),
      answers: answersCopy,
    };

    // Thêm các thuộc tính đặc biệt cho từng loại câu hỏi
    if (questionType === 'order') {
      // Set correctOrder là thứ tự ban đầu (chỉ các đáp án có text)
      const correctOrder = answersCopy
        .map((a, idx) => a.text.trim() ? idx : -1)
        .filter(idx => idx !== -1);
      questionToAdd.correctOrder = correctOrder;
    } else if (questionType === 'fill') {
      questionToAdd.correctText = newQuestion.correctText.trim();
    }

    dispatch({ type: "ADD_QUESTION", payload: questionToAdd });
    resetQuestionForm();
  };

  const handleQuestionTypeChange = (type) => {
    setQuestionType(type);
    const resetForm = {
      type: type,
      text: "",
      answers: [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
      correctOrder: [],
      correctText: "",
    };
    setNewQuestion(resetForm);
  };

  const removeQuestion = (index) => {
    dispatch({ type: "REMOVE_QUESTION", payload: index });
  };

  const updateAnswer = (answerIndex, field, value) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[answerIndex] = {
      ...updatedAnswers[answerIndex],
      [field]: value,
    };
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const toggleCorrectAnswer = (answerIndex) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[answerIndex].correct = !updatedAnswers[answerIndex].correct;
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const createRoom = () => {
    if (!newRoomName.trim()) {
      alert("Vui lòng nhập tên phòng");
      return;
    }

    if (socket) {
      socket.emit("createRoom", { roomName: newRoomName });
      setShowCreateRoom(false);
      setNewRoomName("");
    }
  };

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit("joinRoom", { roomId });
    }
  };

  const goBackToRoom = () => {
    if (roomId) {
      navigate("/");
    } else {
      alert("Bạn chưa ở trong phòng nào");
    }
  };

  const startGame = () => {
    if (questions.length === 0) {
      alert("Vui lòng thêm ít nhất một câu hỏi");
      return;
    }

    if (players.length < 2) {
      alert("Cần ít nhất 2 người chơi để bắt đầu game");
      return;
    }

    if (socket) {
      socket.emit("startGame", { questions });
    }
  };

  const exportQuestions = () => {
    if (questions.length === 0) {
      alert("Chưa có câu hỏi nào để xuất");
      return;
    }

    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `questions-${roomId || "room"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importQuestions = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedQuestions = JSON.parse(e.target.result);
        dispatch({ type: "SET_QUESTIONS", payload: importedQuestions });
        alert(`Đã import ${importedQuestions.length} câu hỏi`);
      } catch (error) {
        alert("File không hợp lệ");
      }
    };
    reader.readAsText(file);
  };

  const clearAllQuestions = () => {
    if (questions.length === 0) {
      alert("Chưa có câu hỏi nào");
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa tất cả câu hỏi?")) {
      dispatch({ type: "CLEAR_QUESTIONS" });
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="app-loading">
          <div className="spinner"></div>
          <p>Đang kết nối...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="app-error">
          <h2>❌ Lỗi kết nối</h2>
          <p>{error}</p>
          <button
            className="btn-primary"
            onClick={() => dispatch({ type: "CLEAR_ERROR" })}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🎛️ Bảng điều khiển Admin</h2>
      </div>

      <div className="admin-content">
        {/* Room Management */}
        <div className="room-management">
          <h3>🏠 Quản lý phòng</h3>

          {!roomId ? (
            <div className="create-room-section">
              {!showCreateRoom ? (
                <button
                  className="btn-primary btn-large"
                  onClick={() => setShowCreateRoom(true)}
                >
                  Tạo phòng mới
                </button>
              ) : (
                <div className="create-room-form">
                  <div className="form-group">
                    <label>Tên phòng:</label>
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Nhập tên phòng..."
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn-primary" onClick={createRoom}>
                      Tạo phòng
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setShowCreateRoom(false);
                        setNewRoomName("");
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="current-room-section">
              <div className="room-status">
                <div className="status-item">
                  <span className="status-label">Phòng:</span>
                  <span className="status-value">{roomId}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Người chơi:</span>
                  <span className="status-value">{players.length}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Trạng thái:</span>
                  <span className="status-value">{gameState}</span>
                </div>
              </div>

              <div className="room-actions">
                <button className="btn-primary" onClick={goBackToRoom}>
                  🔙 Quay lại phòng
                </button>
              </div>
            </div>
          )}
          {roomId && (
            <div className="room-players">
              <h4>👥 Người chơi trong phòng</h4>
              <div className="players-list">
                {players.length === 0 ? (
                  <p className="no-players">Chưa có người chơi nào</p>
                ) : (
                  players.map((player) => (
                    <div key={player.id} className="player-item">
                      <span className="player-name">{player.username}</span>
                      <span className="player-status">
                        {player.isReady ? "✅ Sẵn sàng" : "⏳ Chờ"}
                      </span>
                      {player.isHost && <span className="host-badge">👑</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="game-controls">
            <h3>🎮 Điều khiển game</h3>
            <div className="control-buttons">
              <button
                className="btn-primary"
                onClick={exportQuestions}
                disabled={questions.length === 0}
              >
                📤 Xuất câu hỏi
              </button>
              <label className="btn-secondary file-input-label">
                📥 Import câu hỏi
                <input
                  type="file"
                  accept=".json"
                  onChange={importQuestions}
                  style={{ display: "none" }}
                />
              </label>
              <button className="btn-danger" onClick={clearAllQuestions}>
                🗑️ Xóa tất cả
              </button>
            </div>
          </div>
        </div>
        <div className="questions-management">
          <h3>❓ Quản lý câu hỏi ({questions.length})</h3>

          <div className="add-question-form">
            <h4>Thêm câu hỏi mới</h4>
            
            <div className="form-group">
              <label>Loại câu hỏi:</label>
              <div className="question-type-selector">
                <button
                  type="button"
                  className={`type-btn ${questionType === 'single' ? 'active' : ''}`}
                  onClick={() => handleQuestionTypeChange('single')}
                >
                  🔘 Một đáp án
                </button>
                <button
                  type="button"
                  className={`type-btn ${questionType === 'multiple' ? 'active' : ''}`}
                  onClick={() => handleQuestionTypeChange('multiple')}
                >
                  ☑️ Nhiều đáp án
                </button>
                <button
                  type="button"
                  className={`type-btn ${questionType === 'order' ? 'active' : ''}`}
                  onClick={() => handleQuestionTypeChange('order')}
                >
                  🔢 Sắp xếp
                </button>
                <button
                  type="button"
                  className={`type-btn ${questionType === 'fill' ? 'active' : ''}`}
                  onClick={() => handleQuestionTypeChange('fill')}
                >
                  ✏️ Điền từ
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Câu hỏi:</label>
              <textarea
                value={newQuestion.text}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, text: e.target.value })
                }
                placeholder={questionType === 'fill' ? "Nhập câu hỏi (dùng ___ để đánh dấu chỗ trống)..." : "Nhập câu hỏi..."}
                rows={3}
              />
            </div>

            {questionType === 'fill' ? (
              <div className="form-group">
                <label>Đáp án đúng:</label>
                <input
                  type="text"
                  value={newQuestion.correctText}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, correctText: e.target.value })
                  }
                  placeholder="Nhập đáp án đúng..."
                />
                <p className="form-hint">Ví dụ: Nếu câu hỏi là "Thủ đô của Việt Nam là ___", nhập "Hà Nội"</p>
              </div>
            ) : (
              <div className="answers-form">
                <label>
                  {questionType === 'order' ? 'Các đáp án (sẽ được sắp xếp theo thứ tự này):' : 'Đáp án:'}
                </label>
                {newQuestion.answers.map((answer, index) => (
                  <div key={index} className="answer-input">
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) =>
                        updateAnswer(index, "text", e.target.value)
                      }
                      placeholder={`Đáp án ${index + 1}`}
                    />
                    {(questionType === 'single' || questionType === 'multiple') && (
                      <label className="correct-checkbox">
                        <input
                          type="checkbox"
                          checked={answer.correct}
                          onChange={() => toggleCorrectAnswer(index)}
                        />
                        Đúng
                      </label>
                    )}
                    {questionType === 'order' && (
                      <span className="order-number">{index + 1}</span>
                    )}
                  </div>
                ))}
                {questionType === 'order' && (
                  <p className="form-hint">Người chơi sẽ sắp xếp các đáp án theo thứ tự đúng</p>
                )}
                {questionType === 'multiple' && (
                  <p className="form-hint">Có thể chọn nhiều đáp án đúng</p>
                )}
              </div>
            )}

            <button className="btn-primary" onClick={addQuestion}>
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
                  <div className="question-header">
                    <div className="question-text">
                      <strong>
                        {index + 1}. {question.text}
                      </strong>
                    </div>
                    <span className="question-type-badge">
                      {question.type === 'single' && '🔘 Một đáp án'}
                      {question.type === 'multiple' && '☑️ Nhiều đáp án'}
                      {question.type === 'order' && '🔢 Sắp xếp'}
                      {question.type === 'fill' && '✏️ Điền từ'}
                    </span>
                  </div>
                  {question.type === 'fill' ? (
                    <div className="question-answers">
                      <div className="answer-item correct">
                        Đáp án: {question.correctText}
                      </div>
                    </div>
                  ) : question.type === 'order' ? (
                    <div className="question-answers">
                      {question.answers.filter(a => a.text.trim()).map((answer, answerIndex) => (
                        <div key={answerIndex} className="answer-item">
                          {answerIndex + 1}. {answer.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="question-answers">
                      {question.answers.map((answer, answerIndex) => (
                        <div
                          key={answerIndex}
                          className={`answer-item ${
                            answer.correct ? "correct" : ""
                          }`}
                        >
                          {answer.text}
                          {answer.correct && " ✓"}
                        </div>
                      ))}
                    </div>
                  )}
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
      </div>
    </div>
  );
};

export default AdminPanel;
