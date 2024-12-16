import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { sharedButtonStyle } from '../styles/shared';

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  score: {
    correct: number;
    incorrect: number;
  };
}

const GameOverDialog = ({ open, onClose, score }: GameOverDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Game Over!</DialogTitle>
      <DialogContent>
        <Typography>
          Correct: {score.correct}
        </Typography>
        <Typography>
          Incorrect: {score.incorrect}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={sharedButtonStyle}
        >
          Try Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameOverDialog; 