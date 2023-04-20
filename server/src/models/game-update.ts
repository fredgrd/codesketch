import { GameContext } from './game-context';
import { WebSocketMessage } from './web-socket-message';

export interface GameUpdate {
  type: GameUpdateType;
  context?: GameContext;
  message?: WebSocketMessage;
}

export enum GameUpdateType {
  CONTEXT = 'CONTEXT',
  MESSAGE = 'MESSAGE',
}

export const sendUpdate = (
  type: GameUpdateType,
  value: GameContext | WebSocketMessage | undefined
): string => {
  if (value === undefined) {
    return 'Error: Value is UNDEFINED';
  }

  switch (type) {
    case GameUpdateType.CONTEXT: {
      return JSON.stringify({
        type: GameUpdateType.CONTEXT,
        context: value as GameContext,
      });
    }
    case GameUpdateType.MESSAGE: {
      return JSON.stringify({
        type: GameUpdateType.MESSAGE,
        message: value as WebSocketMessage,
      });
    }
  }
};
