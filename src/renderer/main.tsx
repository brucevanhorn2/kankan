import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import type { Board } from '../shared/types';

function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  useEffect(() => {
    window.kankan.onBoardLoaded((payload) => {
      setBoard(payload.board);
      setFilePath(payload.filePath);
    });

    window.kankan.onOpenError((payload) => {
      console.error('Failed to open board:', payload.message);
    });

    window.kankan.onFlushRequest(() => {
      console.log('Flush requested');
      window.kankan.readyToClose();
    });
  }, []);

  if (!board || !filePath) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>kankan</h1>
        <p>No board open. Use the File menu to create or open a board.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{board.name}</h1>
      <pre>{JSON.stringify(board, null, 2)}</pre>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
