import express, { Express } from 'express';
import http, { Server, IncomingMessage } from 'http';
import ws, { Server as WebSocketServer, WebSocket } from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

app.use(express.json());

// Http Server
const server: Server = http.createServer(app);

// WebSocket Server
const wsServer: WebSocketServer = new ws.Server({ server });

import { onConnection } from './controllers/webSocketController';
import { GameWebSocket } from './models/game-web-socket';
wsServer.on('connection', (ws: WebSocket, req: IncomingMessage) =>
  onConnection(wsServer, ws as GameWebSocket, req)
);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`⚡️ Server started on http://localhost:${PORT}`);
});
