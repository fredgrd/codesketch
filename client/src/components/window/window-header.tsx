import React from 'react';
import './window-header.css';

import HeaderLines from '../../assets/header-lines.png';
import HeaderRxButton from '../../assets/header-right-button.png';
import HeaderLxButton from '../../assets/header-left-button.png';

const WindowButton: React.FC = () => {
  return (
    <div className="window-header__buttons">
      <img className="window-header__button" src={HeaderLxButton} />
      <img className="window-header__button" src={HeaderRxButton} />
    </div>
  );
};

const WindowHeader: React.FC<{ title: string; showButtons?: boolean }> = ({
  title,
  showButtons = true,
}) => {
  return (
    <div className="window-header">
      <div className="window-header__title">
        <img className="window-header__background" src={HeaderLines} />
        <div className="window-header__title__text">{title}</div>
      </div>
      {showButtons && <WindowButton />}
    </div>
  );
};

export default WindowHeader;
