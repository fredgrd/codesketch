import { User } from './user';

export interface GameContext {
  state: GameState;
  round: number;
  selectedUser: string;
  users: { user: User; score: number }[];
  messages: GameMessage[];
}

export enum GameState {
  WAITING_FOR_PLAYERS,
  GAME_STARTED,
  SELECTING_USER,
  ROUND_STARTED,
  ROUND_ENDED,
  ROUND_RECAP,
  GAME_ENDED,
}

export interface GameMessage {
  senderName: string;
  timestamp: string;
  highlight: boolean;
  highlightColor: string;
  text: string;
}
