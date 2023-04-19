import { WebSocket, Server, RawData } from 'ws';

import {
  WSMessage,
  WSMessageActionPayloadDraw,
  WSMessageActionPayloadMove,
} from '../models/wsMessage';

export const onConnection = (wss: Server, ws: WebSocket) => {
  ws.on('message', (data: RawData) => onMessage(wss, ws, data));
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
