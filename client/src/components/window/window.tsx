import React from 'react';
import './window.css';

import WindowHeader from './window-header';

const Window: React.FC<{
  children: React.ReactNode;
  className?: string;
  title: string;
}> = ({ children, className, title }) => {
  return (
    <div className={`window ${className}`}>
      <WindowHeader title={title} />
      {children}
    </div>
  );
};

export default Window;
