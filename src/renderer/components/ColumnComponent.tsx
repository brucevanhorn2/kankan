import React, { useState } from 'react';
import { Card as AntCard, Input, Button, Dropdown, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, MenuOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column, Card } from '../../shared/types';
import { useBoardContext } from '../context/BoardContext';
import { CardComponent } from './CardComponent';
import { CardEditorModal } from './CardEditorModal';

interface ColumnComponentProps {
  column: Column;
  cards: Card[];
}

export function ColumnComponent({ column, cards }: ColumnComponentProps) {
  const { board, mutate } = useBoardContext();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column' },
  });

  const { attributes, listeners, setNodeRef: setSortableNodeRef } = useSortable({
    id: column.id,
    data: { type: 'column' },
  });

  const style = {
    transform: CSS.Transform.toString(attributes),
  };

  const handleRename = () => {
    if (newTitle.trim()) {
      mutate((b) => ({
        ...b,
        updatedAt: new Date().toISOString(),
        columns: {
          ...b.columns,
          [column.id]: { ...column, title: newTitle },
        },
      }));
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    mutate((b) => {
      const cardIds = b.columns[column.id].cardOrder;
      const newCards = { ...b.cards };
      cardIds.forEach((id) => delete newCards[id]);
      return {
        ...b,
        updatedAt: new Date().toISOString(),
        columnOrder: b.columnOrder.filter((id) => id !== column.id),
        columns: Object.fromEntries(Object.entries(b.columns).filter(([id]) => id !== column.id)),
        cards: newCards,
      };
    });
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      mutate((b) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        return {
          ...b,
          updatedAt: now,
          columns: {
            ...b.columns,
            [column.id]: {
              ...column,
              cardOrder: [...column.cardOrder, id],
            },
          },
          cards: {
            ...b.cards,
            [id]: {
              id,
              columnId: column.id,
              title: newCardTitle,
              body: { type: 'doc', content: [] },
              createdAt: now,
              updatedAt: now,
            },
          },
        };
      });
      setNewCardTitle('');
    }
  };

  const menu = [
    {
      key: 'rename',
      label: 'Rename',
      icon: <EditOutlined />,
      onClick: () => setIsRenaming(true),
    },
    {
      key: 'divider',
      type: 'divider' as const,
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      icon: <DeleteOutlined />,
      onClick: () => {
        // This is handled by the Popconfirm
      },
    },
  ];

  const editingCard = editingCardId ? board.cards[editingCardId] : null;

  return (
    <>
      <AntCard
        ref={setSortableNodeRef}
        style={{
          width: '280px',
          height: 'fit-content',
          flex: '0 0 280px',
          ...style,
        }}
        title={
          isRenaming ? (
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onPressEnter={handleRename}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span {...listeners}>{column.title}</span>
              <Popconfirm
                title="Delete column?"
                description={`This will delete ${column.cardOrder.length} card(s).`}
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Dropdown menu={{ items: menu }} trigger={['click']}>
                  <Button type="text" size="small" icon={<MenuOutlined />} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
              </Popconfirm>
            </div>
          )
        }
      >
        <SortableContext items={column.cardOrder} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} style={{ minHeight: '200px' }}>
            {cards.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                onClick={() => setEditingCardId(card.id)}
              />
            ))}
          </div>
        </SortableContext>

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <Input
            placeholder="New card..."
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onPressEnter={handleAddCard}
            size="small"
          />
          <Button type="primary" size="small" onClick={handleAddCard}>
            Add
          </Button>
        </div>
      </AntCard>

      {editingCard && (
        <CardEditorModal
          card={editingCard}
          open={!!editingCardId}
          onClose={() => setEditingCardId(null)}
        />
      )}
    </>
  );
}
