import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Button as CustomButton } from '../components/Button';
import startImage from '../assets/images/punx-start.png';

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        p: 4,
        textAlign: 'center'
      }}
    >
      <img 
        src={startImage} 
        alt="Punctuation Game"
        style={{
          maxWidth: '100%',
          height: 'auto',
          marginBottom: '3rem'
        }}
      />
      
      <CustomButton onClick={() => navigate('/select')}>
        Start Game
      </CustomButton>
    </Box>
  );
};

export default StartScreen;
