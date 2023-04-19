import express, { Express } from 'express';
import http, { Server } from 'http';
import ws, { Server as WebSocketServer, WebSocket } from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

const app: Express = express();

// Http Server
const server: Server = http.createServer(app);

// WebSocket Server
const wsServer: WebSocketServer = new ws.Server({ server });

import { onConnection } from './controllers/webSocketController';
wsServer.on('connection', (ws: WebSocket) => onConnection(wsServer, ws));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`⚡️ Server started on http://localhost:${PORT}`);
});
