import React, { createContext, ReactNode } from 'react';
import type { Board } from '../../shared/types';

export interface BoardContextType {
  board: Board;
  filePath: string;
  mutate: (updater: (board: Board) => Board) => void;
}

export const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function useBoardContext(): BoardContextType {
  const context = React.useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
}

export function BoardProvider({ children, value }: { children: ReactNode; value: BoardContextType }) {
  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}
