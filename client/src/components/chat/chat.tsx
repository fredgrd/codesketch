import React, { useContext, useState } from 'react';
import './chat.css';

import Window from '../window/window';
import ChatCell from './chat-cell';
import { WebSocketContext } from '../../web-socket/web-socket-context';
import { GameContext } from '../../game-context/game-context-provider';
import { UserContext } from '../../user/user-context';
import {
  ChatMessage,
  ChatMessageType,
  GameMessage,
  GameMessageTextPayload,
} from '../../game-context/game-context';

const Chat: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const gameContext = useContext(GameContext);
  const user = useContext(UserContext);
  const [input, setInput] = useState<string>('');

  const handleInput = () => {
    if (!input.length || !user || !gameContext) return;

    const userFromContext = gameContext?.users.find(
      (e) => e.user.id === user?.id
    );

    if (userFromContext && userFromContext.hasGuessed) {
      const payload: GameMessageTextPayload = {
        content: input,
        timestamp: Date.now.toString(),
      };

      webSocket?.ws?.send(
        JSON.stringify({
          action: 'TEXT',
          payload,
        })
      );
    }

    if (userFromContext && !userFromContext.hasGuessed) {
      // Validate the guess
      if (gameContext.word.toLowerCase() === input.toLowerCase()) {
        console.log('GUESSED');
      } else {
        const payload: GameMessageTextPayload = {
          content: input,
          timestamp: Date.now.toString(),
        };

        webSocket?.ws?.send(
          JSON.stringify({
            action: 'TEXT',
            payload,
          })
        );
      }
    }
  };

  return (
    <div className="chat">
      <Window title="Guess.exe">
        <div className="chat__content">
          {gameContext?.messages.map((message, key) => (
            <ChatCell message={message} key={key} />
          ))}
        </div>
        <div className="chat__input-container">
          <input
            className="chat__input"
            type="text"
            placeholder="Input your guess.."
            value={input}
            onChange={(ev) => setInput(ev.target.value)}
          />
          <button className="chat__input__button" onClick={handleInput}>
            SEND
          </button>
        </div>
      </Window>
    </div>
  );
};

export default Chat;
