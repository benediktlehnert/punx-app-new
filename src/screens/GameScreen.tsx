import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PunctuationCharacter from '../components/PunctuationCharacter';
import { shuffleArray } from '../utils/shuffle';
import { Button as CustomButton } from '../components/Button';
import { GameOverDialog } from '../components/GameOverDialog';
import { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

type Phrase = {
  text: string;
  answer: string;
  position: 'end' | number; // 'end' or index where punctuation should go
};

type PhraseCollection = {
  period: Phrase[];
  exclamation: Phrase[];
  question: Phrase[];
  comma: Phrase[];
};

const samplePhrases: PhraseCollection = {
  period: [
    { text: "I love to play in the park", answer: "period", position: 'end' },
    { text: "The sun is shining today", answer: "period", position: 'end' },
  ],
  exclamation: [
    { text: "What a wonderful day", answer: "exclamation", position: 'end' },
    { text: "I can’t believe it", answer: "exclamation", position: 'end' },
  ],
  question: [
    { text: "How are you today", answer: "question", position: 'end' },
    { text: "Where did you go", answer: "question", position: 'end' },
  ],
  comma: [
    { text: "After the movie we went home", answer: "comma", position: 2 }, // After index 2 (after "movie")
    { text: "Yes I would love to", answer: "comma", position: 0 }, // After index 0 (after "Yes")
  ],
};

type PunctuationType = 'period' | 'exclamation' | 'question' | 'comma';

// Add this type to help with calculations
type LineBreakInfo = {
  beforeWord: number | null;  // Index of word to break before
  dropZoneWidth: number;      // Width needed for the drop zone
};

// Add proper type definitions
interface DropZoneProps {
  position: number | 'end';
  isActive: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

const PHRASE_FONT_SIZE = 80; // Adjust this value to change the font size

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Add this helper function to determine timer color
const getTimerColor = (timeLeft: number): string => {
  if (timeLeft <= 10) return '#EF4444'; // Red for last 10 seconds
  if (timeLeft <= 30) return '#F59E0B'; // Orange for last 30 seconds
  return '#64748B'; // Default slate color
};

const GameScreen = () => {
  const navigate = useNavigate();
  const { settings } = useGame();
  const [currentPhraseIndex, setCurrentPhraseIndex] = React.useState(0);
  const [currentPhrase, setCurrentPhrase] = React.useState<Phrase | null>(null);
  const [selectedMark, setSelectedMark] = React.useState<PunctuationType | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [score, setScore] = React.useState({ correct: 0, incorrect: 0 });
  const [hasStarted, setHasStarted] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<number>(() => settings.timeLimit);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [gameOverOpen, setGameOverOpen] = React.useState(false);
  const [activeDropZone, setActiveDropZone] = React.useState<number | 'end' | null>(null);
  const [droppedPosition, setDroppedPosition] = React.useState<number | 'end' | null>(null);
  
  const phraseRef = React.useRef<HTMLDivElement>(null);
  const phrases = React.useMemo(() => shuffleArray(Object.values(samplePhrases).flat()), []);

  const [forceLineBreak, setForceLineBreak] = React.useState(false);
  const [lineBreaks, setLineBreaks] = React.useState<LineBreakInfo[]>([]);

  const DROP_ZONE_WIDTH = 156; // 140px + 16px margin

  // Enhanced calculation that checks all possible drop zone positions
  const calculateLineBreaks = React.useCallback(() => {
    if (!phraseRef.current || !currentPhrase) return [];

    const words = currentPhrase.text.split(' ');
    const containerWidth = phraseRef.current.offsetWidth - 80; // Reduced padding consideration
    const wordSpacing = 16;
    
    // Create temporary div for measurements
    const tempDiv = document.createElement('div');
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.style.fontSize = `${PHRASE_FONT_SIZE}px`;
    tempDiv.style.fontFamily = '"Bookman Old Style Regular", "Bookman", "URW Bookman L", serif';
    tempDiv.style.whiteSpace = 'nowrap';
    document.body.appendChild(tempDiv);

    // First measure the entire phrase with the drop zone
    tempDiv.textContent = words.join(' ');
    const totalPhraseWidth = tempDiv.offsetWidth + wordSpacing + DROP_ZONE_WIDTH;

    // If everything fits on one line, don't add any breaks
    if (totalPhraseWidth <= containerWidth) {
      document.body.removeChild(tempDiv);
      return [];
    }

    document.body.removeChild(tempDiv);
    return [];
  }, [currentPhrase]);

  // Update effect to use new calculation
  React.useEffect(() => {
    const updateLineBreaks = () => {
      setLineBreaks(calculateLineBreaks());
    };

    updateLineBreaks();
    window.addEventListener('resize', updateLineBreaks);
    return () => window.removeEventListener('resize', updateLineBreaks);
  }, [calculateLineBreaks]);

  React.useEffect(() => {
    setCurrentPhrase(phrases[currentPhraseIndex]);
  }, [currentPhraseIndex, phrases]);

  const FEEDBACK_DURATION = 1500;

  // Update handleDrop to match the type
  const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const droppedType = e.dataTransfer.getData('application/punctuation') as PunctuationType;
    
    if (activeDropZone !== null && droppedType) {
      const isCorrectPosition = 
        (currentPhrase?.position === 'end' && activeDropZone === 'end') ||
        (currentPhrase?.position === activeDropZone);
      const isCorrectType = droppedType === currentPhrase?.answer;
      const isCorrect = isCorrectPosition && isCorrectType;

      setDroppedPosition(activeDropZone);
      setSelectedMark(droppedType);
      setIsCorrect(isCorrect);

      if (isCorrect) {
        setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }

      setTimeout(() => {
        setDroppedPosition(null);
        setSelectedMark(null);
        setIsCorrect(null);
        setActiveDropZone(null);
        goToNextPhrase();
      }, FEEDBACK_DURATION);
    }
  }, [activeDropZone, currentPhrase]);

  const calculateDropZone = (dragX: number, dragY: number) => {
    if (!phraseRef.current) return null;

    const words = phraseRef.current.getElementsByClassName('word');
    const phraseRect = phraseRef.current.getBoundingClientRect();
    
    // If the drag is outside the phrase area vertically, return null
    if (dragY < phraseRect.top - 50 || dragY > phraseRect.bottom + 50) {
      return null;
    }

    const hysteresis = activeDropZone !== null ? 30 : 0;
    let closestDistance = Infinity;
    let closestZone: number | 'end' | null = null;

    // For short phrases, prioritize the end position if near the last word
    const lastWord = words[words.length - 1];
    const lastWordRect = lastWord.getBoundingClientRect();
    
    // Check end position first
    if (dragX > lastWordRect.right - 20) {
      const distance = Math.abs(dragX - (lastWordRect.right + 70));
      const threshold = activeDropZone === 'end' ? 50 + hysteresis : 50;
      
      if (distance < threshold) {
        return 'end';
      }
    }

    // Then check middle positions
    for (let i = 0; i < words.length - 1; i++) {
      const word = words[i];
      const nextWord = words[i + 1];
      const wordRect = word.getBoundingClientRect();
      const nextWordRect = nextWord.getBoundingClientRect();
      
      // Only check gaps on the same line
      if (Math.abs(wordRect.top - nextWordRect.top) < 10) {
        const gapCenter = (wordRect.right + nextWordRect.left) / 2;
        const distance = Math.abs(dragX - gapCenter);
        
        const threshold = activeDropZone === i ? 40 + hysteresis : 40;
        
        if (distance < threshold && distance < closestDistance) {
          closestDistance = distance;
          closestZone = i;
        }
      }
    }

    return closestZone;
  };

  // Add this at the component level
  const DROP_ZONE_APPEAR_DELAY = 0; // Remove any artificial delay
  const DRAG_THROTTLE = 16; // About 60fps, adjust if needed

  // Optimize the drag handler
  const handleDrag = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    // Start timer on first drag if enabled
    if (settings.timer && !isTimerRunning) {
      setIsTimerRunning(true);
    }

    const { clientX, clientY } = e;
    const newDropZone = calculateDropZone(clientX, clientY);
    
    if (newDropZone !== activeDropZone) {
      setActiveDropZone(newDropZone);
    }
  }, [activeDropZone, settings.timer, isTimerRunning]);

  // Add this at the component level
  const lastDropZoneUpdate = React.useRef<number>(0);

  // Update the DropZone component with proper typing
  const DropZone = React.memo(({ 
    position, 
    isActive, 
    onDrop, 
    children 
  }: DropZoneProps) => (
    <div
      className="dropzone"
      data-dropzone="true"
      onDragEnter={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.border = '6px dashed #666';
      }}
      onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.border = '6px dashed #666';
      }}
      onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.style.border = '6px dashed #ccc';
      }}
      onDrop={onDrop}
      style={{
        width: '140px',
        height: '140px',
        border: '6px dashed #ccc',
        borderRadius: '20px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '16px',
        opacity: 1,
        transform: 'translateZ(0)',
        willChange: 'transform, border',
      }}
    >
      {children}
    </div>
  ));

  const renderPhrase = () => {
    if (!currentPhrase) return null;

    const words = currentPhrase.text.split(' ');
    
    return (
      <div 
        ref={phraseRef}
        style={{
          width: '100%',
          maxWidth: '1600px',
          height: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '40px',
          minHeight: '300px',
        }}
      >
        <div style={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
        }}>
          {words.map((word, index) => (
            <div
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <span 
                className="word"
                style={{
                  fontFamily: '"Bookman Old Style Regular", "Bookman", "URW Bookman L", serif',
                  fontSize: `${PHRASE_FONT_SIZE}px`,
                  lineHeight: '1.1',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                {word}
              </span>
              {(activeDropZone === index || droppedPosition === index) && (
                <DropZone
                  position={index}
                  isActive={activeDropZone === index}
                  onDrop={handleDrop}
                >
                  {selectedMark && droppedPosition === index && (
                    <PunctuationCharacter
                      type={selectedMark}
                      isCorrect={isCorrect}
                      onClick={() => {}}
                    />
                  )}
                </DropZone>
              )}
            </div>
          ))}
          {(activeDropZone === 'end' || droppedPosition === 'end') && (
            <DropZone
              position="end"
              isActive={activeDropZone === 'end'}
              onDrop={handleDrop}
            >
              {selectedMark && droppedPosition === 'end' && (
                <PunctuationCharacter
                  type={selectedMark}
                  isCorrect={isCorrect}
                  onClick={() => {}}
                />
              )}
            </DropZone>
          )}
        </div>
      </div>
    );
  };

  const goToNextPhrase = () => {
    const nextIndex = (currentPhraseIndex + 1) % phrases.length;
    setCurrentPhraseIndex(nextIndex);
  };

  const handleRestart = () => {
    setScore({ correct: 0, incorrect: 0 });
    setGameOverOpen(false);
    setTimeLeft(settings.timeLimit);
    setIsTimerRunning(false);
    setCurrentPhraseIndex(0);
    setDroppedPosition(null);
    setSelectedMark(null);
    setIsCorrect(null);
    setActiveDropZone(null);
  };

  // Update timer effect
  useEffect(() => {
    if (!settings.timer) {
      setTimeLeft(settings.timeLimit);
      setIsTimerRunning(false);
      return;
    }

    let interval: NodeJS.Timeout;

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOverOpen(true);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, settings.timer, settings.timeLimit]);

  // Also update when settings change
  useEffect(() => {
    setTimeLeft(settings.timeLimit);
  }, [settings.timeLimit]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        width: '100%',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CustomButton onClick={() => navigate('/select')}>
            Back
          </CustomButton>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '24px',
          fontSize: '18px',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <span style={{ color: '#22C55E' }}>✓ {score.correct}</span>
            <span style={{ color: '#EF4444' }}>✗ {score.incorrect}</span>
          </div>
          {settings.timer && (
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: `2px solid ${getTimerColor(timeLeft)}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'monospace',
              fontSize: '15px',
              color: getTimerColor(timeLeft),
              transition: 'all 0.3s ease',
              position: 'relative',
              background: timeLeft <= 10 ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            }}>
              {/* Pulsing background for last 10 seconds */}
              {timeLeft <= 10 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  animation: 'pulse 1s ease-in-out infinite',
                }} />
              )}
              {/* Timer text */}
              <span style={{ 
                position: 'relative',
                zIndex: 1,
                fontWeight: timeLeft <= 30 ? 600 : 400,
              }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{
        width: '100%',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {renderPhrase()}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        padding: '24px',
        minHeight: '120px',
        background: 'white',
      }}>
        {['period', 'exclamation', 'question', 'comma'].map((type) => (
          <PunctuationCharacter
            key={type}
            type={type as PunctuationType}
            onClick={() => {}}
            isCorrect={undefined}
            isDraggable={true}
            onDrag={handleDrag}
            onDragEnd={() => setActiveDropZone(null)}
          />
        ))}
      </div>

      {gameOverOpen && (
        <GameOverDialog
          score={score}
          onClose={() => setGameOverOpen(false)}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

// Add this CSS to your global styles or as a styled component
const styles = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export default GameScreen;
