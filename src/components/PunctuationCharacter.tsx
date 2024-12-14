import * as React from 'react';
import { Box, Paper } from '@mui/material';

interface PunctuationCharacterProps {
  type: string;
  isCorrect?: boolean | null;
  onClick: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const PunctuationCharacter = ({ 
  type, 
  isCorrect, 
  onClick, 
  isDraggable,
  onDragStart 
}: PunctuationCharacterProps) => {
  const getCharacter = () => {
    switch (type) {
      case 'period': return '.';
      case 'exclamation': return '!';
      case 'question': return '?';
      case 'comma': return ',';
      default: return '';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', type);
    if (onDragStart) onDragStart(e);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        cursor: 'pointer',
        backgroundColor: isCorrect === true ? '#4caf50' : 
                       isCorrect === false ? '#f44336' : '#fff',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        }
      }}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      {getCharacter()}
    </Paper>
  );
};

export default PunctuationCharacter;
