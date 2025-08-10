import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Connection,
  ReactFlowProvider,
  type ReactFlowInstance,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import { Button, Space, message } from 'antd';
import {
  PlayCircleOutlined,
  SaveOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import '@xyflow/react/dist/style.css';

import { useAppStore } from '../../stores';
import type { Workflow, WorkflowNode } from '../../types';
import { generateId } from '../../utils';
import InputNode from './nodes/InputNode';
import AgentNode from './nodes/AgentNode';
import OutputNode from './nodes/OutputNode';
import CustomEdge from './edges/CustomEdge';
import NodePanel from './NodePanel';
import PropertyPanel from './PropertyPanel';

// 注册自定义节点类型
const nodeTypes: NodeTypes = {
  input: InputNode,
  agent: AgentNode,
  output: OutputNode,
};

// 注册自定义边类型
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// 初始节点
const initialNodes: Node[] = [];

// 初始边
const initialEdges: Edge[] = [];

interface CanvasProps {
  workflowId?: string;
  readonly?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ workflowId, readonly = false }) => {
  const { workflows, updateWorkflow, executeWorkflow, setSelectedNodeId } =
    useAppStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // 当前工作流
  const currentWorkflow = workflowId
    ? workflows.find(w => w.id === workflowId)
    : null;

  // 连接节点
  const onConnect = useCallback(
    (params: Connection) => {
      if (readonly) return;

      const newEdge: Edge = {
        ...params,
        id: generateId('edge'),
        type: 'custom',
        animated: true,
      };
      const updatedEdges = addEdge(newEdge, edges as Edge[]);
      setEdges(updatedEdges);
    },
    [readonly, edges, setEdges]
  );

  // 拖拽结束
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 放置节点
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (readonly) return;

      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: generateId('node'),
        type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          config:
            type === 'agent'
              ? { model: 'glm-4', temperature: 0.7, maxTokens: 1024 }
              : {},
        },
      };

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
    },
    [reactFlowInstance, readonly, nodes, setNodes]
  );

  // 节点点击
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  // 画布点击
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // 更新节点数据
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<WorkflowNode['data']>) => {
      const updatedNodes = nodes.map((node: Node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          : node
      );
      setNodes(updatedNodes);
    },
    [nodes, setNodes]
  );

  // 删除节点
  const deleteNode = useCallback(
    (nodeId: string) => {
      if (readonly) return;

      const updatedNodes = nodes.filter((node: Node) => node.id !== nodeId);
      const updatedEdges = edges.filter(
        (edge: Edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setSelectedNode(null);
      setSelectedNodeId(null);
    },
    [readonly, nodes, edges, setNodes, setEdges, setSelectedNodeId]
  );

  // 保存工作流
  const saveWorkflow = useCallback(async () => {
    if (!currentWorkflow) {
      message.error('未找到当前工作流');
      return;
    }

    try {
      const workflowNodes: WorkflowNode[] = nodes.map((node: Node) => ({
        id: node.id,
        type: node.type as 'input' | 'agent' | 'output',
        position: node.position,
        data: node.data as unknown as WorkflowNode['data'],
      }));

      const updatedWorkflow: Workflow = {
        ...currentWorkflow,
        nodes: workflowNodes,
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
        })),
        updatedAt: new Date(),
      };

      await updateWorkflow(updatedWorkflow);
      message.success('工作流保存成功');
    } catch (error) {
      console.error('保存工作流失败:', error);
      message.error('保存工作流失败');
    }
  }, [currentWorkflow, nodes, edges, updateWorkflow]);

  // 执行工作流
  const runWorkflow = useCallback(async () => {
    if (!currentWorkflow || isExecuting) return;

    try {
      setIsExecuting(true);
      message.info('开始执行工作流...');

      const workflowNodes: WorkflowNode[] = nodes.map((node: Node) => ({
        id: node.id,
        type: node.type as 'input' | 'agent' | 'output',
        position: node.position,
        data: node.data as unknown as WorkflowNode['data'],
      }));

      const workflowToExecute: Workflow = {
        ...currentWorkflow,
        nodes: workflowNodes,
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
        })),
      };

      await executeWorkflow(workflowToExecute);
      message.success('工作流执行完成');
    } catch (error) {
      console.error('执行工作流失败:', error);
      message.error('执行工作流失败');
    } finally {
      setIsExecuting(false);
    }
  }, [currentWorkflow, nodes, edges, executeWorkflow, isExecuting]);

  // 清空画布
  const clearCanvas = useCallback(() => {
    if (readonly) return;

    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedNodeId(null);
    message.success('画布已清空');
  }, [readonly, setNodes, setEdges, setSelectedNodeId]);

  // 加载工作流数据
  React.useEffect(() => {
    if (currentWorkflow) {
      const flowNodes: Node[] = currentWorkflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data as unknown as Record<string, unknown>,
      }));

      const flowEdges: Edge[] = currentWorkflow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'custom',
        animated: true,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [currentWorkflow, setNodes, setEdges]);

  return (
    <div
      className="canvas-container"
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {/* 工具栏 */}
      {!readonly && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={runWorkflow}
              loading={isExecuting}
              disabled={nodes.length === 0}
            >
              执行
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={saveWorkflow}
              disabled={!currentWorkflow}
            >
              保存
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={clearCanvas}
              disabled={nodes.length === 0}
            >
              清空
            </Button>
          </Space>
        </div>
      )}

      {/* 节点面板 */}
      {!readonly && <NodePanel />}

      {/* 属性面板 */}
      {selectedNode && (
        <PropertyPanel
          node={selectedNode}
          onUpdateNode={updateNodeData}
          onDeleteNode={deleteNode}
        />
      )}

      {/* React Flow 画布 */}
      <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap
            style={{
              height: 120,
              width: 200,
            }}
            zoomable
            pannable
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

// 包装组件以提供 ReactFlowProvider
const CanvasWrapper: React.FC<CanvasProps> = props => {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
};

export default CanvasWrapper;
