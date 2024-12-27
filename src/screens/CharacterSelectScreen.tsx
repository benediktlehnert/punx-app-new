import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SettingsModal from '../components/SettingsModal';
import { Button } from '../components/Button';
import '../styles/CharacterSelectScreen.css';

// Import character images with correct paths
import periodImage from '../assets/characters/peri/peri-default.png';
import exclamationImage from '../assets/characters/ex/ex-default.png';
import questionImage from '../assets/characters/quest/quest-default.png';
import commaImage from '../assets/characters/curly/curly-default.png';

const CharacterSelectScreen = () => {
  const navigate = useNavigate();
  const { setPunctuationType, settings, updateSettings } = useGame();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsOpen = () => setSettingsOpen(true);
  const handleSettingsClose = () => setSettingsOpen(false);

  const handleSettingsChange = (newSettings: Partial<typeof settings>) => {
    updateSettings(newSettings);
  };

  const handleSelect = (type: string) => {
    setPunctuationType(type);
    navigate('/game');
  };

  const handleShuffle = () => {
    const types = ['period', 'exclamation', 'question', 'comma'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    setPunctuationType(randomType);
    navigate('/game');
  };

  return (
    <div className="character-select-screen">
      <header className="select-header">
        <Button onClick={() => navigate('/')}>
          Back
        </Button>
        <Button onClick={handleSettingsOpen}>
          Settings
        </Button>
      </header>

      <main className="select-content">
        <h1 className="select-title">Pick your PUNX</h1>
        
        <div className="character-grid">
          <div className="character-button-container">
            <button 
              className="character-button"
              onClick={() => handleSelect('period')}
            >
              <img src={periodImage} alt="Period" className="character-image-small" />
            </button>
            <span className="label">PERI</span>
          </div>

          <div className="character-button-container">
            <button 
              className="character-button"
              onClick={() => handleSelect('exclamation')}
            >
              <img src={exclamationImage} alt="Exclamation" className="character-image-large" />
            </button>
            <span className="label">EX</span>
          </div>

          <div className="character-button-container">
            <button 
              className="character-button"
              onClick={() => handleSelect('question')}
            >
              <img src={questionImage} alt="Question" className="character-image-large" />
            </button>
            <span className="label">QUEST</span>
          </div>

          <div className="character-button-container">
            <button 
              className="character-button"
              onClick={() => handleSelect('comma')}
            >
              <img src={commaImage} alt="Comma" className="character-image-medium" />
            </button>
            <span className="label">Curly</span>
          </div>
          
          <div className="character-button-container">
            <button 
              className="shuffle-button"
              onClick={handleShuffle}
            >
              <img src={commaImage} alt="Comma" className="character-image-small" />
            </button>
            <span className="label">Shuffle</span>
          </div>
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={handleSettingsClose}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default CharacterSelectScreen; 