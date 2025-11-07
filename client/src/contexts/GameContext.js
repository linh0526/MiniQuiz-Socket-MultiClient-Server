import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { socket } from '../socket';

const GameContext = createContext();

const initialState = {
  roomId: null,
  isHost: false,
  gameState: 'lobby', // lobby, playing, results
  players: [],
  questions: [], // Danh sách câu hỏi từ AdminPanel
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  timeLeft: 0,
  leaderboard: [],
  gameStats: null,
  error: null,
  loading: false
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'ROOM_CREATED':
      return {
        ...state,
        roomId: action.payload.roomId,
        isHost: true,
        loading: false
      };
    
    case 'JOINED_ROOM':
      return {
        ...state,
        roomId: action.payload.roomId,
        isHost: false,
        loading: false
      };
    
    case 'PLAYER_JOINED':
    case 'PLAYER_LEFT':
      return {
        ...state,
        players: action.payload.players
      };
    
    case 'GAME_STARTED':
      return {
        ...state,
        gameState: 'playing',
        totalQuestions: action.payload.totalQuestions,
        questionIndex: 0
      };
    
    case 'QUESTION_STARTED':
      return {
        ...state,
        currentQuestion: action.payload.question,
        questionIndex: action.payload.questionIndex,
        timeLeft: action.payload.timeLimit
      };
    
    case 'QUESTION_TIMEOUT':
      return {
        ...state,
        timeLeft: 0
      };
    
    case 'LEADERBOARD_UPDATE':
      return {
        ...state,
        leaderboard: action.payload
      };
    
        case 'GAME_ENDED':
          return {
            ...state,
            gameState: 'results',
            leaderboard: action.payload.leaderboard,
            gameStats: action.payload.gameStats
          };

        case 'LEFT_ROOM':
          return {
            ...initialState,
            questions: [] // Reset questions khi rời phòng
          };
    
    case 'HOST_CHANGED':
      return {
        ...state,
        isHost: action.payload.newHostId === socket.id
      };
    
    case 'TIMER_TICK':
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - 1)
      };
    
    case 'SET_QUESTIONS':
      return {
        ...state,
        questions: action.payload
      };
    
    case 'ADD_QUESTION':
      return {
        ...state,
        questions: [...state.questions, action.payload]
      };
    
    case 'REMOVE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter((_, index) => index !== action.payload)
      };
    
    case 'CLEAR_QUESTIONS':
      return {
        ...state,
        questions: []
      };
    
    case 'RESET_GAME':
      return {
        ...initialState,
        roomId: state.roomId,
        isHost: state.isHost,
        questions: state.questions // Giữ lại questions khi reset game
      };
    
    case 'GO_BACK_TO_LOBBY':
      return {
        ...state,
        gameState: 'lobby',
        currentQuestion: null,
        questionIndex: 0,
        totalQuestions: 0,
        timeLeft: 0
      };
    
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    // Socket event listeners
    socket.on('room_created', (data) => {
      dispatch({ type: 'ROOM_CREATED', payload: data });
    });

    socket.on('joined_room', (data) => {
      dispatch({ type: 'JOINED_ROOM', payload: data });
    });

    socket.on('player_joined', (data) => {
      dispatch({ type: 'PLAYER_JOINED', payload: data });
    });

    socket.on('player_left', (data) => {
      dispatch({ type: 'PLAYER_LEFT', payload: data });
    });

    socket.on('game_started', (data) => {
      dispatch({ type: 'GAME_STARTED', payload: data });
    });

    socket.on('question_started', (data) => {
      dispatch({ type: 'QUESTION_STARTED', payload: data });
    });

    socket.on('question_timeout', (data) => {
      dispatch({ type: 'QUESTION_TIMEOUT', payload: data });
    });

    socket.on('leaderboard_update', (data) => {
      dispatch({ type: 'LEADERBOARD_UPDATE', payload: data });
    });

    socket.on('game_ended', (data) => {
      dispatch({ type: 'GAME_ENDED', payload: data });
    });

    socket.on('left_room', () => {
      dispatch({ type: 'LEFT_ROOM' });
    });

    socket.on('host_changed', (data) => {
      dispatch({ type: 'HOST_CHANGED', payload: data });
    });

    socket.on('game_reset', (data) => {
      dispatch({ type: 'RESET_GAME' });
    });

    socket.on('error', (data) => {
      dispatch({ type: 'SET_ERROR', payload: data.message });
    });

    return () => {
      socket.off('room_created');
      socket.off('joined_room');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_started');
      socket.off('question_started');
      socket.off('question_timeout');
      socket.off('leaderboard_update');
      socket.off('game_ended');
      socket.off('host_changed');
      socket.off('game_reset');
      socket.off('error');
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (state.gameState === 'playing' && state.timeLeft > 0) {
      interval = setInterval(() => {
        dispatch({ type: 'TIMER_TICK' });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.gameState, state.timeLeft]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
