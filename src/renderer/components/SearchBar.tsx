import React from 'react';
import { Input, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useBoardContext } from '../context/BoardContext';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const { board } = useBoardContext();

  const matchCount = Object.values(board.cards).filter((card) => {
    const query = searchQuery.toLowerCase();
    return card.title.toLowerCase().includes(query);
  }).length;

  return (
    <div style={{ padding: '0 16px', paddingTop: '8px' }}>
      <Input
        placeholder="Search cards by title or content..."
        prefix={<SearchOutlined />}
        suffix={
          searchQuery ? (
            <Badge
              count={matchCount}
              style={{ backgroundColor: '#1890ff' }}
              onClick={() => onSearchChange('')}
            />
          ) : null
        }
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        allowClear
        size="large"
      />
    </div>
  );
}
