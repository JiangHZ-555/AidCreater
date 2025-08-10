import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Typography, Tag } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import type { WorkflowNode } from '../../../types';

const { Text } = Typography;

const InputNode: React.FC<NodeProps> = ({ data, selected }) => {
  // 类型断言确保data具有正确的类型
  const nodeData = data as unknown as WorkflowNode['data'] & {
    content?: string;
    placeholder?: string;
  };
  return (
    <Card
      size="small"
      style={{
        minWidth: 200,
        border: selected ? '2px solid #1890ff' : '1px solid #d9d9d9',
        borderRadius: 8,
        boxShadow: selected
          ? '0 4px 12px rgba(24, 144, 255, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        background: '#fff',
      }}
      bodyStyle={{ padding: 12 }}
    >
      {/* 节点头部 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <FileTextOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        <Text strong style={{ fontSize: 14 }}>
          {nodeData.label || '输入节点'}
        </Text>
        <Tag color="green" style={{ marginLeft: 'auto', fontSize: '12px' }}>
          输入
        </Tag>
      </div>

      {/* 节点内容 */}
      <div style={{ marginBottom: 8 }}>
        {nodeData.content ? (
          <Text
            style={{
              fontSize: 12,
              color: '#666',
              display: 'block',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={nodeData.content}
          >
            {nodeData.content}
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 12,
              color: '#999',
              fontStyle: 'italic',
            }}
          >
            {nodeData.placeholder || '请输入内容...'}
          </Text>
        )}
      </div>

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          width: 12,
          height: 12,
          background: '#52c41a',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </Card>
  );
};

export default memo(InputNode);
