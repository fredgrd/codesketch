import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import { WebSocketStatus } from '../../web-socket/use-web-socket';

import './canvas.css';

interface Point {
  x: number;
  y: number;
}

const DrawerCanvas: React.FC = () => {
  const context = useContext(WebSocketContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef<boolean>(false);

  useEffect(() => {
    window.addEventListener('mousemove', mouseHandler);

    return () => window.removeEventListener('mousemove', mouseHandler);
  }, []);

  useEffect(() => {
    if (context?.ws) {
      // context.ws.addEventListener('message', () => {});
    }
  }, [context]);

  const mouseHandler = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const ws = context?.ws;

    // Point w/ respect to canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect && ws) {
      const point: Point = {
        x: clientX - canvasRect.left,
        y: clientY - canvasRect.y,
      };

      if (
        point.x >= 0 &&
        point.x <= canvasRect.width &&
        point.y >= 0 &&
        point.y <= canvasRect.height
      ) {
        ws.send(
          JSON.stringify({
            action: isDrawing.current ? 'DRAW' : 'MOVE',
            payload: point,
          })
        );
      }
    }
  };

  const mouseDownHandler = () => {
    isDrawing.current = true;
    // Should update last point
  };

  const mouseUpHandler = () => {
    isDrawing.current = false;
  };

  return (
    <div className="canvas">
      <canvas
        className="canvas__drawing-canvas"
        ref={canvasRef}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
      ></canvas>
    </div>
  );
};

export default DrawerCanvas;
