import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import { WebSocketStatus } from '../../web-socket/use-web-socket';

import './canvas.css';

interface Point {
  x: number;
  y: number;
}

const DrawerCanvas: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef<boolean>(false);
  const lastPoint = useRef<Point>();

  useEffect(() => {
    window.addEventListener('mousemove', mouseHandler);

    return () => window.removeEventListener('mousemove', mouseHandler);
  }, []);

  useEffect(() => {
    if (webSocket?.ws) {
      // context.ws.addEventListener('message', () => {});
    }
  }, [webSocket]);

  const mouseHandler = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const ws = webSocket?.ws;

    // Point w/ respect to canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect && ws) {
      const point: Point = {
        x: (clientX - canvasRect.left) / canvasRect.width,
        y: (clientY - canvasRect.y) / canvasRect.height,
      };

      if (point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1) {
        if (isDrawing.current) {
          ws.send(
            JSON.stringify({
              action: 'DRAW',
              payload: {
                start: lastPoint.current
                  ? {
                      x: lastPoint.current.x / canvasRect.width,
                      y: lastPoint.current.y / canvasRect.height,
                    }
                  : point,
                end: point,
              },
            })
          );
          draw({ x: clientX - canvasRect.left, y: clientY - canvasRect.y });
        } else {
          ws.send(
            JSON.stringify({
              action: 'MOVE',
              payload: point,
            })
          );
        }
      }
    }
  };

  const mouseDownHandler = () => {
    isDrawing.current = true;
    // Should update last point
  };

  const mouseUpHandler = () => {
    isDrawing.current = false;
    lastPoint.current = undefined;
  };

  const draw = (end: Point) => {
    if (!isDrawing.current) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const start = lastPoint.current ?? end;

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(start.x, start.y, 2.5, 0, 2 * Math.PI);
    ctx.fill();

    lastPoint.current = end;
  };

  return (
    <div className="canvas">
      <canvas
        className="canvas__drawing-canvas"
        height={600}
        width={600}
        ref={canvasRef}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
      ></canvas>
    </div>
  );
};

export default DrawerCanvas;
