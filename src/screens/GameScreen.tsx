import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PunctuationCharacter from '../components/PunctuationCharacter';
import { shuffleArray } from '../utils/shuffle';
import { Button } from '../components/Button';
import '../styles/GameScreen.css';

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
    { text: "Yes I would love to", answer: "comma", position: 0 }, // After index 1 (after "Yes")
  ],
};

type PunctuationType = 'period' | 'exclamation' | 'question' | 'comma';

const punctuationTypes: PunctuationType[] = ['period', 'exclamation', 'question', 'comma'];

interface FeedbackMessage {
  text: string;
  type: 'success' | 'error';
}

interface GameOverDialogProps {
  open: boolean;
  onClose: () => void;
  score: { correct: number; incorrect: number };
}

const GameOverDialog = ({ open, onClose, score }: GameOverDialogProps) => (
  <dialog open={open} className="game-over-dialog">
    <div className="dialog-content">
      <h2>Time's Up!</h2>
      <p className="score-correct">Correct Answers: {score.correct}</p>
      <p className="score-incorrect">Incorrect Answers: {score.incorrect}</p>
      <p className="feedback">
        {score.correct > score.incorrect 
          ? "Great job! You're getting really good at this!" 
          : "Keep practicing, you're getting better!"}
      </p>
      <div className="dialog-actions">
        <Button onClick={onClose}>Play Again</Button>
      </div>
    </div>
  </dialog>
);

const GameScreen = () => {
  const navigate = useNavigate();
  const { punctuationType, settings } = useGame();
  const [currentPhraseIndex, setCurrentPhraseIndex] = React.useState(0);
  const [currentPhrase, setCurrentPhrase] = React.useState<Phrase | null>(null);
  const [selectedMark, setSelectedMark] = React.useState<PunctuationType | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [score, setScore] = React.useState({ correct: 0, incorrect: 0 });
  const [hasStarted, setHasStarted] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [gameOverOpen, setGameOverOpen] = React.useState(false);
  const [shuffledTypes, setShuffledTypes] = React.useState<PunctuationType[]>(['period', 'exclamation', 'question', 'comma']);
  const [feedback, setFeedback] = React.useState<FeedbackMessage | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [closestDropZone, setClosestDropZone] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [lineBreaks, setLineBreaks] = useState<number[]>([]);
  const [activeDropZoneIndex, setActiveDropZoneIndex] = useState<number | null>(null);
  const [droppedIndex, setDroppedIndex] = useState<number | null>(null);
  const [feedbackTimeout, setFeedbackTimeout] = useState<NodeJS.Timeout | null>(null);
  const [phraseLayout, setPhraseLayout] = useState<{ 
    lineBreaks: number[],
    dropZoneSpaces: number[]
  }>({ lineBreaks: [], dropZoneSpaces: [] });
  const [droppedType, setDroppedType] = useState<PunctuationType | null>(null);

  const phrases = React.useMemo(() => shuffleArray(Object.values(samplePhrases).flat()), []);

  React.useEffect(() => {
    setCurrentPhrase(phrases[currentPhraseIndex]);
  }, [currentPhraseIndex, phrases]);

  const startTimer = React.useCallback(() => {
    if (!hasStarted && settings.timer) {
      setHasStarted(true);
      setTimeLeft(settings.timeLimit);
    }
  }, [hasStarted, settings.timer, settings.timeLimit]);

  React.useEffect(() => {
    if (hasStarted && settings.timer && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setGameOverOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [hasStarted, settings.timer, timeLeft]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleFirstInteraction = () => {
    startTimer();
  };

  const getFeedbackMessage = (type: string, isCorrect: boolean): FeedbackMessage => {
    if (isCorrect) {
      return {
        text: "Great job! That's exactly right!",
        type: 'success'
      };
    }

    const correctType = currentPhrase?.answer;
    switch (correctType) {
      case 'period':
        return {
          text: "This sentence needs a period to show it's complete.",
          type: 'error'
        };
      case 'question':
        return {
          text: "This is a question, so it needs a question mark.",
          type: 'error'
        };
      case 'exclamation':
        return {
          text: "This sentence shows strong feeling or emotion, so it needs an exclamation mark!",
          type: 'error'
        };
      case 'comma':
        return {
          text: "A comma is needed here to separate parts of the sentence.",
          type: 'error'
        };
      default:
        return {
          text: "That's not quite right. Try again!",
          type: 'error'
        };
    }
  };

  const handleCharacterSelect = (type: PunctuationType) => {
    if (!currentPhrase) return;

    // Start timer on first interaction if not started
    if (!hasStarted) {
      startTimer();
    }

    setSelectedMark(type);
    const isCorrectMark = type === currentPhrase.answer;
    setIsCorrect(isCorrectMark);

    if (isCorrectMark) {
      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1
      }));
    } else {
      setScore(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1
      }));
    }

    // Wait for animation then move to next phrase
    setTimeout(() => {
      setSelectedMark(null);
      setIsCorrect(null);
      goToNextPhrase();
    }, 1000);
  };

  const goToNextPhrase = () => {
    const nextIndex = (currentPhraseIndex + 1) % phrases.length;
    setCurrentPhraseIndex(nextIndex);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const droppedType = e.dataTransfer.getData('application/punctuation') as PunctuationType;
    
    console.log('Dropped type:', droppedType); // Add this for debugging
    
    if (droppedType) {
      handleCharacterSelect(droppedType);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // This is crucial for enabling drop
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleDragStart = (e: React.DragEvent) => {
    startTimer();
    e.dataTransfer.setData('text/plain', e.currentTarget.id);
  };

  const findClosestWord = useCallback((dragPos: { x: number; y: number } | null) => {
    if (!dragPos) return null;

    // Get all word elements
    const wordElements = document.querySelectorAll('[data-dropzone="true"]');
    let closestDropZone = null;
    let closestDistance = Infinity;

    wordElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const dropZoneCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      const distance = Math.sqrt(
        Math.pow(dragPos.x - dropZoneCenter.x, 2) + 
        Math.pow(dragPos.y - dropZoneCenter.y, 2)
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestDropZone = index;
      }
    });

    // Only return the closest drop zone if it's within a reasonable distance (e.g., 200px)
    return closestDistance < 200 ? closestDropZone : null;
  }, []);

  const getClosestWordIndex = (dragPos: { x: number; y: number } | null, words: NodeListOf<Element>) => {
    if (!dragPos) return null;
    
    // Get the phrase container bounds
    const container = document.querySelector('.phrase-container');
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    
    // Check if we're near the end of the phrase
    const lastWord = words[words.length - 1];
    const lastWordRect = lastWord.getBoundingClientRect();
    const distanceToEnd = Math.abs(dragPos.x - (lastWordRect.right + 78));
    
    // If we're near the end of the last line and it's an end position phrase
    if (currentPhrase?.position === 'end' && 
        dragPos.y > lastWordRect.top - 50 && 
        dragPos.y < lastWordRect.bottom + 50 &&
        dragPos.x > lastWordRect.right) {
      return words.length - 1;
    }
    
    // Check each word position
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const rect = word.getBoundingClientRect();
      const nextWord = words[i + 1];
      const nextRect = nextWord?.getBoundingClientRect();
      
      // If this is the last word, check if we're after it
      if (!nextWord && dragPos.x > rect.right) {
        return i;
      }
      
      // Check if we're between this word and the next
      if (nextRect) {
        const gap = {
          left: rect.right,
          right: nextRect.left,
          top: Math.min(rect.top, nextRect.top),
          bottom: Math.max(rect.bottom, nextRect.bottom)
        };
        
        // Check if we're in the gap between words
        if (dragPos.x >= gap.left && 
            dragPos.x <= gap.right && 
            dragPos.y >= gap.top - 50 && 
            dragPos.y <= gap.bottom + 50) {
          return i;
        }
      }
    }
    
    return null;
  };

  const renderPhrase = () => {
    if (!currentPhrase) return null;

    const words = currentPhrase.text.split(' ');
    
    return (
      <div 
        className="phrase-container"
        style={{ 
          width: '100%',
          textAlign: 'center',
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) {
            setIsDragging(false);
            setDragPosition(null);
            setActiveDropZoneIndex(null);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          const newPos = { x: e.clientX, y: e.clientY };
          
          // Update position immediately with minimal threshold
          if (!dragPosition || 
              Math.abs(newPos.x - dragPosition.x) > 2 || // Minimal threshold
              Math.abs(newPos.y - dragPosition.y) > 2) {
            setDragPosition(newPos);
            
            const wordElements = document.querySelectorAll('[data-word-index]');
            const newClosestIndex = getClosestWordIndex(newPos, wordElements);
            
            if (newClosestIndex !== activeDropZoneIndex) {
              setActiveDropZoneIndex(newClosestIndex);
            }
          }
        }}
        onDrop={() => {
          setIsDragging(false);
          setDragPosition(null);
        }}
      >
        <div 
          style={{
            fontFamily: '"Bookman Old Style Regular", "Bookman", "URW Bookman L", serif',
            fontWeight: 'normal',
            fontSize: window.innerWidth < 600 ? '80px' : 
                     window.innerWidth < 960 ? '100px' : 
                     window.innerWidth < 1280 ? '120px' : '140px',
            lineHeight: '1.1',
            display: 'inline-block',
            textAlign: 'left',
            maxWidth: '90%',
            margin: '0 auto',
            WebkitFontSmoothing: 'antialiased',
            WebkitTextSizeAdjust: '100%',
            color: '#000000'
          }}
        >
          {words.map((word, index) => {
            const needsLineBreak = phraseLayout.lineBreaks.includes(index);
            const needsDropZoneSpace = phraseLayout.dropZoneSpaces.includes(index);
            const isDropZoneActive = (isDragging && activeDropZoneIndex === index) || droppedIndex === index;

            return (
              <React.Fragment key={index}>
                {needsLineBreak && <br />}
                <span 
                  data-word-index={index}
                  style={{ 
                    display: 'inline-block',
                    fontFamily: '"Bookman Old Style Regular", "Bookman", "URW Bookman L", serif',
                    position: 'relative',
                    marginRight: needsDropZoneSpace ? '156px' : '0.4em',
                    marginLeft: '0',
                    lineHeight: '1.2',
                    verticalAlign: 'top',
                    willChange: 'transform'
                  }}
                >
                  {word}
                  <span
                    data-dropzone="true"
                    style={{
                      position: 'absolute',
                      display: 'inline-flex',
                      width: '140px',
                      height: '140px',
                      border: isDragging && activeDropZoneIndex === index ? '6px dashed #ccc' : 'none',
                      borderRadius: '20px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'opacity 0.03s linear', // Ultra-fast transition
                      opacity: isDropZoneActive ? 1 : 0,
                      visibility: needsDropZoneSpace ? 'visible' : 'hidden',
                      pointerEvents: (isDragging && activeDropZoneIndex === index) ? 'auto' : 'none',
                      left: '100%',
                      top: '50%',
                      marginLeft: '8px',
                      marginTop: '-70px',
                      transformOrigin: 'left center',
                      zIndex: 1000
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (isDragging && activeDropZoneIndex === index) {
                        e.currentTarget.style.border = '6px dashed #666';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      if (isDragging && activeDropZoneIndex === index) {
                        e.currentTarget.style.border = '6px dashed #ccc';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      
                      if (feedbackTimeout) {
                        clearTimeout(feedbackTimeout);
                      }
                      
                      setIsDragging(false);
                      setActiveDropZoneIndex(null);
                      
                      // Get the type from the event
                      const droppedType = e.dataTransfer.getData('application/punctuation');
                      
                      // Calculate the expected index
                      const expectedIndex = currentPhrase?.position === 'end' 
                        ? words.length - 1 
                        : currentPhrase?.position;
                      
                      // Check if we dropped in the right spot
                      const isCorrect = droppedType === currentPhrase?.answer && 
                                       index === expectedIndex;
                      
                      // Handle the drop first
                      handleDrop(e);
                      
                      // Then set feedback with a tiny delay
                      setTimeout(() => {
                        setDroppedIndex(index);
                        setShowingFeedback(true);
                        setIsCorrect(isCorrect);
                        
                        // Clear feedback after 2 seconds
                        const timeout = setTimeout(() => {
                          if (isCorrect) {
                            goToNextPhrase();
                          } else {
                            setSelectedMark(null);
                            setIsCorrect(null);
                            setShowingFeedback(false);
                            setDroppedIndex(null);
                          }
                        }, 2000);
                        
                        setFeedbackTimeout(timeout);
                      }, 0);
                    }}
                  >
                    {isDropZoneActive && selectedMark && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                      }}>
                        <PunctuationCharacter
                          type={selectedMark}
                          onClick={() => {}}
                          isCorrect={isCorrect}
                          isDraggable={false}
                          onSelect={() => {}}
                        />
                      </div>
                    )}
                  </span>
                </span>
                {!needsLineBreak && ' '}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const handleGameOverClose = () => {
    setGameOverOpen(false);
    navigate('/select');
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const TimerDisplay = () => (
    <div className={`timer ${(!hasStarted || timeLeft === null) ? '' : 
      timeLeft < 10 ? 'timer-warning' : ''}`}>
      <span className="timer-text">
        {formatTime(timeLeft)}
      </span>
    </div>
  );

  React.useEffect(() => {
    if (settings.timer) {
      setTimeLeft(settings.timeLimit);
    }
  }, [settings.timer, settings.timeLimit]);

  const TopBar = () => (
    <header className="top-bar">
      <Button onClick={() => navigate('/select')}>
        DONE
      </Button>
      <p className="score-display">
        CORRECT: {score.correct} INCORRECT: {score.incorrect}
      </p>
    </header>
  );

  React.useEffect(() => {
    if (!currentPhrase) return;

    // Pre-calculate all possible drop zone positions
    const testDiv = document.createElement('div');
    testDiv.style.visibility = 'hidden';
    testDiv.style.position = 'absolute';
    testDiv.style.width = '90%';
    testDiv.style.fontSize = window.innerWidth < 600 ? '80px' : 
                            window.innerWidth < 960 ? '100px' : 
                            window.innerWidth < 1280 ? '120px' : '140px';
    testDiv.style.fontFamily = '"Bookman Old Style Regular", "Bookman", "URW Bookman L", serif';
    document.body.appendChild(testDiv);

    const words = currentPhrase.text.split(' ');
    const breaks: number[] = [];
    const spaces: number[] = [];

    // Test each word position
    words.forEach((_, index) => {
      // Add space for potential drop zone after each word
      spaces.push(index);
      
      // Test if this causes a line break
      testDiv.innerHTML = words.slice(0, index + 1).join(' ');
      const heightWithoutSpace = testDiv.offsetHeight;
      
      testDiv.innerHTML = words.slice(0, index + 1).join(' ') + ' '.repeat(20);
      const heightWithSpace = testDiv.offsetHeight;
      
      if (heightWithSpace > heightWithoutSpace) {
        breaks.push(index);
      }
    });

    // If it's an end position phrase, always add space at the end
    if (currentPhrase.position === 'end') {
      spaces.push(words.length - 1);
    }

    document.body.removeChild(testDiv);
    setPhraseLayout({ lineBreaks: breaks, dropZoneSpaces: spaces });
  }, [currentPhrase]);

  React.useEffect(() => {
    return () => {
      if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
      }
    };
  }, [feedbackTimeout]);

  // Add this effect to pre-calculate positions when phrase changes
  React.useEffect(() => {
    if (!currentPhrase) return;

    // Pre-calculate positions immediately when phrase changes
    requestAnimationFrame(() => {
      const wordElements = document.querySelectorAll('[data-word-index]');
      wordElements.forEach((word) => {
        // Force layout calculation
        word.getBoundingClientRect();
      });
    });
  }, [currentPhrase]);

  return (
    <div className="game-screen">
      <TopBar />
      
      <main className="game-content">
        <div className="phrase-container">
          {renderPhrase()}
        </div>
      </main>

      <footer className="character-controls">
        {shuffledTypes.map((type) => (
          <PunctuationCharacter
            key={type}
            type={type}
            onClick={() => handleCharacterSelect(type)}
            isCorrect={undefined}
            isDraggable={true}
            onDragStart={() => setSelectedMark(null)}
            onSelect={handleCharacterSelect}
          />
        ))}
      </footer>

      {settings.timer && <TimerDisplay />}
      
      <GameOverDialog 
        open={gameOverOpen} 
        onClose={handleGameOverClose}
        score={score}
      />
    </div>
  );
};

export default GameScreen;
