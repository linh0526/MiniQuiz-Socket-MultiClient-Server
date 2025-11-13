import React, { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { socket } from '../../socket';

const HomePage = () => {
  const { roomId, players, isHost, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('create');
  const getStoredUsername = () => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('quizUsername') || '';
    } catch {
      return '';
    }
  };
  const [createUsername, setCreateUsername] = useState(() => getStoredUsername());
  const [joinUsername, setJoinUsername] = useState(() => getStoredUsername());
  const [roomCode, setRoomCode] = useState('');

  // No need to redirect - GameApp will handle the display logic

  const handleCreateRoom = () => {
    if (!createUsername.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Vui lòng nhập tên' });
      return;
    }

    try {
      localStorage.setItem('quizUsername', createUsername.trim());
    } catch {
      // ignore
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    socket.emit('create_room', { username: createUsername });
  };

  const handleJoinRoom = () => {
    if (!joinUsername.trim() || !roomCode.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }
    
    try {
      localStorage.setItem('quizUsername', joinUsername.trim());
    } catch {
      // ignore
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    socket.emit('join_room', { roomId: roomCode, username: joinUsername });
  };

  // Trang chủ khi chưa có phòng
  return (
    <div className="homepage-container">
      <div className="homepage-header">
        <h1>🎮 Quiz Game</h1>
        <p>Trò chơi đố vui thú vị và hấp dẫn!</p>
      </div>

      <div className="homepage-content">
        <div className="game-intro">
          <div className="intro-card">
            <h2>🎯 Cách chơi</h2>
            <ul>
              <li>📝 Tạo phòng hoặc tham gia phòng có sẵn</li>
              <li>❓ Trả lời các câu hỏi trong thời gian quy định</li>
              <li>🏆 Cạnh tranh với bạn bè và giành chiến thắng</li>
              <li>📊 Xem bảng xếp hạng và thống kê</li>
            </ul>
          </div>
          
          <div className="intro-card">
            <h2>✨ Tính năng</h2>
            <ul>
              <li>🎨 Giao diện đẹp mắt theo phong cách Comic Book</li>
              <li>⚡ Kết nối real-time với Socket.IO</li>
              <li>📱 Responsive trên mọi thiết bị</li>
              <li>🎛️ Admin Panel để quản lý câu hỏi</li>
            </ul>
          </div>
        </div>

        <div className="join-section">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              Tạo phòng
            </button>
            <button 
              className={`tab-button ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveTab('join')}
            >
              Tham gia phòng
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'create' ? (
              <div className="create-room-section">
                <h3>Tạo phòng mới</h3>
                <p>Nhập tên của bạn để tạo phòng và mời bạn bè tham gia</p>
                
                <div className="room-form">
                  <div className="form-group">
                    <label>Tên của bạn:</label>
                    <input
                      type="text"
                      value={createUsername}
                      onChange={(e) => setCreateUsername(e.target.value)}
                      placeholder="Nhập tên của bạn..."
                      maxLength={20}
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
              </div>
            ) : (
              <div className="join-room-section">
                <h3>Tham gia phòng</h3>
                <p>Nhập mã phòng và tên của bạn để tham gia</p>
                
                <div className="room-form">
                  <div className="form-group">
                    <label>Tên của bạn:</label>
                    <input
                      type="text"
                      value={joinUsername}
                      onChange={(e) => setJoinUsername(e.target.value)}
                      placeholder="Nhập tên của bạn..."
                      maxLength={20}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Mã phòng:</label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => {
                        // Chỉ cho phép nhập số và tối đa 6 ký tự
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setRoomCode(value);
                      }}
                      placeholder="Nhập mã phòng (6 số)..."
                      maxLength={6}
                    />
                  </div>
                  
                  <button 
                    className="btn-secondary btn-large"
                    onClick={handleJoinRoom}
                    disabled={!joinUsername.trim() || !roomCode.trim()}
                  >
                    Tham gia phòng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
