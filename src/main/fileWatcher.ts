import { watch, type FSWatcher } from 'chokidar';
import { BrowserWindow } from 'electron';
import { readBoardFile } from './boardFile';
import { IPC_CHANNELS } from '../shared/ipc-contract';

let watcher: FSWatcher | null = null;
let lastSaveTime = 0;
// Must comfortably exceed chokidar's awaitWriteFinish settle time (stabilityThreshold +
// pollInterval below) or the watcher mistakes our own autosave writes for external changes,
// which then get treated as new edits and re-saved, causing an infinite update loop.
const SAVE_DEBOUNCE_MS = 1000;

export function watchBoard(filePath: string, mainWindow: BrowserWindow): void {
  stopWatchingBoard();

  watcher = watch(filePath, {
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
    usePolling: false,
  });

  watcher.on('change', async () => {
    const timeSinceLastSave = Date.now() - lastSaveTime;
    if (timeSinceLastSave < SAVE_DEBOUNCE_MS) {
      return;
    }

    try {
      const board = await readBoardFile(filePath);
      mainWindow.webContents.send(IPC_CHANNELS.BOARD_FILE_CHANGED, { board, filePath });
    } catch (error) {
      console.error('Failed to reload board file:', error);
    }
  });

  watcher.on('error', (error) => {
    console.error('File watcher error:', error);
  });
}

export function stopWatchingBoard(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}

export function recordSaveTime(): void {
  lastSaveTime = Date.now();
}
