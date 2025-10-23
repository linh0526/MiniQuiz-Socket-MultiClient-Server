import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { socket } from '../../socket';

const Lobby = () => {
  const { roomId, players, isHost, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('create');
  const [createUsername, setCreateUsername] = useState('');
  const [joinUsername, setJoinUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    if (!createUsername.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Vui lòng nhập tên' });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    socket.emit('create_room', { username: createUsername });
  };

  const handleJoinRoom = () => {
    if (!joinUsername.trim() || !roomCode.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Vui lòng nhập tên và mã phòng' });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    socket.emit('join_room', { roomId: roomCode, username: joinUsername });
  };

  const handleStartGame = () => {
    // Sample questions - trong thực tế sẽ lấy từ API hoặc database
    const sampleQuestions = [
      {
        text: "React là gì?",
        answers: [
          { text: "Một thư viện JavaScript", correct: true },
          { text: "Một framework JavaScript", correct: false },
          { text: "Một ngôn ngữ lập trình", correct: false },
          { text: "Một database", correct: false }
        ]
      },
      {
        text: "Node.js chạy trên môi trường nào?",
        answers: [
          { text: "Browser", correct: false },
          { text: "Server", correct: true },
          { text: "Mobile", correct: false },
          { text: "Desktop", correct: false }
        ]
      },
      {
        text: "Socket.io dùng để làm gì?",
        answers: [
          { text: "Real-time communication", correct: true },
          { text: "Database management", correct: false },
          { text: "File storage", correct: false },
          { text: "Authentication", correct: false }
        ]
      }
    ];

    socket.emit('start_game', { roomId, questions: sampleQuestions });
  };

  if (!roomId) {
    return (
      <div className="lobby-container">
        <div className="lobby-header">
          <h1>🎮 Quiz Game</h1>
          <p>Chọn cách tham gia</p>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            🏠 Tạo phòng
          </button>
          <button 
            className={`tab-button ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            🚪 Tham gia phòng
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'create' && (
            <div className="create-room-section">
              <h3>🏠 Tạo phòng mới</h3>
              <p>Tạo phòng và mời bạn bè tham gia</p>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                />
              </div>
              <button 
                className="btn-primary btn-large"
                onClick={handleCreateRoom}
                disabled={!createUsername.trim()}
              >
                Tạo phòng
              </button>
            </div>
          )}

          {activeTab === 'join' && (
            <div className="join-room-section">
              <h3>🚪 Tham gia phòng</h3>
              <p>Nhập mã phòng để tham gia</p>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  value={joinUsername}
                  onChange={(e) => setJoinUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nhập mã phòng"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
              </div>
              <button 
                className="btn-secondary btn-large"
                onClick={handleJoinRoom}
                disabled={!joinUsername.trim() || !roomCode.trim()}
              >
                Tham gia
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h2>Phòng: {roomId}</h2>
        <p>Đang chờ người chơi...</p>
      </div>

      <div className="players-list">
        <h3>Người chơi ({players.length})</h3>
        <div className="players-grid">
          {players.map((player) => (
            <div key={player.id} className="player-card">
              <div className="player-avatar">
                {player.username.charAt(0).toUpperCase()}
              </div>
              <div className="player-info">
                <span className="player-name">{player.username}</span>
                {player.id === socket.id && (
                  <span className="player-you">(Bạn)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="host-controls">
          <button 
            className="btn-primary btn-large"
            onClick={handleStartGame}
            disabled={players.length < 2}
          >
            Bắt đầu game ({players.length}/2+)
          </button>
          <p className="start-hint">
            Cần ít nhất 2 người chơi để bắt đầu
          </p>
        </div>
      )}

      {!isHost && (
        <div className="waiting-message">
          <p>⏳ Đang chờ host bắt đầu game...</p>
        </div>
      )}
    </div>
  );
};

export default Lobby;
