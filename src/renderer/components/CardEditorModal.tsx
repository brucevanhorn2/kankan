import React, { useState } from 'react';
import { Modal, Input, Button, Space, Popconfirm, ColorPicker } from 'antd';
import type { Card } from '../../shared/types';
import { useBoardContext } from '../context/BoardContext';

interface CardEditorModalProps {
  card: Card;
  open: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = ['#ffffff', '#fff7e6', '#fffb8f', '#f6ffed', '#e6f7ff', '#f9f0ff'];

export function CardEditorModal({ card, open, onClose }: CardEditorModalProps) {
  const { mutate } = useBoardContext();
  const [title, setTitle] = useState(card.title);
  const [bodyText, setBodyText] = useState(
    card.body?.content?.[0]?.content?.[0]?.text || '',
  );
  const [color, setColor] = useState(card.color || '#ffffff');

  const handleSave = () => {
    mutate((board) => ({
      ...board,
      updatedAt: new Date().toISOString(),
      cards: {
        ...board.cards,
        [card.id]: {
          ...card,
          title,
          body: {
            type: 'doc',
            content: bodyText ? [{ type: 'paragraph', content: [{ type: 'text', text: bodyText }] }] : [],
          },
          color: color !== '#ffffff' ? color : undefined,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
    onClose();
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
    onClose();
  };

  return (
    <Modal
      title="Edit Card"
      open={open}
      onCancel={onClose}
      footer={[
        <Popconfirm
          key="delete"
          title="Delete card?"
          description="This action cannot be undone."
          onConfirm={handleDelete}
          okText="Yes"
          cancelText="No"
        >
          <Button danger>Delete</Button>
        </Popconfirm>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Background Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {COLOR_PRESETS.map((preset) => (
                <div
                  key={preset}
                  onClick={() => setColor(preset)}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: preset,
                    border: color === preset ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <ColorPicker value={color} onChange={(_, hex) => setColor(hex)} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Body (plain text for now)</label>
          <Input.TextArea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Card body text"
            rows={6}
          />
        </div>
      </Space>
    </Modal>
  );
}
