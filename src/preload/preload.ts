import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-contract';
import type { Board, RecentBoardEntry } from '../shared/types';
import type { BoardLoadPayload, BoardOpenErrorPayload, BoardOpenPathResult, BoardSaveResult } from '../shared/ipc-contract';

const kankan = {
  newBoard: () => ipcRenderer.invoke(IPC_CHANNELS.BOARD_NEW),
  openBoard: () => ipcRenderer.invoke(IPC_CHANNELS.BOARD_OPEN),
  openPath: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.BOARD_OPEN_PATH, filePath) as Promise<BoardOpenPathResult>,
  saveBoard: (filePath: string, board: Board) => ipcRenderer.invoke(IPC_CHANNELS.BOARD_SAVE, filePath, board) as Promise<BoardSaveResult>,
  listRecent: () => ipcRenderer.invoke(IPC_CHANNELS.RECENT_LIST) as Promise<RecentBoardEntry[]>,
  onBoardLoaded: (callback: (payload: BoardLoadPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: BoardLoadPayload) => callback(payload);
    ipcRenderer.on(IPC_CHANNELS.BOARD_LOADED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.BOARD_LOADED, listener);
  },
  onOpenError: (callback: (payload: BoardOpenErrorPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: BoardOpenErrorPayload) => callback(payload);
    ipcRenderer.on(IPC_CHANNELS.BOARD_OPEN_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.BOARD_OPEN_ERROR, listener);
  },
  onFlushRequest: (callback: () => void) => {
    ipcRenderer.on(IPC_CHANNELS.APP_FLUSH_REQUEST, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.APP_FLUSH_REQUEST, callback);
  },
  onFileChanged: (callback: (payload: BoardLoadPayload) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: BoardLoadPayload) => callback(payload);
    ipcRenderer.on(IPC_CHANNELS.BOARD_FILE_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.BOARD_FILE_CHANGED, listener);
  },
  readyToClose: () => ipcRenderer.send(IPC_CHANNELS.APP_READY_TO_CLOSE),
};

contextBridge.exposeInMainWorld('kankan', kankan);

declare global {
  interface Window {
    kankan: typeof kankan;
  }
}
