import React, { useContext, useEffect, useRef, useState } from 'react';
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
  GameState,
  RoundState,
} from '../../game-context/game-context';

const Chat: React.FC = () => {
  const webSocket = useContext(WebSocketContext);
  const gameContext = useContext(GameContext);
  const user = useContext(UserContext);
  const [input, setInput] = useState<string>('');
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameContext]);

  const handleInput = () => {
    if (!input.length || !user || !gameContext) return;

    const userFromContext = gameContext?.users.find(
      (e) => e.user.id === user?.id
    );

    if (
      (userFromContext && userFromContext.hasGuessed) ||
      gameContext.roundState !== RoundState.ROUND_STARTED
    ) {
      const payload: GameMessageTextPayload = {
        content: input,
        timestamp: Date.now().toString(),
      };

      webSocket?.ws?.send(
        JSON.stringify({
          action: 'TEXT',
          payload,
        })
      );
    }

    if (
      userFromContext &&
      !userFromContext.hasGuessed &&
      gameContext.roundState === RoundState.ROUND_STARTED
    ) {
      // Validate the guess
      if (gameContext.word.toLowerCase() === input.toLowerCase()) {
        console.log('GUESSED');
      } else {
        const payload: GameMessageTextPayload = {
          content: input,
          timestamp: Date.now().toString(),
        };

        webSocket?.ws?.send(
          JSON.stringify({
            action: 'TEXT',
            payload,
          })
        );
      }
    }

    setInput('');
  };

  return (
    <div className="chat">
      <Window title="Guess.exe">
        <div className="chat__content">
          {gameContext?.messages.map((message, key) => (
            <ChatCell message={message} key={key} />
          ))}
          <div ref={messageEndRef}></div>
        </div>
        <div className="chat__input-container">
          <input
            className="chat__input"
            type="text"
            placeholder="Input your guess.."
            value={input}
            onChange={(ev) => setInput(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') handleInput();
            }}
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
