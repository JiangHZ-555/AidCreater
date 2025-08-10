import React, { useState, useEffect } from 'react';
import { Typography, Spin, Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAppStore } from '../stores';
import { generateId } from '../utils';
import Canvas from '../components/Canvas';
import type { Workflow } from '../types';

const { Title } = Typography;

const WorkspacePage: React.FC = () => {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { workflows, addWorkflow } = useAppStore();

  // 获取当前工作流
  const currentWorkflow = currentWorkflowId
    ? workflows.find(w => w.id === currentWorkflowId)
    : null;

  // 创建新工作流
  const createNewWorkflow = async () => {
    const newWorkflow: Workflow = {
      id: generateId('workflow'),
      name: '新工作流',
      description: '',
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addWorkflow(newWorkflow);
      setCurrentWorkflowId(newWorkflow.id);
    } catch (error) {
      console.error('创建工作流失败:', error);
    }
  };

  // 初始化
  useEffect(() => {
    const initWorkspace = async () => {
      setLoading(true);

      // 如果有工作流，选择第一个
      if (workflows.length > 0) {
        setCurrentWorkflowId(workflows[0].id);
      }

      setLoading(false);
    };

    initWorkspace();
  }, [workflows]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Spin size="large" tip="加载工作区..." />
      </div>
    );
  }

  // 如果没有工作流，显示空状态
  if (workflows.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: 24,
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              还没有工作流
              <br />
              创建您的第一个工作流开始使用
            </span>
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={createNewWorkflow}
            size="large"
          >
            创建工作流
          </Button>
        </Empty>
      </div>
    );
  }

  // 如果没有选中的工作流，显示选择提示
  if (!currentWorkflow) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: 24,
        }}
      >
        <Empty description="请选择一个工作流进行编辑">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={createNewWorkflow}
          >
            创建新工作流
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工作流标题 */}
      <div
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {currentWorkflow.name}
        </Title>
        {currentWorkflow.description && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {currentWorkflow.description}
          </div>
        )}
      </div>

      {/* 画布区域 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas workflowId={currentWorkflowId || undefined} />
      </div>
    </div>
  );
};

export default WorkspacePage;
