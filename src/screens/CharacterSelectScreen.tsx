import * as React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsModal from '../components/SettingsModal';

const characters = [
  { id: 'period', name: 'Peri', type: 'period' },
  { id: 'exclamation', name: 'Ex', type: 'exclamation' },
  { id: 'question', name: 'Quest', type: 'question' },
  { id: 'comma', name: 'Curly', type: 'comma' },
  { id: 'shuffle', name: 'Shuffle', type: 'shuffle' }
];

const CharacterSelectScreen = () => {
  const navigate = useNavigate();
  const { setPunctuationType, settings, setSettings } = useGame();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsOpen = () => setSettingsOpen(true);
  const handleSettingsClose = () => setSettingsOpen(false);
  const handleSettingsChange = (newSettings: any) => {
    setSettings(newSettings);
  };

  const handleCharacterSelect = (type: string) => {
    setPunctuationType(type as any);
    navigate('/game');
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
      <Button 
        onClick={() => navigate('/')} 
        sx={{ position: 'absolute', top: 16, left: 16 }}
      >
        Back
      </Button>

      <Button
        onClick={handleSettingsOpen}
        sx={{ position: 'absolute', top: 16, right: 16 }}
      >
        <SettingsIcon />
      </Button>

      <Typography variant="h4" sx={{ mb: 4 }}>
        Choose Your Character
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {characters.map((character) => (
          <Grid item key={character.id}>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleCharacterSelect(character.type)}
              sx={{ minWidth: 120 }}
            >
              {character.name}
            </Button>
          </Grid>
        ))}
      </Grid>

      <SettingsModal
        open={settingsOpen}
        onClose={handleSettingsClose}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </Box>
  );
};

export default CharacterSelectScreen; 