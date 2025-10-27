import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Lấy theme từ localStorage hoặc mặc định là light mode
    const savedTheme = localStorage.getItem('quiz-game-theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Lưu theme vào localStorage khi thay đổi
    localStorage.setItem('quiz-game-theme', isDarkMode ? 'dark' : 'light');
    
    // Thêm class vào body để áp dụng theme
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
