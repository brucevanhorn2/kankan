import { useEffect, useRef, useCallback, useState } from 'react';
import type { Board } from '../../shared/types';

const DEBOUNCE_DELAY = 800;

export function useDebouncedAutosave(board: Board, filePath: string) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const previousBoardRef = useRef(board);

  useEffect(() => {
    if (board !== previousBoardRef.current) {
      setDirty(true);
      previousBoardRef.current = board;
    }
  }, [board]);

  const flush = useCallback(async () => {
    if (!dirty || !filePath) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await window.kankan.saveBoard(filePath, board);
      if (result.ok) {
        setDirty(false);
      } else {
        console.error('Failed to save board:', result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [dirty, board, filePath]);

  useEffect(() => {
    if (!dirty || !filePath) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      flush();
    }, DEBOUNCE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [dirty, filePath, flush]);

  useEffect(() => {
    const handleFlushRequest = () => {
      flush().then(() => {
        window.kankan.readyToClose();
      });
    };

    window.kankan.onFlushRequest(handleFlushRequest);
  }, [flush]);

  return { dirty, isSaving, flush };
}
