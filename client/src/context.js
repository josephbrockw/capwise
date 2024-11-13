import React, { createContext, useContext } from 'react';
import config from './config';

const SettingsContext = createContext(config);

export const SettingsProvider = ({ children }) => {
  return (
    <SettingsContext.Provider value={config}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
