import type { Content as TiptapContent } from '@tiptap/react';

export type Content = TiptapContent;

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  columnOrder: string[];
  columns: Record<string, Column>;
  cards: Record<string, Card>;
  schemaVersion: number;
}

export interface Column {
  id: string;
  title: string;
  cardOrder: string[];
  createdAt: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  body: Content;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentBoardEntry {
  filePath: string;
  boardName: string;
  lastOpenedAt: string;
}

export interface RecentFilesConfig {
  version: number;
  entries: RecentBoardEntry[];
}
