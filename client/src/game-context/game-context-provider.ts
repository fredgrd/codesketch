import { createContext } from 'react';
import { GameContext as Context } from './game-context';

export const GameContext = createContext<Context | undefined>(undefined);
