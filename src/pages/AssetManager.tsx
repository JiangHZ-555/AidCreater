import React from 'react';
import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

const AssetManager: React.FC = () => {
  return (
    <div style={{ padding: '24px', height: '100%' }}>
      <Card
        title={<Title level={3}>资产管理</Title>}
        style={{ height: '100%' }}
        bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
      >
        <Empty
          description="资产管理功能开发中"
          style={{ marginTop: '100px' }}
        />
      </Card>
    </div>
  );
};

export default AssetManager;
