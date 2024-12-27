import React from 'react';

export type PunctuationType = 'period' | 'exclamation' | 'question' | 'comma';

export interface PunctuationCharacterProps {
  mark: PunctuationType;
  onClick: () => void;
  disabled?: boolean;
  isCorrect?: boolean | null;
}

const PunctuationCharacter: React.FC<PunctuationCharacterProps> = ({ 
  mark, 
  onClick, 
  disabled,
  isCorrect 
}) => {
  const getBackgroundColor = () => {
    if (isCorrect === null) return 'transparent';
    return isCorrect ? '#4caf50' : '#f44336';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: getBackgroundColor(),
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
      }}
    >
      {mark === 'period' && '.'}
      {mark === 'exclamation' && '!'}
      {mark === 'question' && '?'}
      {mark === 'comma' && ','}
    </button>
  );
};

export default PunctuationCharacter;
