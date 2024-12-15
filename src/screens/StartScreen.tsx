import * as React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh' 
    }}>
      <Button onClick={() => navigate('/select')}>
        Start Game
      </Button>
      <Button onClick={() => navigate('/settings')}>
        Settings
      </Button>
    </Box>
  );
};

export default StartScreen;
