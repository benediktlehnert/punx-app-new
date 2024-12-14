import * as React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
      <Button variant="contained" onClick={() => navigate('/select')}>
        Let's Go!
      </Button>
    </Box>
  );
};

export default StartScreen;
