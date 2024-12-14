import React, { createContext, useContext, useState } from 'react';

type GameMode = 'free' | 'timed';
type PunctuationType = 'period' | 'exclamation' | 'question' | 'comma' | 'shuffle';
type Difficulty = 'smart' | 'smarter';

interface GameContextType {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  punctuationType: PunctuationType;
  setPunctuationType: (type: PunctuationType) => void;
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  settings: {
    sound: boolean;
    difficulty: number;
    timer: boolean;
    timeLimit: number;
  };
  setSettings: (settings: any) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<GameMode>('free');
  const [punctuationType, setPunctuationType] = useState<PunctuationType>('period');
  const [language, setLanguage] = useState('en');
  const [difficulty, setDifficulty] = useState<Difficulty>('smart');
  const [settings, setSettings] = useState({
    sound: true,
    difficulty: 1,
    timer: false,
    timeLimit: 60
  });

  return (
    <GameContext.Provider value={{
      mode,
      setMode,
      punctuationType,
      setPunctuationType,
      language,
      setLanguage,
      difficulty,
      setDifficulty,
      settings,
      setSettings
    }}>
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
