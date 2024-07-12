import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [loggedIn, setIsLoggedIn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <AppContext.Provider value={{ isGuest, setIsGuest, loggedIn, setIsLoggedIn, gameStarted, setGameStarted }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
