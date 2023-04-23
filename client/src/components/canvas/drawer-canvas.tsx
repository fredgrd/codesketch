import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../web-socket/web-socket-context';

import './canvas.css';
import CanvasTools from './canvas-tools';

interface Point {
  x: number;
  y: number;
}

export enum Tool {
  PENCIL,
  ERASER,
  BUCKET,
}

const DrawerCanvas: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eraserRef = useRef<HTMLDivElement>(null);
  const isClicking = useRef<boolean>(false);
  const lastPoint = useRef<Point>();
  const history = useRef<ImageData[]>([]);
  const tool = useRef<Tool>(Tool.PENCIL);
  const color = useRef<string>('black');
  const width = useRef<number>(5);

  useEffect(() => {
    window.addEventListener('mousemove', mouseHandler);

    return () => window.removeEventListener('mousemove', mouseHandler);
  }, []);

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
        switch (tool.current) {
          case Tool.ERASER: {
            if (eraserRef.current) {
              eraserRef.current.style.opacity = '1';
              eraserRef.current.style.top = `${
                point.y * canvasRect.height - 35
              }px`;
              eraserRef.current.style.left = `${
                point.x * canvasRect.width - 35
              }px`;
              break;
            }
          }
        }

        if (isClicking.current) {
          if (tool.current === Tool.PENCIL || tool.current === Tool.ERASER) {
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
                  color: tool.current === Tool.PENCIL ? color.current : 'white',
                  width: tool.current === Tool.PENCIL ? width.current : 70,
                },
              })
            );
            draw(
              { x: clientX - canvasRect.left, y: clientY - canvasRect.y },
              tool.current === Tool.PENCIL ? color.current : 'white',
              tool.current === Tool.PENCIL ? width.current : 70
            );
          }
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
    isClicking.current = true;
  };

  const mouseUpHandler = () => {
    isClicking.current = false;
    lastPoint.current = undefined;

    const ctx = canvasRef.current?.getContext('2d');
    const data = ctx?.getImageData(0, 0, 600, 600);
    if (data) {
      history.current.push(data);
    }

    console.log(history.current.length);
  };

  const draw = (end: Point, color: string, width: number) => {
    if (!isClicking.current) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const start = lastPoint.current ?? end;

    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(start.x, start.y, width / 2, 0, 2 * Math.PI);
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
      <CanvasTools
        setColor={(val: string) => {
          color.current = val;
        }}
        setWidth={(val: number) => {
          width.current = val;
        }}
        setTool={(val: Tool) => {
          tool.current = val;
        }}
      />
      <div
        className="canvas__eraser"
        ref={eraserRef}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
      />
    </div>
  );
};

export default DrawerCanvas;
