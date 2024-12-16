import * as React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sharedButtonStyle } from '../styles/shared';

const SelectScreen = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        p: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h2" component="h1">
        Select Mode
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate('/game')}
        sx={sharedButtonStyle}
      >
        Start Game
      </Button>
    </Box>
  );
};

export default SelectScreen; 