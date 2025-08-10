import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card, Typography, Tag, Button } from 'antd';
import {
  ExportOutlined,
  CopyOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { WorkflowNode } from '../../../types';
import { copyToClipboard, downloadFile } from '../../../utils';

const { Text } = Typography;

const OutputNode: React.FC<NodeProps> = ({ data, selected }) => {
  // 类型断言确保data具有正确的类型
  const nodeData = data as unknown as WorkflowNode['data'] & {
    format?: string;
    filename?: string;
    content?: string;
    status?: 'empty' | 'ready' | 'exported';
  };
  const getFormatColor = (format?: string) => {
    switch (format) {
      case 'json':
        return '#722ed1';
      case 'markdown':
        return '#13c2c2';
      case 'html':
        return '#fa541c';
      default:
        return '#666';
    }
  };

  const handleCopy = async () => {
    if (nodeData.content) {
      const success = await copyToClipboard(nodeData.content);
      if (success) {
        // 这里可以添加成功提示
        console.log('内容已复制到剪贴板');
      }
    }
  };

  const handleDownload = () => {
    if (nodeData.content) {
      const filename =
        nodeData.filename || `output.${nodeData.format || 'txt'}`;
      const mimeTypeMap: Record<string, string> = {
        json: 'application/json',
        markdown: 'text/markdown',
        html: 'text/html',
        text: 'text/plain',
      };
      const mimeType = mimeTypeMap[nodeData.format || 'text'];

      downloadFile(nodeData.content, filename, mimeType);
    }
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
        <ExportOutlined style={{ color: '#fa541c', marginRight: 8 }} />
        <Text strong style={{ fontSize: 14 }}>
          {nodeData.label || '输出节点'}
        </Text>
        <Tag color="orange" style={{ marginLeft: 'auto', fontSize: '12px' }}>
          输出
        </Tag>
      </div>

      {/* 格式信息 */}
      {nodeData.format && (
        <div style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: '#666' }}>格式: </Text>
          <Text
            style={{ fontSize: 11, color: getFormatColor(nodeData.format) }}
          >
            {nodeData.format.toUpperCase()}
          </Text>
        </div>
      )}

      {/* 文件名 */}
      {nodeData.filename && (
        <div style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: '#666' }}>文件: </Text>
          <Text style={{ fontSize: 11, color: '#1890ff' }}>
            {nodeData.filename}
          </Text>
        </div>
      )}

      {/* 内容预览 */}
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
            等待输出内容...
          </Text>
        )}
      </div>

      {/* 状态指示 */}
      <div style={{ marginBottom: 8 }}>
        <Tag
          color={
            nodeData.status === 'ready'
              ? 'green'
              : nodeData.status === 'exported'
                ? 'blue'
                : 'default'
          }
          style={{ fontSize: '12px' }}
        >
          {nodeData.status === 'ready'
            ? '就绪'
            : nodeData.status === 'exported'
              ? '已导出'
              : '空'}
        </Tag>
      </div>

      {/* 操作按钮 */}
      {nodeData.content && (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            style={{ padding: '2px 4px', fontSize: 10, height: 'auto' }}
          >
            复制
          </Button>
          <Button
            type="text"
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            style={{ padding: '2px 4px', fontSize: 10, height: 'auto' }}
          >
            下载
          </Button>
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
          background: '#fa541c',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </Card>
  );
};

export default memo(OutputNode);
