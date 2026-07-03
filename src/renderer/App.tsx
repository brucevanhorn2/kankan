import React, { useState, useEffect, useCallback } from 'react';
import { ConfigProvider, theme, App as AntApp, message, notification } from 'antd';
import type { Board } from '../shared/types';
import { EmptyState } from './components/EmptyState';
import { BoardView } from './components/BoardView';
import { BoardProvider } from './context/BoardContext';
import { useDebouncedAutosave } from './hooks/useDebouncedAutosave';
import { useBoardMutations } from './hooks/useBoardMutations';

function AppContent() {
  const [board, setBoard] = useState<Board | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  useBoardMutations(board || ({} as Board), {
    onMutate: (updater) => {
      if (board) {
        setBoard(updater(board));
      }
    },
  });

  const { isSaving } = useDebouncedAutosave(board || ({} as Board), filePath || '');

  const handleBoardLoaded = useCallback((payload: { board: Board; filePath: string }) => {
    setBoard(payload.board);
    setFilePath(payload.filePath);
    message.success(`Board loaded: ${payload.board.name}`);
  }, []);

  const handleOpenError = useCallback((payload: { filePath: string; message: string }) => {
    notification.error({
      message: 'Failed to open board',
      description: payload.message,
      duration: 0,
    });
  }, []);

  useEffect(() => {
    window.kankan.onBoardLoaded(handleBoardLoaded);
    window.kankan.onOpenError(handleOpenError);
  }, [handleBoardLoaded, handleOpenError]);

  if (!board || !filePath) {
    return <EmptyState />;
  }

  return (
    <BoardProvider
      value={{
        board,
        filePath,
        mutate: (updater) => setBoard(updater(board)),
      }}
    >
      <BoardView isSaving={isSaving} />
    </BoardProvider>
  );
}

export function App() {
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}
