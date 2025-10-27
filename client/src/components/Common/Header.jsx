import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../contexts/ThemeContext';
import { socket } from '../../socket';

const Header = () => {
  const { roomId, players, gameState, isHost } = useGame();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const getGameStateText = () => {
    switch (gameState) {
      case 'lobby': return 'Đang chờ';
      case 'playing': return 'Đang chơi';
      case 'results': return 'Kết quả';
      default: return 'Lobby';
    }
  };

  const getGameStateColor = () => {
    switch (gameState) {
      case 'lobby': return '#f39c12';
      case 'playing': return '#27ae60';
      case 'results': return '#8e44ad';
      default: return '#3498db';
    }
  };

  const handleHomeClick = (e) => {
    // Nếu đang ở trang chủ và có roomId, không làm gì
    if (location.pathname === '/home' && roomId) {
      e.preventDefault();
      return;
    }
    
    // Nếu đang ở trang khác và có roomId, hỏi có muốn rời phòng không
    if (location.pathname !== '/home' && roomId) {
      e.preventDefault();
      if (window.confirm('Bạn có muốn rời phòng để về trang chủ?')) {
        socket.emit('leave_room', { roomId });
        navigate('/home');
      }
      return;
    }
    
    // Nếu không có roomId, cho phép navigate bình thường
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/home" className="header-title" onClick={handleHomeClick}>
            <h1>🎮 Quiz Game</h1>
          </Link>
          {roomId && (location.pathname === '/' || location.pathname === '/home') && (
            <div className="room-info">
              <span className="room-id">Phòng: {roomId}</span>
              <span 
                className="game-state"
                style={{ color: getGameStateColor() }}
              >
                {getGameStateText()}
              </span>
            </div>
          )}
        </div>

        <div className="header-right">
          <nav className="header-nav">
            <Link 
              to="/home" 
              className={`nav-link ${location.pathname === '/lobby' ? 'active' : ''}`}
            >
              🏠 Trang chủ
            </Link>
            {roomId && (
              <Link 
                to="/admin" 
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                ⚙️ Admin
              </Link>
            )}
          </nav>

          <div className="header-info">
            {roomId && (location.pathname === '/' || location.pathname === '/lobby') && (
              <div className="players-count">
                👥 {players.length} người chơi
              </div>
            )}
            
            {isHost && (location.pathname === '/' || location.pathname === '/lobby') && (
              <div className="host-badge">
                👑 Host
              </div>
            )}
            
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
