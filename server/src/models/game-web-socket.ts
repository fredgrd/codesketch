import { WebSocket } from 'ws';
import { User } from './user';

export interface GameWebSocket extends WebSocket {
  user: User | undefined;
  gameId: string | undefined;
}