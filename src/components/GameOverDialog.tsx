import React from 'react';
import { Button as CustomButton } from './Button';

interface GameOverDialogProps {
  score: {
    correct: number;
    incorrect: number;
  };
  onClose: () => void;
  onRestart: () => void;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({ score, onClose, onRestart }) => {
  const total = score.correct + score.incorrect;
  const percentage = total > 0 ? Math.round((score.correct / total) * 100) : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
      }}>
        <h2 style={{ marginTop: 0 }}>Game Over!</h2>
        <p>Your score: {score.correct} out of {total} ({percentage}%)</p>
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          marginTop: '24px',
        }}>
          <CustomButton onClick={onRestart}>
            Play Again
          </CustomButton>
          <CustomButton onClick={onClose}>
            Close
          </CustomButton>
        </div>
      </div>
    </div>
  );
}; 