import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PunctuationCharacter from '../components/PunctuationCharacter';
import GameOverDialog from '../components/GameOverDialog';
import { Button as CustomButton } from '../components/Button';

// Types
type PunctuationType = 'period' | 'question' | 'exclamation' | 'comma';

interface Phrase {
  text: string;
  punctuation: PunctuationType;
  position: number | 'end';
}

const PUNCTUATION_TYPES: PunctuationType[] = ['period', 'question', 'exclamation'];

const PHRASES: Phrase[] = [
  { text: 'The cat sat on the mat', punctuation: 'period', position: 'end' },
  { text: 'Where did the dog go', punctuation: 'question', position: 'end' },
  { text: 'I love ice cream', punctuation: 'exclamation', position: 'end' },
  // ... rest of your phrases
];

const GameScreen = () => {
  const navigate = useNavigate();
  const [currentPhraseIndex, setCurrentPhraseIndex] = React.useState(0);
  const [currentPhrase, setCurrentPhrase] = React.useState<Phrase | null>(null);
  const [selectedMark, setSelectedMark] = React.useState<PunctuationType | null>(null);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);
  const [score, setScore] = React.useState({ correct: 0, incorrect: 0 });
  const [hasStarted, setHasStarted] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
  const [gameOverOpen, setGameOverOpen] = React.useState(false);

  React.useEffect(() => {
    setCurrentPhrase(PHRASES[currentPhraseIndex]);
  }, [currentPhraseIndex]);

  const handleCharacterSelect = (type: PunctuationType) => {
    if (!currentPhrase) return;

    if (!hasStarted) {
      startTimer();
    }

    setSelectedMark(type);
    const isCorrectMark = type === currentPhrase.punctuation;
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

    setTimeout(() => {
      setSelectedMark(null);
      setIsCorrect(null);
      goToNextPhrase();
    }, 1000);
  };

  const goToNextPhrase = () => {
    const nextIndex = (currentPhraseIndex + 1) % PHRASES.length;
    setCurrentPhraseIndex(nextIndex);
  };

  const startTimer = () => {
    setHasStarted(true);
    setTimeLeft(60);
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && timeLeft !== null && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setGameOverOpen(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, hasStarted]);

  const handleGameOverClose = () => {
    setGameOverOpen(false);
    setScore({ correct: 0, incorrect: 0 });
    setTimeLeft(null);
    setHasStarted(false);
    setCurrentPhraseIndex(0);
  };

  const renderPhrase = () => {
    if (!currentPhrase) return null;

    const words = currentPhrase.text.split(' ');
    
    return (
      <div style={{ textAlign: 'center' }}>
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
                  alignItems: 'center'
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
    );
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#F5F5F7'
      }}
    >
      {/* Sticky Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          padding: 2,
          backgroundColor: 'white',
          zIndex: 10,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomButton onClick={() => navigate('/select')}>
            Back
          </CustomButton>
          {timeLeft !== null && (
            <Typography variant="h6">
              Time: {timeLeft}s
            </Typography>
          )}
        </Box>
        <Typography variant="h6">
          Score: {score.correct}/{score.correct + score.incorrect}
        </Typography>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        {renderPhrase()}
      </Box>

      {/* Sticky Footer */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          padding: 2,
          backgroundColor: 'white',
          zIndex: 10,
          borderTop: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}
      >
        {PUNCTUATION_TYPES.map((type) => (
          <PunctuationCharacter
            key={type}
            type={type}
            onClick={() => handleCharacterSelect(type)}
            isDraggable={true}
            onDragStart={() => {}}
            onSelect={handleCharacterSelect}
            isCorrect={selectedMark === type ? isCorrect : undefined}
          />
        ))}
      </Box>

      <GameOverDialog
        open={gameOverOpen}
        onClose={handleGameOverClose}
        score={score}
      />
    </Box>
  );
};

export default GameScreen;
