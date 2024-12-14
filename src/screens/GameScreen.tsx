import * as React from 'react';
import { Box, Typography, Button, Grid, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PunctuationCharacter from '../components/PunctuationCharacter';
import { shuffleArray } from '../utils/shuffle';

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
    { text: "I can't believe it", answer: "exclamation", position: 'end' },
  ],
  question: [
    { text: "How are you today", answer: "question", position: 'end' },
    { text: "Where did you go", answer: "question", position: 'end' },
  ],
  comma: [
    { text: "After the movie we went home", answer: "comma", position: 2 }, // After index 2 (after "movie")
    { text: "Yes I would love to", answer: "comma", position: 1 }, // After index 1 (after "Yes")
  ],
};

const punctuationTypes = ['period', 'exclamation', 'question', 'comma'];

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
  const [shuffledTypes, setShuffledTypes] = React.useState(punctuationTypes);
  const [score, setScore] = React.useState({ correct: 0, incorrect: 0 });
  const [selectedMark, setSelectedMark] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<FeedbackMessage | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [gameOverOpen, setGameOverOpen] = React.useState(false);
  const [hasStarted, setHasStarted] = React.useState(false);

  const loadNewPhrase = React.useCallback(() => {
    if (punctuationType && punctuationType !== 'shuffle' && samplePhrases[punctuationType]) {
      const phrases = samplePhrases[punctuationType];
      setCurrentPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
      setShuffledTypes(shuffleArray(punctuationTypes));
    }
  }, [punctuationType]);

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
    if (!hasStarted || !settings.timer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          setGameOverOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, settings.timer]);

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

  const handleCharacterSelect = (type: string) => {
    startTimer();
    if (!currentPhrase) return;
    
    const correct = type === currentPhrase.answer;
    setIsCorrect(correct);
    setSelectedMark(type);
    setFeedback(getFeedbackMessage(type, correct));
    
    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setTimeout(() => {
        loadNewPhrase();
        setSelectedMark(null);
        setFeedback(null);
        setIsCorrect(null);
      }, 2000);
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setTimeout(() => {
        setSelectedMark(null);
        setFeedback(null);
        setIsCorrect(null);
      }, 2000);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    
    if (!currentPhrase) return;
    
    // Check if the drop position matches the correct position
    handleCharacterSelect(type);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = '#f0f0f0';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
        {words.map((word, index) => (
          <React.Fragment key={index}>
            <Typography variant="h4" component="span">
              {word}
            </Typography>
            {(currentPhrase.position === index || 
              (index === words.length - 1 && currentPhrase.position === 'end')) && (
              <Box
                component="div"
                sx={{
                  width: selectedMark ? 60 : 20,
                  height: 40,
                  border: selectedMark ? 'none' : '2px dashed #ccc',
                  borderRadius: 1,
                  mx: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {selectedMark && (
                  <PunctuationCharacter
                    type={selectedMark}
                    onClick={() => {}}
                    isCorrect={isCorrect}
                    isDraggable={false}
                  />
                )}
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  const handleGameOverClose = () => {
    setGameOverOpen(false);
    navigate('/select');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        left: 16, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        gap: 1 
      }}>
        <Button onClick={() => navigate('/select')}>
          Done
        </Button>
        <Typography variant="body2" sx={{ color: 'success.main' }}>
          Correct: {score.correct}
        </Typography>
        <Typography variant="body2" sx={{ color: 'error.main' }}>
          Incorrect: {score.incorrect}
        </Typography>
      </Box>

      {settings.timer && timeLeft !== null && (
        <Box sx={{ 
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: timeLeft < 10 ? 'error.main' : 'primary.main',
          color: 'white',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s ease',
          boxShadow: 2
        }}>
          <Typography variant="h5">
            {timeLeft}
          </Typography>
        </Box>
      )}

      {currentPhrase && (
        <>
          <Box component="div" sx={{ mb: 4 }}>
            {renderPhrase()}
          </Box>

          {feedback && (
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: feedback.type === 'success' ? 'success.main' : 'error.main',
                animation: 'fadeIn 0.5s ease-in'
              }}
            >
              {feedback.text}
            </Typography>
          )}

          <Grid container spacing={2} justifyContent="center">
            {shuffledTypes.map((type) => (
              <Grid item key={type}>
                <PunctuationCharacter
                  type={type}
                  onClick={() => handleCharacterSelect(type)}
                  isCorrect={isCorrect !== null ? type === currentPhrase.answer : undefined}
                  isDraggable={true}
                  onDragStart={handleDragStart}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <GameOverDialog
        open={gameOverOpen}
        onClose={handleGameOverClose}
        score={score}
      />
    </Box>
  );
};

export default GameScreen;
