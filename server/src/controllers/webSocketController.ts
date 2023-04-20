import { WebSocket, Server, RawData } from 'ws';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import {
  WebSocketMessage,
  WSDrawPayload,
  WSMovePayload,
} from '../models/web-socket-message';
import {
  GameContext,
  GameState,
  RoundState,
  createGame,
  selectUser,
  selectWord,
} from '../models/game-context';
import { User } from '../models/user';
import { GameWebSocket } from '../models/game-web-socket';

const GAMES: GameContext[] = [];
const GAME_MAX_USERS: number = 5;
const GAME_MAX_ROUNDS: number = 6;

export const onConnection = (
  wss: Server,
  ws: GameWebSocket,
  req: IncomingMessage
) => {
  console.log('SOMEONE CONNECTED');

  // [ START Game ]
  // Make sure this is secure enough, so that cannot imitate
  const user = parse(req.url || '', true).query as unknown as User;

  if (!user || !user.id || !user.name) {
    ws.close();
    // TODO: Redirect user to home or prompt to open socket again
    return;
  }

  // [ START Matchmaking ]
  let game: GameContext | undefined = GAMES.find(
    (e) => e.users.length < GAME_MAX_USERS
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
      client.send(JSON.stringify(game));
    }
  });

  // [ END Matchmaking ]

  // Listeners
  ws.on('message', (data: RawData) => onMessage(wss, ws, data));

  // [ START Update Game ]
  console.log('GAME', game);
  if (game?.users.length === 2) {
    // TODO: Change to min
    startGame(wss, game.id);
  }
};

const startGame = (wss: Server, gameId: string) => {
  const gameContext: GameContext | undefined = GAMES.find(
    (e) => e.id === gameId
  );
  if (!gameContext) return;

  gameContext.gameState = GameState.GAME_STARTED;

  wss.clients.forEach((ws) => {
    if (
      ws.readyState === WebSocket.OPEN &&
      (ws as GameWebSocket).gameId === gameId
    ) {
      const update: string = JSON.stringify(gameContext);
      ws.send(update);
    }
  });

  startRound(wss, gameId);
};

const endGame = (wss: Server, id: string) => {};

const startRound = (wss: Server, gameId: string) => {
  const context: GameContext | undefined = GAMES.find((e) => e.id === gameId);
  if (!context) return;

  context.roundState = RoundState.ROUND_STARTED;
  context.round += 1;
  const { id: userId, index } = selectUser(
    context.selectedUserIndex,
    context.users
  );
  context.selectedUser = userId;
  context.selectedUserIndex = index;
  context.word = selectWord();

  wss.clients.forEach((ws) => {
    if (
      ws.readyState === WebSocket.OPEN &&
      (ws as GameWebSocket).gameId === gameId
    ) {
      const update: string = JSON.stringify(context);
      ws.send(update);
    }
  });

  setTimeout(() => endRound(wss, gameId), 45000);
};

const endRound = (wss: Server, gameId: string) => {
  const gameContext: GameContext | undefined = GAMES.find(
    (e) => e.id === gameId
  );
  if (!gameContext) return;

  gameContext.roundState = RoundState.ROUND_ENDED;
  gameContext.users = gameContext.users.map((user) => ({
    ...user,
    hasGuessed: false,
  }));

  // Points

  wss.clients.forEach((ws) => {
    if (
      ws.readyState === WebSocket.OPEN &&
      (ws as GameWebSocket).gameId === gameId
    ) {
      ws.send(JSON.stringify(gameContext));
    }
  });

  setTimeout(() => {
    console.log('NEW ROUND OR END GAME');
    if (gameContext.round < GAME_MAX_ROUNDS) {
      startRound(wss, gameId);
    } else {
      console.log('END GAME');
    }
  }, 2000);
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
  if (!game || game.gameState !== GameState.GAME_STARTED) {
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
          client.send(JSON.stringify(message));
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
          client.send(JSON.stringify(message));
        }
      });

      break;
    }
    case 'TEXT': {
      const payload = message.payload as unknown as string;
      const game = GAMES[0];

      // TODO: Pass in as a message
      wss.clients.forEach((client) => {
        //@ts-ignore
        console.log('TEXT', client.lalla, client.user);
      });
    }
    case 'GUESS': {
      const payload = message.payload as unknown as string;
      const game = GAMES[0];
    }
    default:
      console.log('default');
  }
};
