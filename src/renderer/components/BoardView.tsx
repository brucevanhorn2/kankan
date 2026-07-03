import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useBoardContext } from '../context/BoardContext';
import { BoardHeader } from './BoardHeader';
import { ColumnComponent } from './ColumnComponent';

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(TouchSensor, { distance: 8 }),
  );

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      mutate((b) => {
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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setActiveId(null);

    if (active.data.current?.type === 'column' && over.data.current?.type === 'column') {
      const activeIndex = board.columnOrder.indexOf(active.id as string);
      const overIndex = board.columnOrder.indexOf(over.id as string);

      if (activeIndex !== -1 && overIndex !== -1) {
        mutate((b) => ({
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

      mutate((b) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <BoardHeader isSaving={isSaving} />

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={(event) => setActiveId(event.active.id as string)}>
          <SortableContext items={board.columnOrder} strategy={horizontalListSortingStrategy}>
            <div style={{ display: 'flex', gap: '16px', height: 'fit-content' }}>
              {board.columnOrder.map((columnId) => {
                const column = board.columns[columnId];
                const cards = column.cardOrder.map((cardId) => board.cards[cardId]);
                return <ColumnComponent key={columnId} column={column} cards={cards} />;
              })}

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
                    placeholder="New column..."
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onPressEnter={handleAddColumn}
                  />
                  <Button type="primary" block icon={<PlusOutlined />} onClick={handleAddColumn}>
                    Add Column
                  </Button>
                </Space>
              </div>
            </div>
          </SortableContext>
          <DragOverlay>{activeId ? <div style={{ opacity: 0.5 }}>Dragging...</div> : null}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
