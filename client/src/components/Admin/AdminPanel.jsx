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
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    answers: [
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
    ],
  });
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const addQuestion = () => {
    if (!newQuestion.text.trim()) {
      alert("Vui lòng nhập câu hỏi");
      return;
    }

    const hasCorrectAnswer = newQuestion.answers.some((a) => a.correct);
    if (!hasCorrectAnswer) {
      alert("Vui lòng chọn ít nhất một đáp án đúng");
      return;
    }

    dispatch({ type: "ADD_QUESTION", payload: { ...newQuestion } });
    setNewQuestion({
      text: "",
      answers: [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    });
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
              <label>Câu hỏi:</label>
              <textarea
                value={newQuestion.text}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, text: e.target.value })
                }
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
                    onChange={(e) =>
                      updateAnswer(index, "text", e.target.value)
                    }
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
                  <div className="question-text">
                    <strong>
                      {index + 1}. {question.text}
                    </strong>
                  </div>
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
