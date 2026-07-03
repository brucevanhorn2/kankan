import type { Board } from './types';

export const IPC_CHANNELS = {
  BOARD_NEW: 'board:new',
  BOARD_OPEN: 'board:open',
  BOARD_OPEN_PATH: 'board:openPath',
  BOARD_SAVE: 'board:save',
  RECENT_LIST: 'recent:list',
  BOARD_LOADED: 'board:loaded',
  BOARD_OPEN_ERROR: 'board:open-error',
  BOARD_FILE_CHANGED: 'board:file-changed',
  APP_FLUSH_REQUEST: 'app:flush-request',
  APP_READY_TO_CLOSE: 'app:ready-to-close',
} as const;

export interface BoardLoadPayload {
  board: Board;
  filePath: string;
}

export type BoardOpenPathResult = {
  board: Board;
  filePath: string;
} | {
  error: 'not-found' | 'invalid';
  filePath: string;
};

export type BoardSaveResult = {
  ok: true;
} | {
  ok: false;
  error: string;
};

export interface BoardOpenErrorPayload {
  filePath: string;
  message: string;
}
