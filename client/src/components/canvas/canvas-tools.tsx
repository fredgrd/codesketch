import React, { useState } from 'react';
import { Tool } from './drawer-canvas';
import './canvas-tools.css';

import Revert from '../../assets/revert.png';
import Bucket from '../../assets/bucket.png';
import Eraser from '../../assets/eraser.png';

const COLORS: string[] = [
  '#000000',
  '#9DD241',
  '#FF6C20',
  '#FF3737',
  '#FFB4DE',
  '#9123F3',
  '#2469FF',
  '#A7F4FF',
];

const CanvasTools: React.FC<{
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setTool: (tool: Tool) => void;
}> = ({ setColor, setWidth, setTool }) => {
  const [colorSelected, setColorSelected] = useState<number>(0);

  const handleClick = (idx: number) => {
    setColorSelected(idx);
    setColor(COLORS[idx]);
  };
  return (
    <div className="canvas-tools">
      <div className="canvas-tools__colors">
        {COLORS.map((color, idx) => (
          <div
            className={
              colorSelected === idx
                ? 'canvas-tools__color--selected'
                : 'canvas-tools__color'
            }
            key={idx}
            style={{ backgroundColor: color }}
            onClick={() => handleClick(idx)}
          />
        ))}
      </div>
      <div className="canvas-tools__widths">
        <div
          className="canvas-tools__width--small"
          onClick={() => setWidth(2)}
        />
        <div
          className="canvas-tools__width--medium"
          onClick={() => setWidth(5)}
        />
        <div className="canvas-tools__width--big" onClick={() => setWidth(9)} />
      </div>

      <div className="canvas-tools__buttons">
        <button
          className="canvas-tools__buttons__button"
          onClick={() => setTool(Tool.BUCKET)}
        >
          <img className="canvas-tools__buttons__button__icon" src={Bucket} />
        </button>
        <button
          className="canvas-tools__buttons__button"
          onClick={() => setTool(Tool.ERASER)}
        >
          <img className="canvas-tools__buttons__button__icon" src={Eraser} />
        </button>
      </div>
    </div>
  );
};

export default CanvasTools;
