import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext, GameState } from '../../game-context/game-context';
import './game-modal.css';

import Window from '../window/window';
import FullscreenModal from '../fullscreen-modal/fullscreen-modal';

const GameEndingModal: React.FC<{
  context: GameContext;
}> = ({ context }) => {
  const [countdown, setCountdown] = useState<number>(60);
  const navigate = useNavigate();

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
          <Window title={`Game ended`} showButtons={false}>
            <div className="game__state-modal__modal">
              <div className="game__state-modal__info-container">
                <div className="game__state-modal__info">
                  <span className="game__state-modal__info--light">
                    Status:{' '}
                    <span className="game__state-modal__info--strong">
                      Waiting for new game to start
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
                  <span className="game__state-modal__info--light">Podium</span>
                  <div className="game__state-modal__scoreboard">
                    {context.users
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3)
                      .map((user, index) => (
                        <div className="game__state-modal__score" key={index}>
                          <span className="game__state-modal__score__position">
                            {index + 1}.
                          </span>
                          <span className="game__state-modal__score__name">
                            {user.user.name}
                          </span>
                          <span>{user.score}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="game__state-modal__buttons-container">
                <button
                  className="game__state-modal__buttons__button"
                  onClick={() => navigate('/')}
                >
                  LOBBY
                </button>
              </div>
            </div>
          </Window>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default GameEndingModal;
