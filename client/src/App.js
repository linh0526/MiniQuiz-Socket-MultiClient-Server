import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useSearchParams,
  useLocation
} from 'react-router-dom';
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
import { socket } from './socket';

function GameApp() {
  const { roomId, gameState, loading, error, dispatch } = useGame();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const routeRoomId = params.roomId;
  const autoJoinNameParam = useMemo(() => {
    const name = searchParams.get('name');
    return name ? name.trim() : '';
  }, [searchParams]);

  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [nameError, setNameError] = useState('');
  const [joinInitiated, setJoinInitiated] = useState(false);
  const [hasPrefilledName, setHasPrefilledName] = useState(false);

  useEffect(() => {
    const shouldPrompt = !!routeRoomId && !roomId;
    setShowNamePrompt(shouldPrompt);
    setJoinInitiated(false);
    setNameError('');
    setHasPrefilledName(false);
    if (!routeRoomId) {
      setPendingName('');
    }
  }, [routeRoomId, roomId, location.key]);

  useEffect(() => {
    if (!showNamePrompt) {
      return;
    }

    if (hasPrefilledName) {
      return;
    }

    const storedName = (() => {
      try {
        return localStorage.getItem('quizUsername') || '';
      } catch {
        return '';
      }
    })();

    const defaultName = autoJoinNameParam || storedName.trim();
    if (defaultName) {
      setPendingName(defaultName);
      setHasPrefilledName(true);
    }
  }, [showNamePrompt, autoJoinNameParam, hasPrefilledName]);

  useEffect(() => {
    if (!error) {
      return;
    }

    if (showNamePrompt) {
      setJoinInitiated(false);
      setNameError(error);
      dispatch({ type: 'CLEAR_ERROR' });
    }
  }, [error, showNamePrompt, dispatch]);

  useEffect(() => {
    if (roomId && routeRoomId && roomId === routeRoomId) {
      setShowNamePrompt(false);
      setNameError('');
    }
  }, [roomId, routeRoomId]);

  useEffect(() => {
    if (!showNamePrompt) {
      return;
    }
    try {
      const stored = localStorage.getItem('quizUsername');
      if (stored) {
        setPendingName((prev) => (prev ? prev : stored));
      }
    } catch {
      // ignore
    }
  }, [showNamePrompt]);

  const handleJoinWithPrompt = () => {
    if (joinInitiated) {
      return;
    }

    const trimmedName = pendingName.trim();
    if (!trimmedName) {
      setNameError('Vui lòng nhập tên của bạn');
      return;
    }
    setNameError('');
    try {
      localStorage.setItem('quizUsername', trimmedName);
    } catch {
      // ignore
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    socket.emit('join_room', { roomId: routeRoomId, username: trimmedName });
    setJoinInitiated(true);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Đang kết nối...</p>
      </div>
    );
  }

  if (error && !showNamePrompt) {
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
        {showNamePrompt && !roomId ? (
          <div className="homepage-container auto-join-container">
            <div className="homepage-header">
              <h1>🎮 Quiz Game</h1>
              <p>Bạn được mời tham gia phòng {routeRoomId}</p>
            </div>
            <div className="join-section">
              <div className="join-room-section">
                <h3>Nhập tên để tham gia phòng</h3>
                <p>Mời bạn nhập tên và tham gia ngay</p>
                <div className="room-form">
                  <div className="form-group">
                    <label>Tên của bạn:</label>
                    <input
                      type="text"
                      value={pendingName}
                      onChange={(e) => {
                        setPendingName(e.target.value);
                        if (!hasPrefilledName) {
                          setHasPrefilledName(true);
                        }
                        if (nameError) {
                          setNameError('');
                        }
                      }}
                      placeholder="Nhập tên của bạn..."
                      maxLength={20}
                      autoFocus
                    />
                    {nameError && (
                      <span className="input-error-text">{nameError}</span>
                    )}
                  </div>
                  <button
                    className="btn-primary btn-large"
                    onClick={handleJoinWithPrompt}
                  >
                    Tham gia phòng {routeRoomId}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {!roomId && <HomePage />}
            {roomId && gameState === 'lobby' && <Lobby />}
            {roomId && gameState === 'playing' && <GamePlay />}
            {roomId && gameState === 'results' && <GameResults />}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <GameProvider>
            <Routes>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/join/:roomId" element={<GameApp />} />
              <Route path="/" element={<GameApp />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </GameProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

