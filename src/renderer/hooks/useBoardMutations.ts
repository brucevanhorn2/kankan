import { useCallback } from 'react';
import type { Board, Card } from '../../shared/types';

interface MutationCallbacks {
  onMutate: (updater: (board: Board) => Board) => void;
}

export function useBoardMutations(board: Board, callbacks: MutationCallbacks) {
  const now = () => new Date().toISOString();

  const addColumn = useCallback(
    (title: string) => {
      callbacks.onMutate((b) => {
        const id = crypto.randomUUID();
        return {
          ...b,
          updatedAt: now(),
          columnOrder: [...b.columnOrder, id],
          columns: {
            ...b.columns,
            [id]: {
              id,
              title,
              cardOrder: [],
              createdAt: now(),
            },
          },
        };
      });
    },
    [callbacks],
  );

  const renameColumn = useCallback(
    (columnId: string, title: string) => {
      callbacks.onMutate((b) => ({
        ...b,
        updatedAt: now(),
        columns: {
          ...b.columns,
          [columnId]: { ...b.columns[columnId], title },
        },
      }));
    },
    [callbacks],
  );

  const deleteColumn = useCallback(
    (columnId: string) => {
      callbacks.onMutate((b) => {
        const cardIds = b.columns[columnId].cardOrder;
        const newCards = { ...b.cards };
        cardIds.forEach((id) => delete newCards[id]);
        return {
          ...b,
          updatedAt: now(),
          columnOrder: b.columnOrder.filter((id) => id !== columnId),
          columns: Object.fromEntries(Object.entries(b.columns).filter(([id]) => id !== columnId)),
          cards: newCards,
        };
      });
    },
    [callbacks],
  );

  const reorderColumns = useCallback(
    (columnOrder: string[]) => {
      callbacks.onMutate((b) => ({
        ...b,
        updatedAt: now(),
        columnOrder,
      }));
    },
    [callbacks],
  );

  const addCard = useCallback(
    (columnId: string, title: string) => {
      callbacks.onMutate((b) => {
        const id = crypto.randomUUID();
        return {
          ...b,
          updatedAt: now(),
          columns: {
            ...b.columns,
            [columnId]: {
              ...b.columns[columnId],
              cardOrder: [...b.columns[columnId].cardOrder, id],
            },
          },
          cards: {
            ...b.cards,
            [id]: {
              id,
              columnId,
              title,
              body: { type: 'doc', content: [] },
              createdAt: now(),
              updatedAt: now(),
            },
          },
        };
      });
    },
    [callbacks],
  );

  const updateCard = useCallback(
    (cardId: string, updates: Partial<Card>) => {
      callbacks.onMutate((b) => ({
        ...b,
        updatedAt: now(),
        cards: {
          ...b.cards,
          [cardId]: {
            ...b.cards[cardId],
            ...updates,
            updatedAt: now(),
          },
        },
      }));
    },
    [callbacks],
  );

  const deleteCard = useCallback(
    (cardId: string) => {
      callbacks.onMutate((b) => {
        const card = b.cards[cardId];
        const column = b.columns[card.columnId];
        return {
          ...b,
          updatedAt: now(),
          columns: {
            ...b.columns,
            [card.columnId]: {
              ...column,
              cardOrder: column.cardOrder.filter((id) => id !== cardId),
            },
          },
          cards: Object.fromEntries(Object.entries(b.cards).filter(([id]) => id !== cardId)),
        };
      });
    },
    [callbacks],
  );

  const moveCard = useCallback(
    (cardId: string, targetColumnId: string, targetIndex: number) => {
      callbacks.onMutate((b) => {
        const card = b.cards[cardId];
        const sourceColumn = b.columns[card.columnId];
        const targetColumn = b.columns[targetColumnId];

        const sourceCardOrder = sourceColumn.cardOrder.filter((id) => id !== cardId);
        const targetCardOrder = [...targetColumn.cardOrder];
        targetCardOrder.splice(targetIndex, 0, cardId);

        return {
          ...b,
          updatedAt: now(),
          columns: {
            ...b.columns,
            [card.columnId]: {
              ...sourceColumn,
              cardOrder: sourceCardOrder,
            },
            [targetColumnId]: {
              ...targetColumn,
              cardOrder: targetCardOrder,
            },
          },
          cards: {
            ...b.cards,
            [cardId]: {
              ...card,
              columnId: targetColumnId,
              updatedAt: now(),
            },
          },
        };
      });
    },
    [callbacks],
  );

  const renameBoard = useCallback(
    (name: string) => {
      callbacks.onMutate((b) => ({
        ...b,
        name,
        updatedAt: now(),
      }));
    },
    [callbacks],
  );

  return {
    addColumn,
    renameColumn,
    deleteColumn,
    reorderColumns,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    renameBoard,
  };
}
