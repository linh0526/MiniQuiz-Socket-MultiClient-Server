import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { socket } from '../../socket';

const GameResults = () => {
  const { leaderboard, gameStats, isHost, roomId } = useGame();

  const handlePlayAgain = () => {
    socket.emit('reset_game', { roomId });
  };

  const handleLeaveRoom = () => {
    socket.emit('leave_room', { roomId });
    window.location.reload();
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankClass = (rank) => {
    if (rank <= 3) return 'top-three';
    return '';
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>🎉 Kết quả game</h1>
        <p>Chúc mừng tất cả người chơi!</p>
      </div>

      <div className="final-leaderboard">
        <h2>Bảng xếp hạng cuối cùng</h2>
        <div className="leaderboard-final">
          {leaderboard.map((player, index) => (
            <div 
              key={player.id} 
              className={`leaderboard-final-item ${getRankClass(player.rank)}`}
            >
              <div className="rank-info">
                <span className="rank-emoji">{getRankEmoji(player.rank)}</span>
                <span className="rank-number">#{player.rank}</span>
              </div>
              
              <div className="player-info">
                <div className="player-name">{player.username}</div>
                <div className="player-stats">
                  <span className="score">Điểm: {player.score}</span>
                  <span className="answers">
                    Đúng: {player.answers.filter(a => a.isCorrect).length}/
                    {player.answers.length}
                  </span>
                </div>
              </div>
              
              <div className="player-score">
                {player.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      {gameStats && (
        <div className="game-stats">
          <h3>Thống kê game</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Tổng người chơi</span>
              <span className="stat-value">{gameStats.playerCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tổng câu hỏi</span>
              <span className="stat-value">{gameStats.totalQuestions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Thời gian chơi</span>
              <span className="stat-value">
                {Math.floor((Date.now() - new Date(gameStats.createdAt)) / 60000)} phút
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="results-actions">
        {isHost && (
          <button 
            className="btn-primary btn-large"
            onClick={handlePlayAgain}
          >
            Chơi lại
          </button>
        )}
        
        <button 
          className="btn-secondary btn-large"
          onClick={handleLeaveRoom}
        >
          Rời phòng
        </button>
      </div>

      <div className="share-section">
        <h3>Chia sẻ kết quả</h3>
        <div className="share-buttons">
          <button 
            className="btn-share"
            onClick={() => {
              const text = `Tôi vừa chơi Quiz Game và đạt ${leaderboard.find(p => p.id === socket.id)?.score || 0} điểm! 🎮`;
              navigator.clipboard.writeText(text);
              alert('Đã copy link chia sẻ!');
            }}
          >
            📋 Copy kết quả
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResults;
