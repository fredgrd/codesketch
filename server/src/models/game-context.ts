import { User } from './user';

export interface GameContext {
  id: string;
  state: GameState;
  round: number;
  selectedUser: string | null;
  word: string | null;
  users: { user: User; score: number; hasGuessed: boolean }[];
  messages: GameMessage[];
}

export enum GameState {
  WAITING_FOR_PLAYERS = 'WAITING_FOR_PLAYERS',
  GAME_STARTED = 'GAME_STARTED',
  ROUND_STARTED = 'ROUND_STARTED',
  ROUND_ENDED = 'ROUND_ENDED',
  GAME_ENDED = 'GAME_ENDED',
}

export interface GameMessage {
  senderName: string;
  timestamp: string;
  highlight: boolean;
  highlightColor: string;
  text: string;
}

export interface GameUpdate {
  type: GameState;
  user_selected: string | undefined;
}
