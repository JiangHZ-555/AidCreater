import React from 'react';
import { Card, Typography, Space } from 'antd';
import {
  FileTextOutlined,
  RobotOutlined,
  ExportOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface NodeItemProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const NodeItem: React.FC<NodeItemProps> = ({
  type,
  label,
  icon,
  color,
  description,
}) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={event => onDragStart(event, type)}
      style={{
        padding: 12,
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        background: '#fff',
        cursor: 'grab',
        transition: 'all 0.2s',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 2px 8px ${color}20`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#d9d9d9';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onMouseDown={e => {
        e.currentTarget.style.cursor = 'grabbing';
      }}
      onMouseUp={e => {
        e.currentTarget.style.cursor = 'grab';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color, marginRight: 8, fontSize: 16 }}>{icon}</span>
        <Text strong style={{ fontSize: 14 }}>
          {label}
        </Text>
      </div>
      <Text style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>
        {description}
      </Text>
    </div>
  );
};

const NodePanel: React.FC = () => {
  const nodeTypes = [
    {
      type: 'input',
      label: '输入节点',
      icon: <FileTextOutlined />,
      color: '#52c41a',
      description: '提供文本输入，作为工作流的起始点',
    },
    {
      type: 'agent',
      label: 'Agent节点',
      icon: <RobotOutlined />,
      color: '#1890ff',
      description: '使用AI模型处理输入内容，生成结果',
    },
    {
      type: 'output',
      label: '输出节点',
      icon: <ExportOutlined />,
      color: '#fa541c',
      description: '接收处理结果，支持多种格式导出',
    },
  ];

  return (
    <Card
      title="节点库"
      size="small"
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 240,
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
      bodyStyle={{ padding: 12 }}
    >
      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          拖拽节点到画布中创建工作流
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {nodeTypes.map(nodeType => (
          <NodeItem key={nodeType.type} {...nodeType} />
        ))}
      </Space>

      <div
        style={{
          marginTop: 12,
          padding: 8,
          background: '#f5f5f5',
          borderRadius: 6,
        }}
      >
        <Text style={{ fontSize: 11, color: '#999', lineHeight: 1.4 }}>
          💡 提示：连接节点创建数据流，输入节点 → Agent节点 → 输出节点
        </Text>
      </div>
    </Card>
  );
};

export default NodePanel;
