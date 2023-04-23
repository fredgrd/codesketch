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
  const [chars, setChars] = useState<{ char: string; visible: boolean }[]>([]);
  const charsUncovered = useRef<number>(0);
  const uncoverTimeInterval = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (!interval.current) return;
      clearInterval(interval.current);
    };
  }, []);

  useEffect(() => {
    if (context?.roundState === RoundState.ROUND_STARTED) {
      constructChars();
      startTimer();
    } else if (
      (context?.roundState === RoundState.ROUND_ENDED ||
        context?.gameState === GameState.GAME_ENDED) &&
      interval.current
    ) {
      clearInterval(interval.current);
      setCountdown(60);
      setRoundStarted(false);
      charsUncovered.current = 0;
      uncoverTimeInterval.current = 0;
    }
  }, [context]);

  useEffect(() => {
    const interval = uncoverTimeInterval.current;
    if (
      countdown < 60 &&
      countdown % interval === 0 &&
      charsUncovered.current < Math.floor((context?.word.length || 0) * 0.8)
    ) {
      // Uncover char
      const indexes: number[] = [];
      for (let i = 0; i < chars.length; i++) {
        if (!chars[i].visible) {
          indexes.push(i);
        }
      }

      const indexOfIndexes = Math.floor(Math.random() * (indexes.length - 1));
      const charIndex = indexes[indexOfIndexes];
      const updatedChars = chars.map((el, idx) => {
        if (idx === charIndex) {
          return { char: el.char, visible: true };
        } else {
          return el;
        }
      });

      charsUncovered.current += 1;
      setChars(updatedChars);
    }
  }, [countdown]);

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
    const wordChars = 'LINKED LIST'.split('').length; //context?.word.split('').length;

    if (!wordChars) return;

    const width = 360 - 8 * (wordChars - 1);

    return width / wordChars;
  };

  const constructChars = () => {
    if (!context?.word || roundStarted) return;

    const arr: { char: string; visible: boolean }[] = context.word
      .toUpperCase()
      .split('')
      .map((char) => ({ char, visible: char === ' ' }));

    const numberOfChars = arr.reduce((prev, curr) => {
      if (!curr.visible) {
        return prev + 1;
      } else {
        return prev;
      }
    }, 0);

    uncoverTimeInterval.current = Math.floor(50 / numberOfChars);
    setChars(arr);
  };

  const renderWord = () => {
    if (context?.selectedUser === user?.id) {
      return (
        <div className="word__preview__full">{context?.word.toUpperCase()}</div>
      );
    } else {
      return chars.map((char, index) => (
        <div
          className="word__preview__char"
          key={index}
          style={{ width: computeWidth() }}
        >
          {char.visible && char.char}
        </div>
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
