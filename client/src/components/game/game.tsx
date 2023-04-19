import React, { useEffect, useState } from 'react';
import useWebSocket from '../../web-socket/use-web-socket';
import { WebSocketContext } from '../../web-socket/ws-context';
import './game.css';
import Canvas from '../canvas/drawer-canvas';
import DrawerCanvas from '../canvas/drawer-canvas';

const Game: React.FC = () => {
  const [ws, status] = useWebSocket(
    `ws://localhost:3001/?id=hh9ih98u2142n1ijni9&name=Federico`
  );
  const [isDrawer, setIsDrawer] = useState<boolean>(true);

  useEffect(() => {
    ws?.addEventListener('message', (ev: MessageEvent) => {
      console.log(ev.data);
    });
  }, [ws]);

  return (
    <WebSocketContext.Provider value={{ ws, status }}>
      <div className="game">{isDrawer ? <DrawerCanvas /> : null}</div>
    </WebSocketContext.Provider>
  );
};

export default Game;
