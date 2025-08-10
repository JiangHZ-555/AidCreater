import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Typography, Tag, Progress } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import type { WorkflowNode } from '../../../types';

const { Text } = Typography;

const AgentNode: React.FC<NodeProps> = ({ data, selected }) => {
  // 类型断言确保data具有正确的类型
  const nodeData = data as unknown as WorkflowNode['data'] & {
    model?: string;
    prompt?: string;
    status?: string;
    progress?: number;
    temperature?: number;
    maxTokens?: number;
  };
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running':
        return '#1890ff';
      case 'completed':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'completed':
        return '已完成';
      case 'error':
        return '错误';
      default:
        return '待运行';
    }
  };

  return (
    <Card
      size="small"
      style={{
        minWidth: 220,
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
        <RobotOutlined style={{ color: '#1890ff', marginRight: 8 }} />
        <Text strong style={{ fontSize: 14 }}>
          {nodeData.label || 'Agent节点'}
        </Text>
        <Tag color="blue" style={{ marginLeft: 'auto', fontSize: '12px' }}>
          Agent
        </Tag>
      </div>

      {/* 模型信息 */}
      {nodeData.model && (
        <div style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: '#666' }}>模型: </Text>
          <Text style={{ fontSize: 11, color: '#1890ff' }}>
            {nodeData.model}
          </Text>
        </div>
      )}

      {/* 提示词预览 */}
      {nodeData.prompt && (
        <div style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 12,
              color: '#666',
              display: 'block',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={nodeData.prompt}
          >
            {nodeData.prompt}
          </Text>
        </div>
      )}

      {/* 状态和进度 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 11, color: '#666', marginRight: 8 }}>
            状态:
          </Text>
          <Tag
            color={getStatusColor(nodeData.status)}
            style={{ margin: 0, fontSize: '12px' }}
          >
            {getStatusText(nodeData.status)}
          </Tag>
        </div>

        {nodeData.status === 'running' && nodeData.progress !== undefined && (
          <Progress
            percent={nodeData.progress}
            size="small"
            strokeColor="#1890ff"
            showInfo={false}
            style={{ margin: 0 }}
          />
        )}
      </div>

      {/* 参数信息 */}
      {(nodeData.temperature !== undefined ||
        nodeData.maxTokens !== undefined) && (
        <div style={{ fontSize: 10, color: '#999', marginBottom: 8 }}>
          {nodeData.temperature !== undefined && (
            <span style={{ marginRight: 8 }}>温度: {nodeData.temperature}</span>
          )}
          {nodeData.maxTokens !== undefined && (
            <span>最大令牌: {nodeData.maxTokens}</span>
          )}
        </div>
      )}

      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          width: 12,
          height: 12,
          background: '#1890ff',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />

      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          width: 12,
          height: 12,
          background: '#1890ff',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </Card>
  );
};

export default memo(AgentNode);
