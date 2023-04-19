import { useEffect, useState } from 'react';

export enum WebSocketStatus {
  OPEN,
  CLOSED,
}

const useWebSocket = (url: string) => {
  const [webSocket, setWebSocket] = useState<WebSocket>();
  const [webSocketStatus, setWebSocketStatus] = useState<WebSocketStatus>(
    WebSocketStatus.CLOSED
  );

  useEffect(() => {
    const webSocket = new WebSocket(url);

    webSocket.addEventListener('close', () =>
      setWebSocketStatus(WebSocketStatus.CLOSED)
    );
    webSocket.addEventListener('open', () =>
      setWebSocketStatus(WebSocketStatus.OPEN)
    );

    setWebSocket(webSocket);
  }, [url]);

  return [webSocket, webSocketStatus] as const;
};

export default useWebSocket;
