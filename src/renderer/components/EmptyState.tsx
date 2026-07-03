import React from 'react';
import { Empty, Button, Space } from 'antd';
import { FolderOutlined, FileAddOutlined } from '@ant-design/icons';

export function EmptyState() {
  const handleNew = () => {
    window.kankan.newBoard();
  };

  const handleOpen = () => {
    window.kankan.openBoard();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
      <Empty description="No board open" style={{ marginBottom: '24px' }} />
      <Space>
        <Button type="primary" icon={<FileAddOutlined />} onClick={handleNew}>
          New Board
        </Button>
        <Button icon={<FolderOutlined />} onClick={handleOpen}>
          Open Board
        </Button>
      </Space>
    </div>
  );
}
