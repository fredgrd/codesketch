import { Color } from './color';

interface IPoint {
  x: number;
  y: number;
  scale: number;

  readonly coords: { x: number; y: number };
  readonly pctCoords: { x: number; y: number };
  readonly key: string;
  readonly indexes: { red: number; green: number; blue: number; alpha: number };
}

export class Point implements IPoint {
  x: number;
  y: number;
  scale: number;

  constructor(x: number, y: number, scale: number = 600) {
    this.x = x;
    this.y = y;
    this.scale = scale;
  }

  get key(): string {
    return `${this.x}**${this.y}`;
  }

  get coords(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  get pctCoords(): { x: number; y: number } {
    return { x: this.x / this.scale, y: this.y / this.scale };
  }

  get indexes(): { red: number; green: number; blue: number; alpha: number } {
    const red = this.y * (this.scale * 4) + this.x * 4;
    return { red: red, green: red + 1, blue: red + 2, alpha: red + 3 };
  }

  getColor(data: Uint8ClampedArray): Color {
    const red = this.y * (this.scale * 4) + this.x * 4;
    const color = new Color(
      data[red],
      data[red + 1],
      data[red + 2],
      data[red + 3]
    );

    return color;
  }
}
