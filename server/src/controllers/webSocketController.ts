import { WebSocket, Server, RawData, OPEN } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { WebSocketMessage } from '../models/web-socket-message';
import {
  ChatMessage,
  ChatMessageType,
  GameContext,
  GameState,
  RoundState,
  createGame,
  selectUser,
  selectWord,
} from '../models/game-context';
import { User } from '../models/user';
import { GameWebSocket } from '../models/game-web-socket';
import { GameUpdateType, sendUpdate } from '../models/game-update';

let GAMES: GameContext[] = [];
const GAME_MAX_USERS: number = 5;
const GAME_MAX_ROUNDS: number = 6;
const GAME_INBETWEEN_DELAY: number = 60;
const ROUND_DURATION: number = 60;
const ROUND_INBETWEEN_DELAY: number = 30;

export const onConnection = (
  wss: Server,
  ws: GameWebSocket,
  req: IncomingMessage
) => {
  // [ START Game ]
  // Make sure this is secure enough, so that cannot imitate
  const user = parse(req.url || '', true).query as unknown as User;

  console.log('USER CONNECTED');
  console.log(`ID: ${user.id}\nNAME: ${user.name}`);

  if (!user || !user.id || !user.name) {
    ws.close();
    // TODO: Redirect user to home or prompt to open socket again
    return;
  }

  // [ START Matchmaking ]
  let game: GameContext | undefined = GAMES.find(
    (e) =>
      e.users.length < GAME_MAX_USERS &&
      !e.users.map((u) => u.user.id).includes(user.id)
  );
  if (game) {
    game.users.push({ user, score: 0, hasGuessed: false });
  } else {
    game = createGame(user);
    GAMES.push(game);
  }

  // Extend the WebSocket
  ws.user = user;
  ws.gameId = game.id;

  // Broadcast updated context
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as GameWebSocket).gameId === game!.id
    ) {
      client.send(sendUpdate(GameUpdateType.CONTEXT, game));
    }
  });

  // [ END Matchmaking ]

  // Listeners
  ws.on('message', (data: RawData) => onMessage(wss, ws, data));
  ws.on('close', () => onClose(wss, ws, game!.id));

  // [ START Start Game ]
  if (game?.users.length > 1) {
    startGame(wss, game.id);
  }
  // [ END Start Game ]
};

const onClose = (wss: Server, ws: GameWebSocket, gameId: string) => {
  const context: GameContext | undefined = GAMES.find(
    (game) => game.id === gameId
  );
  if (!context) return;

  // Update state
  context.users = context.users.filter((user) => user.user.id !== ws.user?.id);

  if (context.users.length === 1) {
    // Game is paused
    console.log('GAME IS PAUSED');
    context.gameState = GameState.WAITING;
    context.roundState = RoundState.WAITING;
  } else if (context.users.length === 0) {
    // Remove game from storage
    console.log('GAME WAS REMOVED');
    GAMES = GAMES.filter((e) => e.id !== gameId);
    return;
  }

  // Broadcast updated context
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as GameWebSocket).gameId === context!.id
    ) {
      client.send(sendUpdate(GameUpdateType.CONTEXT, context));
    }
  });
};

const startGame = (wss: Server, gameId: string) => {
  const context: GameContext | undefined = GAMES.find((e) => e.id === gameId);
  if (!context || context.users.length <= 1) return;

  console.log('STARTING NEW GAME', gameId);

  context.gameState = GameState.GAME_STARTED;
  context.roundState = RoundState.WAITING;
  context.round = 0;
  context.users = context.users.map((user) => ({
    ...user,
    score: 0,
    hasGuessed: false,
  }));

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as GameWebSocket).gameId === gameId
    ) {
      client.send(sendUpdate(GameUpdateType.CONTEXT, context));
    }
  });

  startRound(wss, gameId);
};

const startRound = (wss: Server, gameId: string) => {
  const context: GameContext | undefined = GAMES.find((e) => e.id === gameId);
  if (!context || context.gameState !== GameState.GAME_STARTED) return;

  console.log(`STARTING NEW ROUND ${context.round + 1}`, gameId);

  context.roundState = RoundState.ROUND_STARTED;
  context.round += 1;
  const { id: userId, index } = selectUser(
    context.selectedUserIndex,
    context.users
  );
  context.selectedUser = userId;
  context.selectedUserIndex = index;
  context.word = selectWord();

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as GameWebSocket).gameId === gameId
    ) {
      client.send(sendUpdate(GameUpdateType.CONTEXT, context));
    }
  });

  setTimeout(() => endRound(wss, gameId), ROUND_DURATION * 1000);
};

const endRound = (wss: Server, gameId: string) => {
  const context: GameContext | undefined = GAMES.find((e) => e.id === gameId);
  if (!context || context.gameState !== GameState.GAME_STARTED) return;

  console.log(`ENDING ROUND ${context.round}`, gameId);

  if (context.round >= GAME_MAX_ROUNDS) {
    endGame(wss, gameId);
    return;
  }

  context.roundState = RoundState.ROUND_ENDED;
  context.users = context.users.map((user) => ({
    ...user,
    hasGuessed: false,
  }));

  // Add points to drawer

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as GameWebSocket).gameId === gameId
    ) {
      client.send(sendUpdate(GameUpdateType.CONTEXT, context));
    }
  });

  setTimeout(() => {
    startRound(wss, gameId);
  }, ROUND_INBETWEEN_DELAY * 1000);
};

const endGame = (wss: Server, gameId: string) => {
  const context: GameContext | undefined = GAMES.find((e) => e.id === gameId);
  if (!context) return;

  console.log(`ENDING GAME`, gameId);

  context.gameState = GameState.GAME_ENDED;
  context.roundState = RoundState.WAITING;

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as GameWebSocket).gameId === gameId
    ) {
      client.send(sendUpdate(GameUpdateType.CONTEXT, context));
    }
  });

  setTimeout(() => startGame(wss, gameId), GAME_INBETWEEN_DELAY * 1000);
};

export const onMessage = (wss: Server, ws: GameWebSocket, data: RawData) => {
  // Data too generic
  const dataString = data.toString();
  const message = JSON.parse(dataString) as WebSocketMessage;

  // Validate message
  if (message.action === undefined || message.payload === undefined) {
    return;
  }

  // Check game state
  const game = GAMES.find((e) => e.id === ws.gameId);
  if (!game) {
    return;
  }

  switch (message.action) {
    case 'MOVE': {
      if (game.roundState !== RoundState.ROUND_STARTED) {
        return;
      }

      // Broadcast payload to all clients
      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          (client as GameWebSocket).gameId === game.id &&
          (client as GameWebSocket).user?.id !== (ws as GameWebSocket).user?.id
        ) {
          client.send(sendUpdate(GameUpdateType.MESSAGE, message));
        }
      });

      break;
    }
    case 'DRAW': {
      if (game.roundState !== RoundState.ROUND_STARTED) {
        return;
      }

      // Broadcast payload to all clients
      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          (client as GameWebSocket).gameId === game.id &&
          (client as GameWebSocket).user?.id !== (ws as GameWebSocket).user?.id
        ) {
          client.send(sendUpdate(GameUpdateType.MESSAGE, message));
        }
      });

      break;
    }
    case 'TEXT': {
      const payload = message.payload as unknown as {
        content: string;
        timestamp: string;
      };

      const chatMessage: ChatMessage = {
        type: ChatMessageType.TEXT,
        content: payload.content,
        senderName: (ws as GameWebSocket).user?.name || 'Unknown',
        timestamp: payload.timestamp,
      };
      game.messages.push(chatMessage);

      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          (client as GameWebSocket).gameId === game.id
        ) {
          client.send(sendUpdate(GameUpdateType.CONTEXT, game));
        }
      });

      break;
    }
    case 'GUESS': {
      const payload = message.payload as unknown as {
        timestamp: string;
      };

      const chatMessage: ChatMessage = {
        type: ChatMessageType.GUESS,
        content: '',
        senderName: (ws as GameWebSocket).user?.name || 'Unknown',
        timestamp: payload.timestamp,
      };
      game.messages.push(chatMessage);

      // Handle scoring
      const correctGuesses = game.users.reduce((prev, curr) => {
        if (curr.hasGuessed) {
          return prev + 1;
        } else {
          return prev;
        }
      }, 0);

      const user = game.users.find(
        (e) => e.user.id === (ws as GameWebSocket).user?.id
      );
      if (!user) return;
      user.hasGuessed = true;
      user.score += 100 * Math.max(0, 3 - correctGuesses);

      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          (client as GameWebSocket).gameId === game.id
        ) {
          client.send(sendUpdate(GameUpdateType.CONTEXT, game));
        }
      });

      break;
    }
  }
};
