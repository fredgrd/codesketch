import React, { useContext, useEffect, useRef, useState } from 'react';
import './word.css';
import Window from '../window/window';
import { GameContext } from '../../game-context/game-context-provider';
import { GameState, RoundState } from '../../game-context/game-context';
import { UserContext } from '../../user/user-context';

const Word: React.FC = () => {
  const user = useContext(UserContext);
  const context = useContext(GameContext);
  const [roundStarted, setRoundStarted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const interval = useRef<NodeJS.Timer | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (!interval.current) return;
      clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    if (context?.roundState === RoundState.ROUND_STARTED) {
      startTimer();
    } else if (
      (context?.roundState === RoundState.ROUND_ENDED ||
        context?.gameState === GameState.GAME_ENDED) &&
      interval.current
    ) {
      clearInterval(interval.current);
      setCountdown(60);
      setRoundStarted(false);
    }
  }, [context]);

  const startTimer = () => {
    if (roundStarted) return;

    setRoundStarted(true);

    const int = setInterval(
      () => setCountdown((count) => (count > 0 ? count - 1 : 0)),
      1000
    );

    interval.current = int;
  };

  const computeWidth = (): number | undefined => {
    const wordChars = context?.word.split('').length;

    if (!wordChars) return;

    const width = 360 - 8 * (wordChars - 1);

    return width / wordChars;
  };

  const renderWord = () => {
    if (context?.selectedUser === user?.id) {
      return (
        <div className="word__preview__full">{context?.word.toUpperCase()}</div>
      );
    } else {
      return context?.word
        .split('')
        .map((char, index) => (
          <div
            className={
              char !== ' ' ? 'word__preview__char' : 'word__preview__space'
            }
            style={{ width: `${computeWidth() || 0}px` }}
            key={index}
          />
        ));
    }
  };

  return (
    <div className="word__positioner">
      <Window title="World oracle 9000.exe">
        <div className="word">
          <div
            className={`word__countdown ${
              countdown <= 15 ? 'word__countdown--red' : ''
            }`}
          >
            {countdown}s
          </div>
          <div className="word__preview" ref={previewRef}>
            {renderWord()}
          </div>
        </div>
      </Window>
    </div>
  );
};

export default Word;
