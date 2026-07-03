import fs from 'node:fs/promises';
import { atomicWrite } from './atomicWrite';
import type { Board } from '../shared/types';

export async function readBoardFile(filePath: string): Promise<Board> {
  const content = await fs.readFile(filePath, 'utf-8');
  const board = JSON.parse(content) as Board;
  return board;
}

export async function writeBoardFile(filePath: string, board: Board): Promise<void> {
  const content = JSON.stringify(board, null, 2);
  await atomicWrite(filePath, content);
}
