import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import StartScreen from './screens/StartScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import GameScreen from './screens/GameScreen';
import { ThemeProvider } from '@mui/material';
import theme from './theme';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GameProvider>
        <Router>
          <Routes>
            <Route path="/" element={<StartScreen />} />
            <Route path="/select" element={<CharacterSelectScreen />} />
            <Route path="/game" element={<GameScreen />} />
          </Routes>
        </Router>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
