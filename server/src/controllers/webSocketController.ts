import { WebSocket, Server, RawData } from 'ws';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import {
  WSMessage,
  WSMessageActionPayloadDraw,
  WSMessageActionPayloadMove,
} from '../models/wsMessage';
import { GameContext, GameState } from '../models/game-context';
import { User } from '../models/user';

const GAMES: GameContext[] = [];

export const onConnection = (
  wss: Server,
  ws: WebSocket,
  req: IncomingMessage
) => {
  console.log('SOMETHING CONNECTED');

  // [ START Game ]
  const user = parse(req.url || '', true).query as unknown as User;

  if (!user || !user.id || !user.name) {
    ws.close();
    // TODO: Redirect user to home or prompt to open socket again
    return;
  }

  // Find an available game
  let game: GameContext | undefined = GAMES.find((e) => e.users.length < 5);
  if (game) {
    game.users.push({ user, score: 0, hasGuessed: false });
  } else {
    game = {
      id: randomUUID(),
      state: GameState.WAITING_FOR_PLAYERS,
      round: 0,
      selectedUser: null,
      word: null,
      users: [{ user, score: 0, hasGuessed: false }],
      messages: [],
    };
    GAMES.push(game);
  }
  // [ END Game ]

  // Listeners
  ws.on('message', (data: RawData) => onMessage(wss, ws, data));

  // [ START Update Game ]
  console.log('GAME', game);
  if (game?.users.length === 1) {
    // Should start game
    startGame(wss, game.id);
  }
};

const startGame = (wss: Server, id: string) => {
  const gameContext: GameContext | undefined = GAMES.find((e) => e.id === id);
  if (!gameContext) return;

  gameContext.state = GameState.GAME_STARTED;

  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      const update: string = JSON.stringify(gameContext);
      ws.send(update);
    }
  });

  startRound(wss, id);
};

const startRound = (wss: Server, id: string) => {
  const gameContext: GameContext | undefined = GAMES.find((e) => e.id === id);
  if (!gameContext) return;

  gameContext.state = GameState.ROUND_STARTED;
  gameContext.round += 1;
  gameContext.selectedUser = gameContext.users[0].user.id;
  gameContext.word = 'Linked List';

  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      const update: string = JSON.stringify(gameContext);
      ws.send(update);
    }
  });

  setTimeout(() => endRound(wss, id), 5000);
};

const endRound = (wss: Server, id: string) => {
  const gameContext: GameContext | undefined = GAMES.find((e) => e.id === id);
  if (!gameContext) return;

  gameContext.state = GameState.ROUND_ENDED;
  gameContext.users = gameContext.users.map((user) => ({
    ...user,
    hasGuessed: false,
  }));

  // Points

  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      const update: string = JSON.stringify(gameContext);
      ws.send(update);
    }
  });

  setTimeout(() => {
    console.log('NEW ROUND OR END GAME');
    if (gameContext.round < 6) {
      startRound(wss, id);
    } else {
      console.log('END GAME');
    }
  }, 2000);
};

export const onMessage = (wss: Server, ws: WebSocket, data: RawData) => {
  const dataString = data.toString();
  const dataParsed = JSON.parse(dataString) as WSMessage;

  if (dataParsed.action === undefined || dataParsed.payload === undefined) {
    return;
  }

  switch (dataParsed.action) {
    case 'MOVE':
      const movePayload = dataParsed.payload as WSMessageActionPayloadMove;
      console.log('MOVE TO', movePayload);
      // TODO: Check if payload is valid
      break;
    case 'DRAW':
      const drawPayload = dataParsed.payload as WSMessageActionPayloadDraw;
      console.log('DRAW ON', drawPayload);
      // TODO: Check if payload is valid
      break;
    case 'TEXT':
      const textPayload = dataParsed.payload as unknown as string;
      const game = GAMES[0];

      if (game.state === GameState.ROUND_STARTED) {
        game.users[0].score += 250;
        game.users[0].hasGuessed = true;
      }
    case 'GUESS':
      const textPayload = dataParsed.payload as unknown as string;
      const game = GAMES[0];

      if (game.state === GameState.ROUND_STARTED) {
        game.users[0].score += 250;
        game.users[0].hasGuessed = true;
      }
    default:
      console.log('default');
  }
};
