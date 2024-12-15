import * as React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

export const Button = ({ children, ...props }: ButtonProps) => (
  <MuiButton
    variant="contained"
    {...props}
    sx={{
      fontFamily: '"Rethink Sans", Arial, sans-serif',
      fontWeight: 800,
      fontSize: '20px',
      padding: '8px 24px',
      borderRadius: '20px',
      backgroundColor: 'common.black',
      color: 'common.white',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'common.black',
        transform: 'scale(1.1)',
      },
      ...props.sx
    }}
  >
    {children}
  </MuiButton>
); 