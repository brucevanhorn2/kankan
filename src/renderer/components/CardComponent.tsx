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

function getContrastTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)';
}

export function CardComponent({ card, onClick }: CardComponentProps) {
  const { mutate } = useBoardContext();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
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

  const bgColor = card.color || '#ffffff';
  const textColor = getContrastTextColor(bgColor);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AntCard
        size="small"
        style={{
          cursor: 'pointer',
          backgroundColor: bgColor,
          marginBottom: '8px',
        }}
        onClick={onClick}
        hoverable
      >
        <div style={{ color: textColor }}>
          <strong>{card.title}</strong>
          {bodyPreview && <div style={{ fontSize: '12px', opacity: 0.65, marginTop: '4px' }}>{bodyPreview}</div>}
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
