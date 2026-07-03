import React from 'react';
import { Card as AntCard, Popconfirm, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../../shared/types';
import { useBoardContext } from '../context/BoardContext';

interface CardComponentProps {
  card: Card;
  onClick: () => void;
}

export function CardComponent({ card, onClick }: CardComponentProps) {
  const { mutate } = useBoardContext();
  const { setNodeRef, transform, transition } = useSortable({
    id: card.id,
    data: { type: 'card' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    mutate((board) => {
      const column = board.columns[card.columnId];
      return {
        ...board,
        updatedAt: new Date().toISOString(),
        columns: {
          ...board.columns,
          [card.columnId]: {
            ...column,
            cardOrder: column.cardOrder.filter((id) => id !== card.id),
          },
        },
        cards: Object.fromEntries(Object.entries(board.cards).filter(([id]) => id !== card.id)),
      };
    });
  };

  const bodyPreview =
    card.body && card.body.content && card.body.content.length > 0
      ? card.body.content
          .filter((node) => (node as Record<string, unknown>).type === 'paragraph')
          .slice(0, 1)
          .map((node) => {
            const content = (node as Record<string, unknown>).content as Array<Record<string, unknown>>;
            if (content && content.length > 0) {
              return content.map((text) => text.text || '').join('');
            }
            return '';
          })
          .join(' ')
          .substring(0, 80)
      : '';

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AntCard
        size="small"
        style={{
          cursor: 'pointer',
          backgroundColor: card.color || '#ffffff',
          marginBottom: '8px',
        }}
        onClick={onClick}
        hoverable
      >
        <div>
          <strong>{card.title}</strong>
          {bodyPreview && <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{bodyPreview}</div>}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
          <Popconfirm
            title="Delete card?"
            description="This action cannot be undone."
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete();
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </div>
      </AntCard>
    </div>
  );
}
