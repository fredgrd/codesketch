import React, { useContext, useEffect, useState } from 'react';
import './landing.css';
import { UserContext } from '../../user/user-context';
import { User } from '../../user/user';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC<{ setUser: (user: User) => void }> = ({ setUser }) => {
  const user = useContext(UserContext);
  const [shouldNavigate, setShoudlNavigate] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && shouldNavigate) {
      setShoudlNavigate(false);
      navigate('/game');
    }
  }, [user]);

  const navigateToGame = () => {
    const user: User = {
      id: uuidv4(),
      name: 'Federico',
    };
    setShoudlNavigate(true);
    setUser(user);
  };

  return (
    <div className="landing">
      <div className="landing__input">
        <button onClick={navigateToGame}>HELLO THERE</button>
      </div>
    </div>
  );
};

export default Landing;
