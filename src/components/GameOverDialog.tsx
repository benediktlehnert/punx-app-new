import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Button 
} from '@mui/material';

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  score: {
    correct: number;
    incorrect: number;
  };
}

const GameOverDialog: React.FC<GameOverDialogProps> = ({ 
  open, 
  onClose, 
  onRestart, 
  score 
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h4" sx={{ mb: 2 }}>Time's Up!</Typography>
        <Typography variant="h6" sx={{ color: 'success.main', mb: 1 }}>
          Correct Answers: {score.correct}
        </Typography>
        <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
          Incorrect Answers: {score.incorrect}
        </Typography>
        <Typography variant="body1">
          {score.correct > score.incorrect 
            ? "Great job! You're getting really good at this!" 
            : "Keep practicing, you're getting better!"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onRestart}>Play Again</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameOverDialog; 