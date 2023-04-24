import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import { Tool } from '../../drawing/tool';
import { Point } from '../../drawing/point';
import { Color } from '../../drawing/color';
import './canvas.css';

import Bucket from '../../assets/bucket.png';

import CanvasTools from './canvas-tools';

const CANVAS_WIDTH = 600;

const HEX_TO_RGB: { [id: string]: number[] } = {
  '#000000': [0, 0, 0, 255],
  '#9DD241': [157, 210, 65, 255],
  '#FF6C20': [255, 108, 32, 255],
  '#FF3737': [255, 55, 55, 255],
  '#FFB4DE': [255, 180, 222, 255],
  '#9123F3': [145, 35, 243, 255],
  '#2469FF': [36, 105, 255, 255],
  '#A7F4FF': [167, 244, 255, 255],
};

const DrawerCanvas: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eraserRef = useRef<HTMLDivElement>(null);
  const bucketRef = useRef<HTMLDivElement>(null);
  const isClicking = useRef<boolean>(false);
  const lastPoint = useRef<Point>();
  const tool = useRef<Tool>(Tool.PENCIL);
  const color = useRef<string>('#000000');
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
      const point: Point = new Point(
        clientX - canvasRect.left,
        clientY - canvasRect.top
      );

      const { x, y } = point.pctCoords;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        // Move eraser
        switch (tool.current) {
          case Tool.ERASER: {
            if (eraserRef.current) {
              eraserRef.current.style.top = `${point.y - 35}px`;
              eraserRef.current.style.left = `${point.x - 35}px`;
            }
            break;
          }
          case Tool.BUCKET: {
            if (bucketRef.current) {
              bucketRef.current.style.top = `${point.y - 20}px`;
              bucketRef.current.style.left = `${point.x - 20}px`;
            }
            break;
          }
        }

        if (isClicking.current) {
          if (tool.current === Tool.PENCIL || tool.current === Tool.ERASER) {
            ws.send(
              JSON.stringify({
                action: 'DRAW',
                payload: {
                  start: lastPoint.current
                    ? lastPoint.current.pctCoords
                    : point.pctCoords,
                  end: point.pctCoords,
                  color: tool.current === Tool.PENCIL ? color.current : 'white',
                  width: tool.current === Tool.PENCIL ? width.current : 70,
                },
              })
            );

            draw(
              point,
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

  const onBucketClick = () => {
    if (tool.current !== Tool.BUCKET || !bucketRef.current) return;
    const top = parseInt(bucketRef.current.style.top);
    const left = parseInt(bucketRef.current.style.left);

    const point = new Point(left + 20, top + 20, CANVAS_WIDTH);

    floodFill(point);
  };

  const floodFill = (point: Point) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_WIDTH);
    const data = imageData.data;

    let count = 0;

    const stackedPoints: { [id: string]: boolean } = {};
    stackedPoints[point.key] = true;
    const pointStack: Point[] = [point];
    const targetColor = point.getColor(data);
    const finalColor = HEX_TO_RGB[color.current];

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
        const point = new Point(curr.x - 1, curr.y, CANVAS_WIDTH);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }

      if (
        curr.x + 1 < CANVAS_WIDTH &&
        stackedPoints[`${curr.x + 1}**${curr.y}`] === undefined
      ) {
        const point = new Point(curr.x + 1, curr.y, CANVAS_WIDTH);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }

      if (
        curr.y - 1 >= 0 &&
        stackedPoints[`${curr.x}**${curr.y - 1}`] === undefined
      ) {
        const point = new Point(curr.x, curr.y - 1, CANVAS_WIDTH);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }

      if (
        curr.y + 1 < CANVAS_WIDTH &&
        stackedPoints[`${curr.x}**${curr.y + 1}`] === undefined
      ) {
        const point = new Point(curr.x, curr.y + 1, CANVAS_WIDTH);
        pointStack.push(point);
        stackedPoints[point.key] = true;
      }

      count++;
    }

    console.log(count);
    ctx.putImageData(imageData, 0, 0);
  };

  const setToolsOpacity = (tool: Tool) => {
    switch (tool) {
      case Tool.PENCIL: {
        if (bucketRef.current) {
          bucketRef.current.style.display = 'none';
        }

        if (eraserRef.current) {
          eraserRef.current.style.display = 'none';
        }

        break;
      }
      case Tool.ERASER: {
        if (bucketRef.current) {
          bucketRef.current.style.display = 'none';
        }

        if (eraserRef.current) {
          eraserRef.current.style.display = 'block';
        }

        break;
      }
      case Tool.BUCKET: {
        if (bucketRef.current) {
          bucketRef.current.style.display = 'block';
        }

        if (eraserRef.current) {
          eraserRef.current.style.display = 'none';
        }
      }
    }
  };

  return (
    <div className="canvas">
      <canvas
        className="canvas__drawing-canvas"
        height={CANVAS_WIDTH}
        width={CANVAS_WIDTH}
        ref={canvasRef}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
        onClick={onBucketClick}
      ></canvas>
      <CanvasTools
        setColor={(val: string) => {
          setToolsOpacity(Tool.PENCIL);
          tool.current = Tool.PENCIL;
          color.current = val;
        }}
        setWidth={(val: number) => {
          setToolsOpacity(Tool.PENCIL);
          tool.current = Tool.PENCIL;
          width.current = val;
        }}
        setTool={(val: Tool) => {
          setToolsOpacity(val);
          tool.current = val;
        }}
      />
      <div
        className="canvas__eraser"
        ref={eraserRef}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
      />
      <div
        className="canvas__bucket"
        ref={bucketRef}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
      >
        <img className="canvas__bucket__image" src={Bucket} />
      </div>
    </div>
  );
};

export default DrawerCanvas;
