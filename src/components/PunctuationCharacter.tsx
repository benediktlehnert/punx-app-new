import * as React from 'react';
import { Box, keyframes } from '@mui/material';

// Import all character images
import periDefault from '../assets/characters/peri/peri-default.png';
import periHappy from '../assets/characters/peri/peri-happy.png';
import periSad from '../assets/characters/peri/peri-sad.png';

import exDefault from '../assets/characters/ex/ex-default.png';
import exHappy from '../assets/characters/ex/ex-happy.png';
import exSad from '../assets/characters/ex/ex-sad.png';

import questDefault from '../assets/characters/quest/quest-default.png';
import questHappy from '../assets/characters/quest/quest-happy.png';
import questSad from '../assets/characters/quest/quest-sad.png';

import curlyDefault from '../assets/characters/curly/curly-default.png';
import curlyHappy from '../assets/characters/curly/curly-happy.png';
import curlySad from '../assets/characters/curly/curly-sad.png';

interface PunctuationCharacterProps {
  type: 'period' | 'exclamation' | 'question' | 'comma';
  isCorrect?: boolean | null;
  onClick: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const characterImages = {
  period: {
    default: periDefault,
    happy: periHappy,
    sad: periSad,
  },
  exclamation: {
    default: exDefault,
    happy: exHappy,
    sad: exSad,
  },
  question: {
    default: questDefault,
    happy: questHappy,
    sad: questSad,
  },
  comma: {
    default: curlyDefault,
    happy: curlyHappy,
    sad: curlySad,
  },
} as const;

const stickerPlacement = keyframes`
  0% {
    transform: translateY(-20px) rotate(-5deg);
    opacity: 0.5;
  }
  60% {
    transform: translateY(5px) rotate(2deg);
  }
  80% {
    transform: translateY(-2px) rotate(-1deg);
  }
  100% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
`;

const PunctuationCharacter = ({ 
  type, 
  isCorrect, 
  onClick, 
  isDraggable,
  onDragStart 
}: PunctuationCharacterProps) => {
  const getCharacterImage = () => {
    const baseName = type.toLowerCase();
    if (isCorrect === true) {
      return characterImages[type].happy;
    } else if (isCorrect === false) {
      return characterImages[type].sad;
    }
    return characterImages[type].default;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/punctuation', type);
    if (onDragStart) onDragStart(e);
  };

  const getCharacterSize = () => {
    switch(type) {
      case 'period':
        return 70;
      case 'comma':
        return 90;
      default:
        return 160;
    }
  };

  const size = getCharacterSize();

  return (
    <Box
      component="div"
      sx={{
        width: size,
        height: size,
        cursor: isDraggable ? 'grab' : 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        margin: 'auto',
        animation: !isDraggable ? `${stickerPlacement} 0.4s ease-out` : 'none',
        '&:hover': {
          transform: isDraggable ? 'scale(1.1)' : 'none',
        },
        '&:active': {
          cursor: isDraggable ? 'grabbing' : 'pointer',
        },
        '& img': {
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          WebkitUserDrag: 'none'
        }
      }}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <img 
        src={getCharacterImage()} 
        alt={type}
      />
    </Box>
  );
};

export default PunctuationCharacter;
