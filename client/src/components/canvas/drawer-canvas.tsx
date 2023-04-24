import React, { useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '../../web-socket/web-socket-context';

import './canvas.css';

import Bucket from '../../assets/bucket.png';

import CanvasTools from './canvas-tools';

interface Point {
  x: number;
  y: number;
}

interface Color {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

export enum Tool {
  PENCIL,
  ERASER,
  BUCKET,
}

const getIndexes = (
  { x, y }: Point,
  width: number
): { red: number; green: number; blue: number; alpha: number } => {
  const red = y * (width * 4) + x * 4;
  return { red: red, green: red + 1, blue: red + 2, alpha: red + 3 };
};

const getColor = (
  { x, y }: Point,
  width: number,
  data: Uint8ClampedArray
): Color => {
  const red = y * (width * 4) + x * 4;
  const indexes = { red: red, green: red + 1, blue: red + 2, alpha: red + 3 };
  const color: Color = {
    red: data[indexes.red],
    green: data[indexes.green],
    blue: data[indexes.blue],
    alpha: data[indexes.alpha],
  };

  return color;
};

const sameColor = (color1: Color, color2: Color): boolean => {
  return (
    color1.red === color2.red &&
    color1.green === color2.green &&
    color1.blue === color2.blue &&
    color1.alpha === color2.alpha
  );
};

const DrawerCanvas: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const eraserRef = useRef<HTMLDivElement>(null);
  const bucketRef = useRef<HTMLDivElement>(null);
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
              eraserRef.current.style.top = `${
                point.y * canvasRect.height - 35
              }px`;
              eraserRef.current.style.left = `${
                point.x * canvasRect.width - 35
              }px`;
            }
            break;
          }
          case Tool.BUCKET: {
            if (bucketRef.current) {
              bucketRef.current.style.top = `${point.y * canvasRect.height}px`;
              bucketRef.current.style.left = `${point.x * canvasRect.width}px`;
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

    if (tool.current === Tool.BUCKET && bucketRef.current) {
      console.log(bucketRef.current.style.left, bucketRef.current.style.top);
      const point: Point = {
        x: parseFloat(bucketRef.current.style.left),
        y: parseFloat(bucketRef.current.style.top),
      };

      floodFill(point);
    }
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

  const fill = (
    point: Point,
    color: Color = { red: 0, green: 0, blue: 0, alpha: 1 }
  ) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, 600, 600);
    if (!data) return;

    const x = Math.round(point.x);
    const y = Math.round(point.y);
    const width = 600;
    const colorsData: Uint8ClampedArray = data.data;
    const pixelColor: Color = getColor({ x, y }, width, colorsData);

    const idx = getIndexes({ x, y }, width);
    console.log(colorsData[idx.red]);

    const visitedPoints = new Map<string, boolean>();
    const propagateColor = (
      curr: Point,
      startColor: Color,
      fillColor: Color
    ) => {
      if (!(curr.x > 0 && curr.x < 600 && curr.y > 0 && curr.y < 600)) return;

      // Color
      const color = getColor(curr, width, colorsData);
      if (!sameColor(startColor, color)) return;

      const indexes = getIndexes(curr, width);
      colorsData[indexes.red] = fillColor.red;
      colorsData[indexes.green] = fillColor.green;
      colorsData[indexes.blue] = fillColor.blue;
      colorsData[indexes.alpha] = fillColor.alpha;

      // Other directions
      propagateColor({ x: curr.x, y: curr.y - 1 }, startColor, fillColor);
      propagateColor({ x: curr.x, y: curr.y + 1 }, startColor, fillColor);
      propagateColor({ x: curr.x - 1, y: curr.y }, startColor, fillColor);
      propagateColor({ x: curr.x + 1, y: curr.y }, startColor, fillColor);
    };

    propagateColor({ x, y }, pixelColor, color);
    const newData = new ImageData(colorsData, width, width);
    ctx.putImageData(newData, 0, 0);
  };

  const floodFill = (
    fillPoint: Point,
    color: Color = { red: 0, green: 0, blue: 0, alpha: 0 }
  ) => {
    const width = 600;
    const fillStack: Point[] = [fillPoint];
    const visitedPoints = new Map<string, boolean>();

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, 600, 600);
    if (!data) return;
    const colorsData: Uint8ClampedArray = data.data;
    const startColor: Color = getColor(fillPoint, width, colorsData);

    while (fillStack.length) {
      const point: Point | undefined = fillStack.pop();
      if (!point) continue;
      if (!(point.x > 0 && point.x < 600 && point.y > 0 && point.y < 600))
        continue;

      // Visited the array
      const key = `${point.x}${point.y}`;
      if (visitedPoints.has(key)) continue;
      visitedPoints.set(key, true);

      // Color
      const valColor = getColor(point, width, colorsData);
      if (!sameColor(startColor, valColor)) continue;

      const indexes = getIndexes(point, width);
      console.log('Start', colorsData[indexes.red]);
      colorsData[indexes.red] = color.red;
      colorsData[indexes.green] = color.green;
      colorsData[indexes.blue] = color.blue;
      colorsData[indexes.alpha] = color.alpha;
      console.log('End', colorsData[indexes.red]);

      fillStack.push({ x: point.x, y: point.y - 1 });
      fillStack.push({ x: point.x, y: point.y + 1 });
      fillStack.push({ x: point.x - 1, y: point.y });
      fillStack.push({ x: point.x + 1, y: point.y });
    }

    const newData = new ImageData(colorsData, width, width);
    ctx.putImageData(newData, 0, 0);
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
        height={600}
        width={600}
        ref={canvasRef}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
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
