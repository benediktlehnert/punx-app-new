import React from 'react';
import { Box, Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StartScreenContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  padding: '20px',
});

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <StartScreenContainer>
      <img src="/logo.png" alt="Meet The Punx" />
      <Button 
        variant="contained" 
        size="large"
        onClick={() => navigate('/game')}
      >
        Let's Go!
      </Button>
    </StartScreenContainer>
  );
};

export default StartScreen;
