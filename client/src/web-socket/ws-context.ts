import { createContext } from 'react';
import { WebSocketStatus } from './use-web-socket';

export const WebSocketContext = createContext<
  | {
      ws: WebSocket | undefined;
      status: WebSocketStatus;
    }
  | undefined
>(undefined);
