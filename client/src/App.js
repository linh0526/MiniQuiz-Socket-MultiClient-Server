import React from 'react';
import { GameProvider } from './contexts/GameContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Header from './components/Common/Header';
import Lobby from './components/Game/Lobby';
import GamePlay from './components/Game/GamePlay';
import GameResults from './components/Game/GameResults';
import { useGame } from './contexts/GameContext';
import './App.css';

function AppContent() {
  const { gameState, loading, error, dispatch } = useGame();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Đang kết nối...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>❌ Lỗi kết nối</h2>
        <p>{error}</p>
        <button 
          className="btn-primary"
          onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      <main className="app-main">
        {gameState === 'lobby' && <Lobby />}
        {gameState === 'playing' && <GamePlay />}
        {gameState === 'results' && <GameResults />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;

