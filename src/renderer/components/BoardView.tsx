import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Input, Space, Tooltip } from 'antd';
import { PlusOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';
import { useBoardContext } from '../context/BoardContext';
import { BoardHeader } from './BoardHeader';
import { ColumnComponent } from './ColumnComponent';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';

interface BoardViewProps {
  isSaving: boolean;
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const item = newArray[from];
  newArray.splice(from, 1);
  newArray.splice(to, 0, item);
  return newArray;
}

export function BoardView({ isSaving }: BoardViewProps) {
  const { board, mutate } = useBoardContext();
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(TouchSensor, { distance: 8 }),
  );

  // Track undo/redo history
  const [history, setHistory] = useState([{ board, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const recordHistory = (newBoard: typeof board) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { board: newBoard, timestamp: Date.now() }]);
    setHistoryIndex((prev) => prev + 1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      mutate(() => history[newIndex].board);
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      mutate(() => history[newIndex].board);
    }
  };

  const wrappedMutate = (updater: (board: typeof board) => typeof board) => {
    const newBoard = updater(board);
    recordHistory(newBoard);
    mutate(() => newBoard);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      wrappedMutate((b) => {
        const id = crypto.randomUUID();
        return {
          ...b,
          updatedAt: new Date().toISOString(),
          columnOrder: [...b.columnOrder, id],
          columns: {
            ...b.columns,
            [id]: {
              id,
              title: newColumnTitle,
              cardOrder: [],
              createdAt: new Date().toISOString(),
            },
          },
        };
      });
      setNewColumnTitle('');
    }
    setIsAddingColumn(false);
  };

  const handleCancelAddColumn = () => {
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setActiveId(null);

    if (active.data.current?.type === 'column' && over.data.current?.type === 'column') {
      const activeIndex = board.columnOrder.indexOf(active.id as string);
      const overIndex = board.columnOrder.indexOf(over.id as string);

      if (activeIndex !== -1 && overIndex !== -1) {
        wrappedMutate((b) => ({
          ...b,
          updatedAt: new Date().toISOString(),
          columnOrder: arrayMove(b.columnOrder, activeIndex, overIndex),
        }));
      }
    } else if (active.data.current?.type === 'card') {
      const cardId = active.id as string;
      const card = board.cards[cardId];

      let targetColumnId = card.columnId;
      let targetIndex = board.columns[targetColumnId].cardOrder.indexOf(cardId);

      if (over.data.current?.type === 'column') {
        targetColumnId = over.id as string;
        targetIndex = board.columns[targetColumnId].cardOrder.length;
      } else if (over.data.current?.type === 'card') {
        const overCard = board.cards[over.id as string];
        targetColumnId = overCard.columnId;
        targetIndex = board.columns[targetColumnId].cardOrder.indexOf(over.id as string);
      }

      if (targetColumnId === card.columnId && targetIndex === board.columns[card.columnId].cardOrder.indexOf(cardId)) {
        return;
      }

      wrappedMutate((b) => {
        const sourceColumn = b.columns[card.columnId];
        const targetColumn = b.columns[targetColumnId];

        const sourceCardOrder = sourceColumn.cardOrder.filter((id) => id !== cardId);
        const targetCardOrder = [...targetColumn.cardOrder];

        if (targetCardOrder.includes(cardId)) {
          targetCardOrder.splice(targetCardOrder.indexOf(cardId), 1);
        }
        targetCardOrder.splice(targetIndex, 0, cardId);

        return {
          ...b,
          updatedAt: new Date().toISOString(),
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
              ...b.cards[cardId],
              columnId: targetColumnId,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    }
  };

  // Filter cards based on search and color
  const filteredCardIds = new Set<string>();
  Object.entries(board.cards).forEach(([cardId, card]) => {
    const matchesSearch = searchQuery === '' || card.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor =
      selectedColor === null ||
      (selectedColor === 'none' && !card.color) ||
      (selectedColor !== 'none' && card.color === selectedColor);

    if (matchesSearch && matchesColor) {
      filteredCardIds.add(cardId);
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <BoardHeader isSaving={isSaving} />

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FilterBar selectedColor={selectedColor} onColorChange={setSelectedColor} />

      <div style={{ padding: '8px 16px', borderBottom: '1px solid #434343' }}>
        <Space size="small">
          <Tooltip title="Undo (Ctrl+Z)">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={handleUndo}
              disabled={!canUndo}
            />
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Shift+Z)">
            <Button
              size="small"
              icon={<RedoOutlined />}
              onClick={handleRedo}
              disabled={!canRedo}
            />
          </Tooltip>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={(event) => setActiveId(event.active.id as string)}>
          <SortableContext items={board.columnOrder} strategy={horizontalListSortingStrategy}>
            <div style={{ display: 'flex', gap: '16px', height: 'fit-content' }}>
              {board.columnOrder.map((columnId) => {
                const column = board.columns[columnId];
                const cardIds = column.cardOrder.filter((id) => filteredCardIds.has(id));
                const cards = cardIds.map((cardId) => board.cards[cardId]);
                return <ColumnComponent key={columnId} column={column} cards={cards} />;
              })}

              {isAddingColumn ? (
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#fafafa',
                    borderRadius: '4px',
                    height: 'fit-content',
                    minWidth: '280px',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                      autoFocus
                      placeholder="New column..."
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onPressEnter={handleAddColumn}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleCancelAddColumn();
                      }}
                      onBlur={() => {
                        if (!newColumnTitle.trim()) setIsAddingColumn(false);
                      }}
                    />
                    <Space>
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleAddColumn}>
                        Add Column
                      </Button>
                      <Button onClick={handleCancelAddColumn}>Cancel</Button>
                    </Space>
                  </Space>
                </div>
              ) : (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddingColumn(true)}
                  style={{ height: 'fit-content', flexShrink: 0 }}
                >
                  Add Column
                </Button>
              )}
            </div>
          </SortableContext>
          <DragOverlay>{activeId ? <div style={{ opacity: 0.5 }}>Dragging...</div> : null}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
