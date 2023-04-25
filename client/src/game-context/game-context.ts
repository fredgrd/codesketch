import { User } from '../user/user';

export interface GameUpdate {
  type: GameUpdateType;
  context?: GameContext;
  message: GameMessage;
}

export enum GameUpdateType {
  CONTEXT = 'CONTEXT',
  MESSAGE = 'MESSAGE',
}

export interface GameContext {
  id: string;
  gameState: GameState;
  roundState: RoundState;
  round: number;
  selectedUser: string | null;
  selectedUserIndex: number | null;
  word: string;
  users: { user: User; score: number; hasGuessed: boolean }[];
  messages: ChatMessage[];
}

export enum GameState {
  WAITING = 'WAITING',
  GAME_STARTED = 'GAME_STARTED',
  GAME_ENDED = 'GAME_ENDED',
}

export enum RoundState {
  WAITING = 'WAITING',
  ROUND_STARTED = 'ROUND_STARTED',
  ROUND_ENDED = 'ROUND_ENDED',
}

export interface GameMessage {
  action: GameMessageAction;
  payload: GameMessagePayload;
}

export enum GameMessageAction {
  MOVE = 'MOVE',
  DRAW = 'DRAW',
  FILL = 'FILL',
  TEXT = 'TEXT',
  GUESS = 'GUESS',
}

type GameMessagePayload =
  | GameMessageMovePayload
  | GameMessageDrawPayload
  | GameMessageFillPayload
  | GameMessageTextPayload
  | GameMessageGuessPayload;

export interface GameMessageMovePayload {
  x: number;
  y: number;
}

export interface GameMessageDrawPayload {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
  color: string;
  width: number;
}

export interface GameMessageFillPayload {
  point: {
    x: number;
    y: number;
  };
  color: number[];
}

export interface GameMessageTextPayload {
  content: string;
  timestamp: string;
}

export interface GameMessageGuessPayload {
  timestamp: string;
}

export interface ChatMessage {
  type: ChatMessageType;
  content: string;
  senderName: string;
  timestamp: string;
}

export enum ChatMessageType {
  TEXT = 'TEXT',
  GUESS = 'GUESS',
}
