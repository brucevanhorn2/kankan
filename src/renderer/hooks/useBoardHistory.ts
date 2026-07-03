import { useState, useCallback } from 'react';
import type { Board } from '../../shared/types';

interface HistoryEntry {
  board: Board;
  timestamp: number;
}

export function useBoardHistory(initialBoard: Board) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { board: initialBoard, timestamp: Date.now() },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBoard = history[currentIndex].board;

  const push = useCallback((board: Board) => {
    setHistory((prev) => [
      ...prev.slice(0, currentIndex + 1),
      { board, timestamp: Date.now() },
    ]);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    currentBoard,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
