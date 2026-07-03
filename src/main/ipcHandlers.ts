import { ipcMain, dialog, BrowserWindow } from 'electron';
import { readBoardFile, writeBoardFile } from './boardFile';
import { addRecentFile, removeRecentFile, getRecentFiles } from './recentFiles';
import { IPC_CHANNELS } from '../shared/ipc-contract';
import { refreshMenu } from './menu';
import type { Board, Column } from '../shared/types';

function generateNewBoard(name: string): Board {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const defaultColumns = ['Todo', 'In Progress', 'Done'];
  const columnOrder = defaultColumns.map(() => crypto.randomUUID());
  const columns: Record<string, Column> = {};

  defaultColumns.forEach((title, i) => {
    columns[columnOrder[i]] = {
      id: columnOrder[i],
      title,
      cardOrder: [],
      createdAt: now,
    };
  });

  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    columnOrder,
    columns,
    cards: {},
    schemaVersion: 1,
  };
}

export async function handleNewBoard(mainWindow: BrowserWindow): Promise<{ board: Board; filePath: string } | null> {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'Untitled Board.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const board = generateNewBoard('Untitled Board');
  try {
    await writeBoardFile(result.filePath, board);
    await addRecentFile(result.filePath, board.name);
    await refreshMenu(mainWindow);
    mainWindow.webContents.send(IPC_CHANNELS.BOARD_LOADED, { board, filePath: result.filePath });
    return { board, filePath: result.filePath };
  } catch (error) {
    mainWindow.webContents.send(IPC_CHANNELS.BOARD_OPEN_ERROR, {
      filePath: result.filePath,
      message: `Failed to create board: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return null;
  }
}

export async function handleOpenBoard(mainWindow: BrowserWindow): Promise<{ board: Board; filePath: string } | null> {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return handleOpenBoardPath(mainWindow, result.filePaths[0]);
}

export async function handleOpenRecentPath(mainWindow: BrowserWindow, filePath: string): Promise<{ board: Board; filePath: string } | { error: 'not-found' | 'invalid'; filePath: string }> {
  return handleOpenBoardPath(mainWindow, filePath);
}

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(IPC_CHANNELS.BOARD_NEW, async () => handleNewBoard(mainWindow));
  ipcMain.handle(IPC_CHANNELS.BOARD_OPEN, async () => handleOpenBoard(mainWindow));
  ipcMain.handle(IPC_CHANNELS.BOARD_OPEN_PATH, async (_event, filePath: string) => handleOpenRecentPath(mainWindow, filePath));
  ipcMain.handle(IPC_CHANNELS.BOARD_SAVE, async (_event, filePath: string, board: Board) => {
    try {
      await writeBoardFile(filePath, board);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
  ipcMain.handle(IPC_CHANNELS.RECENT_LIST, async () => getRecentFiles());
}

async function handleOpenBoardPath(mainWindow: BrowserWindow, filePath: string): Promise<{ board: Board; filePath: string } | { error: 'not-found' | 'invalid'; filePath: string }> {
  try {
    const board = await readBoardFile(filePath);
    await addRecentFile(filePath, board.name);
    mainWindow.webContents.send(IPC_CHANNELS.BOARD_LOADED, { board, filePath });
    return { board, filePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isNotFound = (error as NodeJS.ErrnoException)?.code === 'ENOENT';
    if (isNotFound) {
      await removeRecentFile(filePath);
    }
    mainWindow.webContents.send(IPC_CHANNELS.BOARD_OPEN_ERROR, {
      filePath,
      message: `Failed to open board: ${message}`,
    });
    return { error: isNotFound ? 'not-found' : 'invalid', filePath };
  }
}
