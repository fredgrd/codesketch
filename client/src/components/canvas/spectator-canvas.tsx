import React from 'react';
import './canvas.css';

const SpectatorCanvas: React.FC = () => {
  return (
    <div className="canvas">
      <canvas className="canvas__specator-canvas"></canvas>
    </div>
  );
};

export default SpectatorCanvas;
