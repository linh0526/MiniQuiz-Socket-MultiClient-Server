import React from 'react';
import { useGame } from '../../contexts/GameContext';

const Header = () => {
  const { roomId, players, gameState, isHost } = useGame();

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

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>🎮 Quiz Game</h1>
          {roomId && (
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
          {roomId && (
            <div className="players-count">
              👥 {players.length} người chơi
            </div>
          )}
          
          {isHost && (
            <div className="host-badge">
              👑 Host
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
