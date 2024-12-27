import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button 
} from '@mui/material';
import PunctuationCharacter, { PunctuationType } from '../components/PunctuationCharacter';
import GameOverDialog from '../components/GameOverDialog';
import { Button as CustomButton } from '../components/Button';
import { useSettings } from '../context/SettingsContext';
import { useGame } from '../context/GameContext';
import { shuffleArray } from '../utils';
import { samplePhrases, Phrase } from '../data/phrases';

const punctuationMarks: PunctuationType[] = ['period', 'question', 'exclamation', 'comma'];

type FeedbackMessage = {
  type: 'success' | 'error';
  message: string;
};

const GameScreen = () => {
  const navigate = useNavigate();
  const { punctuationType, settings } = useGame();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
  const [selectedMark, setSelectedMark] = useState<PunctuationType | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(() => settings.timeLimit);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [gameOverOpen, setGameOverOpen] = useState(false);
  const [shuffledTypes, setShuffledTypes] = useState<PunctuationType[]>(['period', 'exclamation', 'question', 'comma']);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phrases = useMemo(() => shuffleArray(Object.values(samplePhrases).flat()), []);

  useEffect(() => {
    setCurrentPhrase(phrases[currentPhraseIndex]);
  }, [currentPhraseIndex, phrases]);

  const startTimer = useCallback(() => {
    if (!hasStarted && settings.timer) {
      setHasStarted(true);
      setTimeLeft(settings.timeLimit);
    }
  }, [hasStarted, settings.timer, settings.timeLimit]);

  useEffect(() => {
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

  useEffect(() => {
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
        type: 'success',
        message: "Great job! That's exactly right!"
      };
    }

    const correctType = currentPhrase?.answer;
    switch (correctType) {
      case 'period':
        return {
          type: 'error',
          message: "This sentence needs a period to show it's complete."
        };
      case 'question':
        return {
          type: 'error',
          message: "This is a question, so it needs a question mark."
        };
      case 'exclamation':
        return {
          type: 'error',
          message: "This sentence shows strong feeling or emotion, so it needs an exclamation mark!"
        };
      case 'comma':
        return {
          type: 'error',
          message: "A comma is needed here to separate parts of the sentence."
        };
      default:
        return {
          type: 'error',
          message: "That's not quite right. Try again!"
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

  const renderPhrase = () => {
    if (!currentPhrase) return null;

    const words = currentPhrase.text.split(' ');
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px'
      }}>
        <div style={{ 
          fontSize: '24px',
          lineHeight: '1.5',
          textAlign: 'center'
        }}>
          {words.map((word, index) => (
            <React.Fragment key={index}>
              <span style={{ 
                display: 'inline-block',
                fontFamily: '"Bookman Old Style Regular", "Bookman", "URW Bookman L", serif'
              }}>
                {word}
              </span>
              {(currentPhrase.position === 'middle' && index === Math.floor(words.length / 2) || 
                (index === words.length - 1 && currentPhrase.position === 'end')) && (
                <span
                  data-dropzone="true"
                  style={{
                    display: 'inline-block',
                    width: '24px',
                    height: '24px',
                    margin: '0 4px',
                    borderRadius: '4px',
                    backgroundColor: selectedMark ? 'transparent' : '#f0f0f0',
                    border: '2px dashed #ccc'
                  }}
                >
                  {selectedMark && (
                    <PunctuationCharacter
                      mark={selectedMark}
                      onClick={() => {}}
                      disabled={false}
                    />
                  )}
                </span>
              )}
              {' '}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const handleGameOverClose = () => {
    setGameOverOpen(false);
    navigate('/');
  };

  const handleRestart = () => {
    setGameOverOpen(false);
    setScore({ correct: 0, incorrect: 0 });
    setCurrentPhraseIndex(0);
    setTimeLeft(settings.timeLimit);
    setHasStarted(false);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const TimerDisplay = () => (
    <Box sx={{ 
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: (!hasStarted || timeLeft === null) ? 'primary.main' :
                      timeLeft < 10 ? 'error.main' : 'primary.main',
      color: 'white',
      borderRadius: '50%',
      width: 80,
      height: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.3s ease',
      boxShadow: 2
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}
      >
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );

  useEffect(() => {
    if (settings.timer) {
      setTimeLeft(settings.timeLimit);
    }
  }, [settings.timer, settings.timeLimit]);

  const TopBar = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '16px',
      width: '100%'
    }}>
      <CustomButton onClick={() => navigate('/select')}>
        DONE
      </CustomButton>
      <Typography sx={{ 
        fontFamily: '"Rethink Sans", Arial, sans-serif',
        fontWeight: 800
      }}>
        CORRECT: {score.correct} INCORRECT: {score.incorrect}
      </Typography>
    </Box>
  );

  const handleMarkClick = (mark: PunctuationType) => {
    if (!currentPhrase) return;
    
    setSelectedMark(mark);
    const isAnswerCorrect = mark === currentPhrase.answer;
    setIsCorrect(isAnswerCorrect);
    
    setScore(prev => ({
      correct: prev.correct + (isAnswerCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isAnswerCorrect ? 0 : 1)
    }));

    setFeedback({
      type: isAnswerCorrect ? 'success' : 'error',
      message: isAnswerCorrect ? 'Correct!' : 'Try again!'
    });

    // Move to next phrase after a short delay
    setTimeout(() => {
      setCurrentPhraseIndex(prev => 
        prev < phrases.length - 1 ? prev + 1 : 0
      );
      setSelectedMark(null);
      setIsCorrect(null);
      setFeedback(null);
    }, 1000);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <TopBar />
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '12px',
      }}>
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {renderPhrase()}
        </Box>
      </Box>

      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 2,
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        backgroundColor: 'background.paper',
      }}>
        {punctuationMarks.map((mark) => (
          <PunctuationCharacter
            key={mark}
            mark={mark}
            onClick={() => handleMarkClick(mark)}
            disabled={!currentPhrase}
          />
        ))}
      </Box>

      {settings.timer && <TimerDisplay />}
      <GameOverDialog 
        open={gameOverOpen} 
        onClose={handleGameOverClose}
        onRestart={handleRestart}
        score={score}
      />
    </Box>
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
