import { app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { atomicWrite } from './atomicWrite';
import type { RecentBoardEntry, RecentFilesConfig } from '../shared/types';

function getRecentFilesPath(): string {
  return path.join(app.getPath('userData'), 'recent-boards.json');
}

export async function loadRecentConfig(): Promise<RecentFilesConfig> {
  const filePath = getRecentFilesPath();
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const config = JSON.parse(content) as RecentFilesConfig;
    return config;
  } catch {
    return { version: 1, entries: [] };
  }
}

export async function saveRecentConfig(config: RecentFilesConfig): Promise<void> {
  const filePath = getRecentFilesPath();
  const content = JSON.stringify(config, null, 2);
  await atomicWrite(filePath, content);
}

export async function addRecentFile(filePath: string, boardName: string): Promise<void> {
  const resolvedPath = path.resolve(filePath);
  const config = await loadRecentConfig();

  config.entries = config.entries.filter((e) => path.resolve(e.filePath) !== resolvedPath);

  config.entries.unshift({
    filePath: resolvedPath,
    boardName,
    lastOpenedAt: new Date().toISOString(),
  });

  config.entries = config.entries.slice(0, 10);

  await saveRecentConfig(config);
  app.addRecentDocument(resolvedPath);
}

export async function removeRecentFile(filePath: string): Promise<void> {
  const resolvedPath = path.resolve(filePath);
  const config = await loadRecentConfig();

  config.entries = config.entries.filter((e) => path.resolve(e.filePath) !== resolvedPath);

  await saveRecentConfig(config);
}

export async function getRecentFiles(): Promise<RecentBoardEntry[]> {
  const config = await loadRecentConfig();
  return config.entries;
}
