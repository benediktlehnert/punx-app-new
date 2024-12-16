import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Button as CustomButton } from '../components/Button';

const SelectScreen = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          padding: 2,
          backgroundColor: 'white',
          zIndex: 10,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">Select Mode</Typography>
        <CustomButton onClick={() => navigate('/game')}>
          Start Game
        </CustomButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        {/* Content */}
      </Box>
    </Box>
  );
};

export default SelectScreen; 