import * as React from 'react';
import { Box, Typography, Button, Grid, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PunctuationCharacter from '../components/PunctuationCharacter';
import { shuffleArray } from '../utils/shuffle';
import { Button as CustomButton } from '../components/Button';

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
      <Button onClick={onClose}>Play Again</Button>
    </DialogActions>
  </Dialog>
);

const GameScreen = () => {
  const navigate = useNavigate();
  const { punctuationType, settings } = useGame();
  const [currentPhrase, setCurrentPhrase] = React.useState<Phrase | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [shuffledTypes, setShuffledTypes] = React.useState<PunctuationType[]>(['period', 'exclamation', 'question', 'comma']);
  const [score, setScore] = React.useState({ correct: 0, incorrect: 0 });
  const [selectedMark, setSelectedMark] = React.useState<PunctuationType | null>(null);
  const [feedback, setFeedback] = React.useState<FeedbackMessage | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [gameOverOpen, setGameOverOpen] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const getRandomPhrase = React.useCallback(() => {
    if (punctuationType === 'shuffle') {
      // For shuffle mode, get all phrases and pick one randomly
      const allPhrases = Object.values(samplePhrases).flat();
      return allPhrases[Math.floor(Math.random() * allPhrases.length)];
    } else if (punctuationType && samplePhrases[punctuationType]) {
      // For specific punctuation type
      const phrases = samplePhrases[punctuationType];
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    return null;
  }, [punctuationType]);

  const loadNewPhrase = React.useCallback(() => {
    const newPhrase = getRandomPhrase();
    setCurrentPhrase(newPhrase);
    setShuffledTypes(shuffleArray(punctuationTypes));
    setIsCorrect(null);
    setSelectedMark(null);
    setFeedback(null);
  }, [getRandomPhrase]);

  React.useEffect(() => {
    loadNewPhrase();
  }, [loadNewPhrase]);

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

  const vibrate = (pattern: number | number[]) => {
    try {
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.log('Vibration not supported');
    }
  };

  const handleCharacterSelect = (type: PunctuationType) => {
    handleFirstInteraction();
    setSelectedMark(type);
    vibrate(50);

    if (currentPhrase) {
      const correct = type === currentPhrase.answer;
      setIsCorrect(correct);
      
      // Update score
      setScore(prev => ({
        correct: correct ? prev.correct + 1 : prev.correct,
        incorrect: correct ? prev.incorrect : prev.incorrect + 1
      }));
      
      if (correct) {
        vibrate([100, 50, 100]);
      } else {
        vibrate([200]);
      }

      // Load new phrase after a delay
      setTimeout(() => {
        const newPhrase = getRandomPhrase();
        setCurrentPhrase(newPhrase);
        setShuffledTypes(shuffleArray([...punctuationTypes]));
        setIsCorrect(null);
        setSelectedMark(null);
      }, 1000);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const droppedType = e.dataTransfer.getData('application/punctuation') as PunctuationType;
    
    console.log('Dropped type:', droppedType); // Add this for debugging
    
    if (droppedType) {
      vibrate(50);
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
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontFamily: 'Bookman Old Style Regular, serif',
          fontSize: window.innerWidth < 600 ? '80px' : 
                   window.innerWidth < 960 ? '100px' : 
                   window.innerWidth < 1280 ? '120px' : '140px',
          lineHeight: '1.1',
          display: 'inline-block',
          textAlign: 'left',
          maxWidth: '90%',
          margin: '0 auto'
        }}>
          {words.map((word, index) => (
            <React.Fragment key={index}>
              {word}
              {(currentPhrase.position === index || 
                (index === words.length - 1 && currentPhrase.position === 'end')) && (
                <span
                  data-dropzone="true"
                  style={{
                    display: 'inline-flex',
                    width: '140px',
                    height: '140px',
                    border: '6px dashed #ccc',
                    borderRadius: '20px',
                    margin: '0 16px',
                    verticalAlign: 'top',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1)'
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.transform = 'scale(1)';
                    handleDrop(e);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {selectedMark && (
                    <PunctuationCharacter
                      type={selectedMark}
                      onClick={() => {}}
                      isCorrect={isCorrect}
                      isDraggable={false}
                      onSelect={() => {}}
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
    navigate('/select');
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

  React.useEffect(() => {
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

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <TopBar />
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px',
        paddingBottom: '120px',
        paddingTop: '12px',
      }}>
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {renderPhrase()}
        </Box>
      </Box>

      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '32px',
        padding: '24px',
        minHeight: '120px',
        backgroundColor: 'transparent',
        zIndex: 2
      }}>
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
      </Box>

      {settings.timer && <TimerDisplay />}
      <GameOverDialog 
        open={gameOverOpen} 
        onClose={handleGameOverClose}
        score={score}
      />
    </Box>
  );
};

export default GameScreen;
