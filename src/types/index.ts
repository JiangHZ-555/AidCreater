// 节点位置类型
export interface Position {
  x: number;
  y: number;
}

// 节点类型枚举
export type NodeType = 'input' | 'agent' | 'output';

// 节点配置类型
export interface NodeConfig {
  promptTemplate?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

// 节点数据类型
export interface NodeData {
  label: string;
  content?: string;
  config?: NodeConfig;
  result?: string;
}

// 节点类型
export interface Node {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
  createdAt: Date;
  updatedAt: Date;
}

// 工作流节点类型（用于React Flow）
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
}

// 连接边类型
export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  style?: Record<string, unknown>;
  createdAt?: Date;
}

// 工作流状态枚举
export type WorkflowStatus = 'draft' | 'running' | 'completed' | 'error';

// 智谱AI配置
export interface ZhipuConfig {
  apiKey: string;
  model: string;
  timeout: number;
}

// 应用配置
export interface AppConfig {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  autoSaveInterval: number;
  zhipu: ZhipuConfig;
}

// 工作流类型
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  status?: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
}

// 资产类型枚举
export type AssetType = 'idea' | 'concept' | 'design' | 'text';

// 资产类型
export interface Asset {
  id: string;
  title: string;
  content: string;
  type: AssetType;
  tags: string[];
  workflowId?: string;
  nodeId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    wordCount?: number;
    language?: string;
    quality?: number;
  };
}

// 执行状态枚举
export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

// 执行上下文类型
export interface ExecutionContext {
  workflowId: string;
  variables: Map<string, unknown>;
  executionId: string;
  startTime: Date;
  status: ExecutionStatus;
}

// 执行结果类型
export interface ExecutionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

// 验证结果类型
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// API响应类型
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
