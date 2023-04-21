import React from 'react';
import moment from 'moment';
import './chat-cell.css';
import { ChatMessage } from '../../game-context/game-context';

const ChatCell: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const date = new Date(Number(message.timestamp));
  const momentDate = moment(date);

  return (
    <div className="chat-cell">
      <div className="chat-cell__text">
        <div className="chat-cell__text__header">
          <div className="chat-cell__text__header__sender">
            {message.senderName}
          </div>
          <div className="chat-cell__text__header__timestamp">{momentDate.format('hh:mm:ss.SSS')}</div>
        </div>
        <div className="chat-cell__text__content">{message.content}</div>
      </div>
    </div>
  );
};

export default ChatCell;
