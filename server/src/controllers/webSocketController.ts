import { WebSocket, Server, RawData } from 'ws';
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

  // Check if user model is ok
  const user = parse(req.url || '', true).query as unknown as User;

  if (!user || !user.id || !user.name) {
    ws.close();
    // TODO: Redirect user to home or prompt to open socket again
    return;
  }

  // Find an available game
  const game = GAMES.find((e) => e.users.length < 5);
  if (game) {
    game.users.push({ user, score: 0 });
  } else {
    const newGame: GameContext = {
      state: GameState.WAITING_FOR_PLAYERS,
      round: 0,
      selectedUser: null,
      users: [{ user, score: 0 }],
      messages: [],
    };
    GAMES.push(newGame);
  }

  ws.on('message', (data: RawData) => onMessage(wss, ws, data));

  // Update game context
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
    default:
      console.log('default');
  }
};
