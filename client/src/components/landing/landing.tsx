import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from '../../user/user-context';
import { User } from '../../user/user';
import './landing.css';

import Window from '../window/window';

import CodeSketch from '../../assets/codesketch.png';
import Background from '../../assets/background.png';

const Landing: React.FC<{ setUser: (user: User) => void }> = ({ setUser }) => {
  const user = useContext(UserContext);
  const [name, setName] = useState<string>('');
  const [shouldNavigate, setShoudlNavigate] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && shouldNavigate) {
      setShoudlNavigate(false);
      navigate('/game');
    }
  }, [user]);

  const navigateToGame = () => {
    if (!name) return;

    const user: User = {
      id: uuidv4(),
      name: name,
    };
    setShoudlNavigate(true);
    setUser(user);
  };

  return (
    <div className="landing">
      <div className="landing__menu">
        <Window title="Lobby" showButtons={false}>
          <div className="landing__menu__content">
            <div className="landing__menu__message">
              <img className="landing__menu__logo" src={CodeSketch} />
            </div>
            <div className="landing__menu__input">
              <img
                className="landing__user-avatar"
                src={`https://api.dicebear.com/6.x/pixel-art/svg?seed=${
                  name.length ? name : 'codesketch'
                }&backgroundColor=062623&scale=90`}
              />
              <input
                className="landing__name-input"
                placeholder="Type your name.."
                type="text"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
              />
            </div>
            <div className="landing__menu__start">
              <button
                className="landing__start__button"
                onClick={navigateToGame}
              >
                START
              </button>
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
};

export default Landing;
