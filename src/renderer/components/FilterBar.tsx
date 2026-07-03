import React from 'react';
import { Space, Button, Tooltip, Segmented } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { useBoardContext } from '../context/BoardContext';

const COLOR_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: '🟦 Blue', value: '#e6f7ff' },
  { label: '🟨 Yellow', value: '#fffb8f' },
  { label: '🟩 Green', value: '#f6ffed' },
  { label: '🟪 Purple', value: '#f9f0ff' },
  { label: '🟧 Orange', value: '#fff7e6' },
  { label: '⬜ No Color', value: 'none' },
];

interface FilterBarProps {
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
}

export function FilterBar({ selectedColor, onColorChange }: FilterBarProps) {
  const { board } = useBoardContext();

  const getColorCounters = () => {
    const counters: Record<string, number> = {
      all: 0,
      '#e6f7ff': 0,
      '#fffb8f': 0,
      '#f6ffed': 0,
      '#f9f0ff': 0,
      '#fff7e6': 0,
      none: 0,
    };

    Object.values(board.cards).forEach((card) => {
      counters.all++;
      if (card.color) {
        counters[card.color] = (counters[card.color] || 0) + 1;
      } else {
        counters.none++;
      }
    });

    return counters;
  };

  const counters = getColorCounters();

  const segmentOptions = COLOR_OPTIONS.map((option) => ({
    label: `${option.label} (${counters[option.value] || 0})`,
    value: option.value,
  }));

  const activeValue = selectedColor === null ? 'all' : selectedColor === 'none' ? 'none' : selectedColor || 'all';

  return (
    <div style={{ padding: '8px 16px', borderBottom: '1px solid #434343' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ fontSize: '12px', color: '#999' }}>Filter by card color:</div>
        <Space size="small">
          <Segmented
            options={segmentOptions}
            value={activeValue}
            onChange={(value) => {
              if (value === 'all') {
                onColorChange(null);
              } else if (value === 'none') {
                onColorChange('none');
              } else {
                onColorChange(value as string);
              }
            }}
            size="small"
          />
          {selectedColor && (
            <Tooltip title="Clear filter">
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={() => onColorChange(null)}
                type="text"
              />
            </Tooltip>
          )}
        </Space>
      </Space>
    </div>
  );
}
