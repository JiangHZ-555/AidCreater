import React from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import {
  PlayCircleOutlined,
  SaveOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../stores';
import Canvas from '../components/Canvas';

const { Content } = Layout;
const { Text } = Typography;

const MainWorkspace: React.FC = () => {
  const { ui, workflow, setPropertyPanelVisible } = useAppStore();

  const togglePropertyPanel = () => {
    setPropertyPanelVisible(!ui.propertyPanelVisible);
  };

  return (
    <Layout style={{ height: '100%' }}>
      {/* 主画布区域 */}
      <Content
        style={{
          background: '#fff',
          margin: '16px',
          marginRight: ui.propertyPanelVisible ? '8px' : '16px',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 工具栏 */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              disabled={workflow.nodes.length === 0}
            >
              运行工作流
            </Button>
            <Button icon={<SaveOutlined />}>保存</Button>
            <Button icon={<PlusOutlined />}>新建工作流</Button>
          </Space>

          <Space>
            <Text type="secondary">
              节点: {workflow.nodes.length} | 连接: {workflow.edges.length}
            </Text>
            <Button type="text" onClick={togglePropertyPanel}>
              {ui.propertyPanelVisible ? '隐藏属性面板' : '显示属性面板'}
            </Button>
          </Space>
        </div>

        {/* 画布区域 */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: '#fafafa',
          }}
        >
          <Canvas />
        </div>
      </Content>

      {/* 属性面板 - 现在由Canvas组件内部管理 */}
    </Layout>
  );
};

export default MainWorkspace;
