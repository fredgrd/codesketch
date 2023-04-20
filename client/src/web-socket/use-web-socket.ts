import { useEffect, useState } from 'react';
import { User } from '../user/user';

export enum WebSocketStatus {
  OPEN,
  CLOSED,
}

const useWebSocket = () => {
  const [webSocket, setWebSocket] = useState<WebSocket>();
  const [webSocketStatus, setWebSocketStatus] = useState<WebSocketStatus>(
    WebSocketStatus.CLOSED
  );

  useEffect(() => {
    return () => {
      webSocket?.removeEventListener('close', updateOnClose);
      webSocket?.removeEventListener('open', updateOnOpen);
    };
  }, []);

  const updateOnOpen = () => setWebSocketStatus(WebSocketStatus.OPEN);
  const updateOnClose = () => setWebSocketStatus(WebSocketStatus.CLOSED);

  const connect = (user: User) => {
    const webSocket = new WebSocket(
      `ws://localhost:3001/?id=${user.id}&name=${user.name}`
    );

    webSocket.addEventListener('close', updateOnClose);
    webSocket.addEventListener('open', updateOnClose);

    setWebSocket(webSocket);
  };

  return [webSocket, webSocketStatus, connect] as const;
};

export default useWebSocket;
