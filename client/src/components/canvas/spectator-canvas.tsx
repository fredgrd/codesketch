import React, { useContext, useEffect, useRef } from 'react';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import {
  GameMessageAction,
  GameMessageDrawPayload,
  GameMessageFillPayload,
  GameMessageMovePayload,
  GameUpdate,
  GameUpdateType,
} from '../../game-context/game-context';
import { Point } from '../../drawing/point';
import './canvas.css';

const SpectatorCanvas: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (webSocket?.ws) {
      webSocket.ws.addEventListener('message', handleGameUpdate);
    }

    return () =>
      webSocket?.ws?.removeEventListener('message', handleGameUpdate);
  }, [webSocket]);

  const handleGameUpdate = (ev: MessageEvent) => {
    const data = JSON.parse(ev.data) as GameUpdate;

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
        case GameMessageAction.FILL: {
          const payload = data.message.payload as GameMessageFillPayload;
          floodFill(payload.point.x, payload.point.y, payload.color);
          moveCursor(payload.point);
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

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = lineColor;
    ctx.arc(startX, startY, lineWidth / 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const floodFill = (x: number, y: number, finalColor: number[]) => {
    const point = new Point(Math.floor(x * 600), Math.floor(y * 600));
    const ws = webSocket?.ws;
    if (!canvasRef.current || !ws) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, 600, 600);
    const data = imageData.data;

    const stackedPoints: { [id: string]: boolean } = {};
    stackedPoints[point.key] = true;
    const pointStack: Point[] = [point];
    const targetColor = point.getColor(data);

    while (pointStack.length) {
      const curr = pointStack.pop()!;
      const currColor = curr.getColor(data);
      if (!currColor.compare(targetColor)) continue;

      const indexes = curr.indexes;
      data[indexes.red] = finalColor[0];
      data[indexes.green] = finalColor[1];
      data[indexes.blue] = finalColor[2];
      data[indexes.alpha] = finalColor[3];

      if (
        curr.x - 1 >= 0 &&
        stackedPoints[`${curr.x - 1}**${curr.y}`] === undefined
      ) {
        const point = new Point(curr.x - 1, curr.y, 600);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }

      if (
        curr.x + 1 < 600 &&
        stackedPoints[`${curr.x + 1}**${curr.y}`] === undefined
      ) {
        const point = new Point(curr.x + 1, curr.y, 600);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }

      if (
        curr.y - 1 >= 0 &&
        stackedPoints[`${curr.x}**${curr.y - 1}`] === undefined
      ) {
        const point = new Point(curr.x, curr.y - 1, 600);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }

      if (
        curr.y + 1 < 600 &&
        stackedPoints[`${curr.x}**${curr.y + 1}`] === undefined
      ) {
        const point = new Point(curr.x, curr.y + 1, 600);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }
    }

    ctx.putImageData(imageData, 0, 0);
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
