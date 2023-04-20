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
  messages: string[];
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
}

type GameMessagePayload = GameMessageMovePayload | GameMessageDrawPayload;

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
}