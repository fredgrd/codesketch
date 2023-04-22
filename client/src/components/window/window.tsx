import React from 'react';
import './window.css';

import WindowHeader from './window-header';

const Window: React.FC<{
  children: React.ReactNode;
  className?: string;
  title: string;
  showButtons?: boolean;
}> = ({ children, className, title, showButtons = true }) => {
  return (
    <div className={`window ${className}`}>
      <WindowHeader title={title} showButtons={showButtons} />
      <div className="window__children-positioner">{children}</div>
    </div>
  );
};

export default Window;
