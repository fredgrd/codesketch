import { randomUUID } from 'crypto';
import { User } from './user';
import { words } from '../assets/words';

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

/**
 * Creates a new game context. The game is
 * initiated in the LOBBY state. The user
 * provided becomes the first in the game.
 * @param user
 * @returns
 */
export const createGame = (user: User): GameContext => {
  const context: GameContext = {
    id: randomUUID(),
    gameState: GameState.WAITING,
    roundState: RoundState.WAITING,
    round: 0,
    selectedUser: null,
    selectedUserIndex: null,
    word: '',
    users: [{ user, score: 0, hasGuessed: false }],
    messages: [],
  };

  return context;
};

/**
 * Selects which user will draw this turn.
 * Starts from the first user in the array
 * and moves to the next at the end of each turn.
 * @param lastIndex
 * @param users
 * @returns
 */
export const selectUser = (
  lastIndex: number | null,
  users: { user: User; score: number; hasGuessed: boolean }[]
): { id: string; index: number } => {
  if (lastIndex === null) {
    return { id: users[0].user.id, index: 0 };
  }

  console.log(lastIndex, users.length);

  const index = lastIndex + 1 < users.length ? lastIndex + 1 : 0;
  console.log(index);
  return { id: users[index].user.id, index };
};

/**
 * Selects the word to guess in the current
 * round
 * @returns
 */
export const selectWord = (): string => {
  const index = Math.floor(Math.random() * (words.length - 1));

  return words[index];
};
