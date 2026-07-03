import React, { useState } from 'react';
import { Input, Space, Spin } from 'antd';
import { useBoardContext } from '../context/BoardContext';

interface BoardHeaderProps {
  isSaving: boolean;
}

export function BoardHeader({ isSaving }: BoardHeaderProps) {
  const { board, mutate } = useBoardContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(board.name);

  const handleSave = () => {
    if (editValue.trim()) {
      mutate((b) => ({
        ...b,
        name: editValue,
        updatedAt: new Date().toISOString(),
      }));
    }
    setIsEditing(false);
  };

  return (
    <div
      style={{
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {isEditing ? (
        <Input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onPressEnter={handleSave}
          style={{ maxWidth: '300px', fontSize: '20px', fontWeight: 'bold' }}
        />
      ) : (
        <h1
          onClick={() => setIsEditing(true)}
          style={{
            margin: 0,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            userSelect: 'none',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {board.name}
        </h1>
      )}

      <Space>
        {isSaving && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Spin size="small" />
            <span style={{ fontSize: '12px', color: '#999' }}>Saving...</span>
          </div>
        )}
      </Space>
    </div>
  );
}
