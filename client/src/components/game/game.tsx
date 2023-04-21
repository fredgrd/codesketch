import React, { useContext, useEffect, useState } from 'react';
import useWebSocket from '../../web-socket/use-web-socket';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import './game.css';
import DrawerCanvas from '../canvas/drawer-canvas';
import SpectatorCanvas from '../canvas/spectator-canvas';
import { GameContext } from '../../game-context/game-context-provider';
import {
  GameContext as Context,
  GameUpdate,
  GameUpdateType,
} from '../../game-context/game-context';
import { UserContext } from '../../user/user-context';
import Chat from '../chat/chat';

const Game: React.FC = () => {
  const user = useContext(UserContext);
  const [ws, status, connect] = useWebSocket();
  const [context, setContext] = useState<Context>();

  // Timer to check WS Connection

  useEffect(() => {
    if (user) {
      connect(user);
    }
  }, [user]);

  useEffect(() => {
    console.log('WEBSOCKET', ws);
    ws?.addEventListener('message', handleGameUpdate);

    return () => {
      ws?.close();
      ws?.removeEventListener('message', handleGameUpdate);
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
            {' '}
            {context?.selectedUser === user?.id ? (
              <DrawerCanvas />
            ) : (
              <SpectatorCanvas />
            )}
            <Chat />
          </div>
        </div>
      </GameContext.Provider>
    </WebSocketContext.Provider>
  );
};

export default Game;
