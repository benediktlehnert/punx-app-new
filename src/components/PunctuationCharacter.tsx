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

interface Position {
  x: number;
  y: number;
}

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

interface PunctuationCharacterProps {
  type: 'period' | 'exclamation' | 'question' | 'comma';
  isCorrect?: boolean | null;
  onClick: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onSelect?: (type: 'period' | 'exclamation' | 'question' | 'comma') => void;
  onDrag?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
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

const isTouchDevice = () => {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0));
};

const PunctuationCharacter = ({ 
  type, 
  isCorrect, 
  onClick, 
  isDraggable,
  onDragStart,
  onSelect,
  onDrag,
  onDragEnd 
}: PunctuationCharacterProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const touchRef = React.useRef<{
    clone: HTMLElement | null;
    offsetX: number;
    offsetY: number;
  }>({ clone: null, offsetX: 0, offsetY: 0 });
  
  const isTouch = React.useMemo(() => isTouchDevice(), []);

  const getCharacterImage = () => {
    const baseName = type.toLowerCase();
    if (isCorrect === true) {
      return characterImages[type].happy;
    } else if (isCorrect === false) {
      return characterImages[type].sad;
    }
    return characterImages[type].default;
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

  // Desktop drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (isTouch) return;
    setIsDragging(true);
    
    console.log('Setting drag data:', type);
    e.dataTransfer.setData('application/punctuation', type);
    
    if (onDragStart) {
      onDragStart(e);
    }
  };

  // Touch handlers for iOS
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDraggable || !isTouch) return;
    e.preventDefault();

    const touch = e.touches[0];
    const element = elementRef.current;
    
    if (element) {
      const rect = element.getBoundingClientRect();
      
      // Create clone for dragging
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.zIndex = '1000';
      clone.style.pointerEvents = 'none';
      clone.style.width = `${rect.width * 1.1}px`; // 10% bigger
      clone.style.height = `${rect.height * 1.1}px`; // 10% bigger
      clone.style.transform = 'scale(1.1)';
      clone.style.transition = 'none'; // Remove transition for immediate movement
      
      // Calculate offset from touch point to element center
      touchRef.current = {
        clone,
        offsetX: touch.clientX - (rect.left + rect.width / 2),
        offsetY: touch.clientY - (rect.top + rect.height / 2)
      };

      // Position clone immediately at touch point
      clone.style.left = `${touch.clientX - clone.offsetWidth / 2}px`;
      clone.style.top = `${touch.clientY - clone.offsetHeight / 2}px`;
      
      document.body.appendChild(clone);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTouch || !touchRef.current.clone) return;
    e.preventDefault();

    const touch = e.touches[0];
    const clone = touchRef.current.clone;
    
    // Update clone position immediately
    requestAnimationFrame(() => {
      if (clone) {
        clone.style.left = `${touch.clientX - clone.offsetWidth / 2}px`;
        clone.style.top = `${touch.clientY - clone.offsetHeight / 2}px`;
      }
    });

    // Check drop zones
    const dropZones = document.querySelectorAll('[data-dropzone="true"]');
    dropZones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        zone.classList.add('dragover');
      } else {
        zone.classList.remove('dragover');
      }
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !isTouch) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const dropZones = document.querySelectorAll('[data-dropzone="true"]');
    
    if (touchRef.current.clone) {
      touchRef.current.clone.remove();
      touchRef.current.clone = null;
    }

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
      }
      zone.classList.remove('dragover');
    });

    setIsDragging(false);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (touchRef.current.clone) {
        touchRef.current.clone.remove();
      }
    };
  }, []);

  return (
    <Box
      ref={elementRef}
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
        position: 'relative',
        zIndex: 1,
        touchAction: isDraggable ? 'none' : 'auto',
        filter: isDraggable ? 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2))' : 'none',
        '&:active': {
          cursor: 'grabbing',
          filter: isDraggable ? 'drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.3))' : 'none',
        },
        '& img': {
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          userSelect: 'none',
          WebkitUserDrag: 'none',
          pointerEvents: 'none'
        }
      }}
      onClick={!isDragging ? onClick : undefined}
      draggable={isDraggable && !isTouch}
      onDragStart={handleDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
