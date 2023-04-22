import React, { useEffect, useRef, useState } from 'react';
import { GameContext, GameState } from '../../game-context/game-context';
import './game-modal.css';

import Window from '../window/window';
import FullscreenModal from '../fullscreen-modal/fullscreen-modal';

const GameRecapModal: React.FC<{
  context: GameContext;
  closeModal: () => void;
}> = ({ context, closeModal }) => {
  const [countdown, setCountdown] = useState<number>(30);

  useEffect(() => {
    const interval = setInterval(
      () => setCountdown((count) => (count > 0 ? count - 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <FullscreenModal>
      <div className="game__state-modal">
        <div className="game__state-modal__positioner">
          <Window title={`Round recap`} showButtons={false}>
            <div className="game__state-modal__modal">
              <div className="game__state-modal__info-container">
                <div className="game__state-modal__info">
                  <span className="game__state-modal__info--light">
                    Status:{' '}
                    <span className="game__state-modal__info--strong">
                      Waiting for round {context.round + 1} to start
                    </span>
                  </span>
                </div>
                <div className="game__state-modal__info game__state-modal__info--margin-top">
                  <span className="game__state-modal__info--light">
                    Starting in:{' '}
                  </span>
                  <span className="game__state-modal__info--strong">
                    {countdown}s
                  </span>
                </div>
                <div className="game__state-modal__info game__state-modal__info--margin-top">
                  <span className="game__state-modal__info--light">
                    Scoreboard
                  </span>
                  <div className="game__state-modal__scoreboard">
                    {context.users
                      .sort((a, b) => b.score - a.score)
                      .map((user, index) => (
                        <div className="game__state-modal__score" key={index}>
                          <span className='game__state-modal__score__position'>{index + 1}.</span>
                          <span className='game__state-modal__score__name'>{user.user.name}</span>
                          <span>{user.score}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="game__state-modal__buttons-container">
                <button
                  className="game__state-modal__buttons__button"
                  onClick={closeModal}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </Window>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default GameRecapModal;
