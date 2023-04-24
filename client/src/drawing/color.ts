import { Point } from './point';

interface IColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

export class Color implements IColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;

  constructor(red: number, green: number, blue: number, alpha: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  compare(color: Color): boolean {
    return (
      this.red === color.red &&
      this.green === color.green &&
      this.blue === color.blue &&
      this.alpha === color.alpha
    );
  }
}
