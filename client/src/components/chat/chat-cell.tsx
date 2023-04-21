import React from 'react';
import './chat-cell.css';
import { ChatMessage } from '../../game-context/game-context';

const ChatCell: React.FC<{ message: ChatMessage }> = ({ message }) => {
  return (
    <div className="chat-cell">{`${message.senderName} ${message.type} ${message.content}`}</div>
  );
};

export default ChatCell;
