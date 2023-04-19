import express, { Express } from 'express';
import http, { Server } from 'http';
import ws, { Server as WebSocketServer } from 'ws';

const app: Express = express();

// Http Server
const server: Server = http.createServer(app);

// WebSocket Server
const wsServer: WebSocketServer = new ws.Server({ server });

