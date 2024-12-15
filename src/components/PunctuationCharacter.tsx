import * as React from 'react';
import { Paper, useTheme } from '@mui/material';

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
  const theme = useTheme();

  const getCharacterColor = (type: string) => {
    switch (type) {
      case 'period':
        return theme.palette.characters.peri;
      case 'exclamation':
        return theme.palette.characters.ex;
      case 'question':
        return theme.palette.characters.quest;
      case 'comma':
        return theme.palette.characters.curly;
      default:
        return theme.palette.common.white;
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/punctuation', type);
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
        cursor: isDraggable ? 'grab' : 'default',
        backgroundColor: isCorrect === true ? theme.palette.success.main : 
                       isCorrect === false ? theme.palette.error.main : 
                       getCharacterColor(type),
        color: theme.palette.common.white,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: isDraggable ? 'scale(1.1)' : 'none',
          boxShadow: 6,
        },
        '&:active': {
          cursor: isDraggable ? 'grabbing' : 'default',
        }
      }}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      {getCharacter(type)}
    </Paper>
  );
};

const getCharacter = (type: string) => {
  switch (type) {
    case 'period': return '.';
    case 'exclamation': return '!';
    case 'question': return '?';
    case 'comma': return ',';
    default: return '';
  }
};

export default PunctuationCharacter;
