import React from 'react';
import { createPortal } from 'react-dom';
import './fullscreen-modal.css';

const FullscreenModal: React.FC<{
  children: React.ReactNode;
  opaque?: boolean;
}> = ({ children, opaque = true }) => {
  return createPortal(
    <div
      className={`fullscreen-modal ${
        opaque
          ? 'fullscreen-modal--background-opaque'
          : 'fullscreen-modal--background-transparent'
      }`}
    >
      {children}
    </div>,
    document.getElementById('portal')!
  );
};

export default FullscreenModal;
