import React from 'react';
import { GameContext, GameState } from '../../game-context/game-context';
import './game-modal.css';

import Window from '../window/window';
import FullscreenModal from '../fullscreen-modal/fullscreen-modal';
import { useNavigate } from 'react-router-dom';

const GameWaitingModal: React.FC<{
  context: GameContext | undefined;
  showError: boolean;
}> = ({ context, showError }) => {
  const navigate = useNavigate();

  return (
    <FullscreenModal>
      <div className="game__state-modal">
        <div className="game__state-modal__positioner">
          <Window title="Game status" showButtons={false}>
            <div className="game__state-modal__modal">
              <div className="game__state-modal__info-container">
                <div className="game__state-modal__info">
                  <span className="game__state-modal__info--light">
                    Status:{' '}
                    <span className="game__state-modal__info--strong">
                      Waiting for players..
                    </span>
                  </span>
                </div>
                <div className="game__state-modal__info game__state-modal__info--margin-top">
                  <span className="game__state-modal__info--light">
                    Players:{' '}
                    <span className="game__state-modal__info--strong">
                      {`${context?.users.length || 0} ${
                        (context?.users.length || 2) > 1 ? 'players' : 'player'
                      } connected`}
                    </span>
                  </span>
                </div>
                {showError && (
                  <div className="game__state-modal__info game__state-modal__info--margin-top">
                    <span className="game__state-modal__info--strong game__state-modal__info--error">
                      Error: Connection couldn&apost be established.
                    </span>
                    <span className="game__state-modal__info--strong game__state-modal__info--error">
                      Return to lobby to start a new game.
                    </span>
                  </div>
                )}
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

export default GameWaitingModal;
