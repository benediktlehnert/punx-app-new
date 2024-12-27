import React, { createContext, useContext, useState } from 'react';

export interface Settings {
  sound: boolean;
  difficulty: number;
  timer: boolean;
  timeLimit: number;
  showDropZone: boolean;
}

interface GameContextType {
  punctuationType: string;
  setPunctuationType: (type: string) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  sound: true,
  difficulty: 1,
  timer: true,
  timeLimit: 60,
  showDropZone: true
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [punctuationType, setPunctuationType] = useState('');
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return (
    <GameContext.Provider value={{
      punctuationType,
      setPunctuationType,
      settings,
      updateSettings
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
