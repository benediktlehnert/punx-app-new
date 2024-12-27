import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import startImage from '../assets/images/punx-start.png';
import '../styles/StartScreen.css';

const StartScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="start-screen">
      <img src={startImage} alt="Punx" className="start-image" />
      <main className="start-content">
        <Button 
          onClick={() => navigate('/select')}
          fullWidth
        >
          Start Game
        </Button>
      </main>
    </div>
  );
};

export default StartScreen;
