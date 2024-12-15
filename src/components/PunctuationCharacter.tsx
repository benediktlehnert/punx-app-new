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
  onSelect?: (type: 'period' | 'exclamation' | 'question' | 'comma') => void;
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
  onDragStart,
  onSelect 
}: PunctuationCharacterProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [touchPosition, setTouchPosition] = React.useState({ x: 0, y: 0 });

  const getCharacterImage = () => {
    const baseName = type.toLowerCase();
    if (isCorrect === true) {
      return characterImages[type].happy;
    } else if (isCorrect === false) {
      return characterImages[type].sad;
    }
    return characterImages[type].default;
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/punctuation', type);
    if (onDragStart) {
      onDragStart(e);
    }
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDraggable) return;
    
    const touch = e.touches[0];
    setTouchPosition({
      x: touch.clientX,
      y: touch.clientY
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const dropZones = document.querySelectorAll('[data-dropzone="true"]');
    
    dropZones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        if (onSelect) {
          onSelect(type);
        }
        setIsDragging(false);
      }
    });
  };

  return (
    <Box
      component="div"
      sx={{
        width: size,
        height: size,
        cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        margin: 'auto',
        animation: !isDraggable ? `${stickerPlacement} 0.4s ease-out` : 'none',
        filter: isDraggable ? 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))' : 'none',
        touchAction: isDraggable ? 'none' : 'auto',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        '&:hover': {
          transform: isDraggable ? 'scale(1.1)' : 'none',
        },
        '&:active': {
          cursor: isDraggable ? 'grabbing' : 'pointer',
          filter: isDraggable ? 'drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.3))' : 'none',
        },
        '& img': {
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          WebkitUserDrag: 'none',
          pointerEvents: 'none'
        },
        transform: isDragging ? `translate(${touchPosition.x}px, ${touchPosition.y}px)` : 'none',
      }}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      <img 
        src={getCharacterImage()} 
        alt={type}
        draggable={false}
      />
    </Box>
  );
};

export default PunctuationCharacter;
