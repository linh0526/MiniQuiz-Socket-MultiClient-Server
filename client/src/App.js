import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Header from './components/Common/Header';
import HomePage from './components/Home/HomePage';
import Lobby from './components/Game/Lobby';
import GamePlay from './components/Game/GamePlay';
import GameResults from './components/Game/GameResults';
import AdminPanel from './components/Admin/AdminPanel';
import { useGame } from './contexts/GameContext';
import './UI/App.css';
import './UI/Admin.css';
import './UI/HomePage.css';
import './UI/dark.css';

function GameApp() {
  const { roomId, gameState, loading, error, dispatch } = useGame();

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
        {!roomId && <HomePage />}
        {roomId && gameState === 'lobby' && <Lobby />}
        {roomId && gameState === 'playing' && <GamePlay />}
        {roomId && gameState === 'results' && <GameResults />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/admin" element={
              <GameProvider>
                <AdminPanel />
              </GameProvider>
            } />
            <Route path="" element={
              <GameProvider>
                <GameApp />
              </GameProvider>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

