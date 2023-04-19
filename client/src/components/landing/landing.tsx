import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing__input">
        <button onClick={() => navigate('/game')}>HELLO THERE</button>
      </div>
    </div>
  );
};

export default Landing;
