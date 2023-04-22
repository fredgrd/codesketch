import React, { useContext, useEffect, useState } from 'react';
import useWebSocket from '../../web-socket/use-web-socket';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import './game.css';
import DrawerCanvas from '../canvas/drawer-canvas';
import SpectatorCanvas from '../canvas/spectator-canvas';
import { GameContext } from '../../game-context/game-context-provider';
import {
  GameContext as Context,
  GameState,
  GameUpdate,
  GameUpdateType,
  RoundState,
} from '../../game-context/game-context';
import { UserContext } from '../../user/user-context';
import Chat from '../chat/chat';
import { useNavigate } from 'react-router-dom';
import GameWaitingModal from './game-waiting-modal';
import GameRecapModal from './game-recap-modal';
import GameEndingModal from './game-ending-modal';
import Players from '../players/players';
import Window from '../window/window';
import Word from '../word/word';

const Game: React.FC = () => {
  const user = useContext(UserContext);
  const [ws, status, connect] = useWebSocket();
  const [context, setContext] = useState<Context>();
  const [wsError, setWsError] = useState<boolean>(false);
  const [showRecap, setShowRecap] = useState<boolean>(false);

  // Timer to check WS Connection

  useEffect(() => {
    if (user) {
      connect(user);
    }
  }, [user]);

  useEffect(() => {
    if (context && context.roundState === RoundState.ROUND_STARTED) {
      setShowRecap(true);
    }
  }, [context]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ws) setWsError(true);
    }, 20000);

    ws?.addEventListener('message', handleGameUpdate);

    return () => {
      ws?.close();
      ws?.removeEventListener('message', handleGameUpdate);
      clearTimeout(timeout);
    };
  }, [ws]);

  const handleGameUpdate = (ev: MessageEvent) => {
    const data = JSON.parse(ev.data) as GameUpdate;
    console.log(data);

    if (data && data.type === GameUpdateType.CONTEXT) {
      const context = data.context as Context;
      setContext(context);
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, status }}>
      <GameContext.Provider value={context}>
        <div className="game">
          <div className="game__components">
            <Players context={context} />

            <div className="game__canvas__positioner">
              <Window title="Masterpiece.png">
                {context?.selectedUser === user?.id ? (
                  <DrawerCanvas />
                ) : (
                  <SpectatorCanvas />
                )}
              </Window>
            </div>

            <Chat />

            <Word />
          </div>
        </div>

        {/* [ START WAITING MODAL ] */}

        {/* Modal is displayed if WS is undefined, if theres no context, of if the game is still waiting to start */}
        {(!context || !ws || context?.gameState === GameState.WAITING) && (
          <GameWaitingModal context={context} showError={wsError} />
        )}

        {/* [ END WAITING MODAL] */}

        {/* [ START RECAP MODAL ] */}

        {/* Modal is displayed when round has ended and the game has started */}
        {showRecap &&
          context &&
          context.roundState === RoundState.ROUND_ENDED &&
          context.gameState === GameState.GAME_STARTED && (
            <GameRecapModal
              context={context}
              closeModal={() => setShowRecap(false)}
            />
          )}

        {/* [ END RECAP MODAL] */}

        {/* [ START ENDING MODAL ] */}

        {/* Modal is displayed when round has ended and the game has started */}
        {context && context.gameState === GameState.GAME_ENDED && (
          <GameEndingModal context={context} />
        )}

        {/* [ END ENDING MODAL] */}
      </GameContext.Provider>
    </WebSocketContext.Provider>
  );
};

export default Game;
