import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GameScreen = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2 }}>
      <h1>Game Screen</h1>
      <Button onClick={() => navigate('/')}>
        Back to Start
      </Button>
    </Box>
  );
};

export default GameScreen;
