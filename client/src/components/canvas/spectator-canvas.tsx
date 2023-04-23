import React, { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import {
  GameMessageAction,
  GameMessageDrawPayload,
  GameMessageMovePayload,
  GameUpdate,
  GameUpdateType,
} from '../../game-context/game-context';
import './canvas.css';

const SpectatorCanvas: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const history = useRef(null);

  useEffect(() => {
    if (webSocket?.ws) {
      webSocket.ws.addEventListener('message', handleGameUpdate);
    }

    return () =>
      webSocket?.ws?.removeEventListener('message', handleGameUpdate);
  }, [webSocket]);

  const handleGameUpdate = (ev: MessageEvent) => {
    const data = JSON.parse(ev.data) as GameUpdate;
    console.log('SPECTATOR CANVAS', data);

    if (data && data.type === GameUpdateType.MESSAGE) {
      switch (data.message.action) {
        case GameMessageAction.MOVE: {
          const payload = data.message.payload as GameMessageMovePayload;
          moveCursor(payload);
          break;
        }
        case GameMessageAction.DRAW: {
          const payload = data.message.payload as GameMessageDrawPayload;
          draw(payload.start, payload.end, payload.color, payload.width);
          moveCursor(payload.end);
          break;
        }
      }
    }
  };

  const moveCursor = (to: { x: number; y: number }) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const left = Math.floor(to.x * canvasRect.width);
    const top = Math.floor(to.y * canvasRect.height);

    if (cursorRef.current) {
      cursorRef.current.style.top = `${top}px`;
      cursorRef.current.style.left = `${left}px`;
    }
  };

  const draw = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    lineColor: string,
    lineWidth: number
  ) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const ctx = canvasRef.current?.getContext('2d');
    if (!canvasRect || !ctx) return;

    const startX = Math.floor(start.x * canvasRect.width);
    const startY = Math.floor(start.y * canvasRect.height);
    const endX = Math.floor(end.x * canvasRect.width);
    const endY = Math.floor(end.y * canvasRect.height);

    console.log(startX, startY, endX, endY);

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = lineColor
    ctx.arc(startX, startY, lineWidth / 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  return (
    <div className="canvas">
      <canvas
        className="canvas__drawing-canvas"
        height={600}
        width={600}
        ref={canvasRef}
      ></canvas>
      <div className="canvas__cursor" ref={cursorRef}></div>
    </div>
  );
};

export default SpectatorCanvas;
