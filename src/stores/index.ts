import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { workflowEngine } from '../services/workflowEngine';

// 临时定义类型
interface Position {
  x: number;
  y: number;
}

type NodeType = 'input' | 'agent' | 'output';

interface NodeConfig {
  promptTemplate?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

interface NodeData {
  label: string;
  content?: string;
  config?: NodeConfig;
  result?: string;
}

interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
}

type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  style?: Record<string, unknown>;
  createdAt?: Date;
}

type AssetType = 'idea' | 'concept' | 'design' | 'text';

type WorkflowStatus = 'draft' | 'running' | 'completed' | 'error';

interface Workflow {
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

interface Asset {
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

interface ZhipuConfig {
  apiKey: string;
  model: string;
  timeout: number;
}

interface AppConfig {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  autoSave: boolean;
  autoSaveInterval: number;
  zhipu: ZhipuConfig;
}

// 工作流状态接口
interface WorkflowState {
  current: Workflow | null;
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  executionStatus: ExecutionStatus;
}

// UI状态接口
interface UIState {
  sidebarVisible: boolean;
  propertyPanelVisible: boolean;
  canvasViewport: { x: number; y: number; zoom: number };
  loading: boolean;
}

// 应用状态接口
interface AppState {
  // 工作流状态
  workflow: WorkflowState;

  // UI状态
  ui: UIState;

  // 配置状态
  config: AppConfig;

  // 资产状态
  assets: {
    list: Asset[];
    selectedAssetId: string | null;
    searchQuery: string;
  };

  // 工作流列表
  workflows: Workflow[];

  // Actions
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setExecutionStatus: (status: ExecutionStatus) => void;

  setSidebarVisible: (visible: boolean) => void;
  setPropertyPanelVisible: (visible: boolean) => void;
  setCanvasViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  setLoading: (loading: boolean) => void;

  updateConfig: (config: Partial<AppConfig>) => void;

  setAssets: (assets: Asset[]) => void;
  setSelectedAssetId: (assetId: string | null) => void;
  setSearchQuery: (query: string) => void;

  // 工作流管理
  addWorkflow: (workflow: Workflow) => Promise<void>;
  updateWorkflow: (workflow: Workflow) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  executeWorkflow: (workflow: Workflow) => Promise<void>;
}

// 创建状态store
export const useAppStore = create<AppState>(set => ({
  // 初始状态
  workflow: {
    current: null,
    nodes: [],
    edges: [],
    selectedNodeId: null,
    executionStatus: 'pending',
  },

  ui: {
    sidebarVisible: true,
    propertyPanelVisible: true,
    canvasViewport: { x: 0, y: 0, zoom: 1 },
    loading: false,
  },

  config: {
    theme: 'light',
    language: 'zh-CN',
    autoSave: true,
    autoSaveInterval: 30000,
    zhipu: {
      apiKey: '',
      model: 'glm-4',
      timeout: 30000,
    },
  },

  assets: {
    list: [],
    selectedAssetId: null,
    searchQuery: '',
  },

  workflows: [],

  // Actions
  setCurrentWorkflow: workflow => {
    set(state => ({
      workflow: {
        ...state.workflow,
        current: workflow,
        nodes: workflow?.nodes || [],
        edges: workflow?.edges || [],
      },
    }));
  },

  setNodes: nodes => {
    set(state => ({
      workflow: {
        ...state.workflow,
        nodes,
      },
    }));
  },

  setEdges: edges => {
    set(state => ({
      workflow: {
        ...state.workflow,
        edges,
      },
    }));
  },

  setSelectedNodeId: nodeId => {
    set(state => ({
      workflow: {
        ...state.workflow,
        selectedNodeId: nodeId,
      },
    }));
  },

  setExecutionStatus: status => {
    set(state => ({
      workflow: {
        ...state.workflow,
        executionStatus: status,
      },
    }));
  },

  setSidebarVisible: visible => {
    set(state => ({
      ui: {
        ...state.ui,
        sidebarVisible: visible,
      },
    }));
  },

  setPropertyPanelVisible: visible => {
    set(state => ({
      ui: {
        ...state.ui,
        propertyPanelVisible: visible,
      },
    }));
  },

  setCanvasViewport: viewport => {
    set(state => ({
      ui: {
        ...state.ui,
        canvasViewport: viewport,
      },
    }));
  },

  setLoading: loading => {
    set(state => ({
      ui: {
        ...state.ui,
        loading,
      },
    }));
  },

  updateConfig: config => {
    set(state => ({
      config: {
        ...state.config,
        ...config,
      },
    }));
  },

  setAssets: assets => {
    set(state => ({
      assets: {
        ...state.assets,
        list: assets,
      },
    }));
  },

  setSelectedAssetId: assetId => {
    set(state => ({
      assets: {
        ...state.assets,
        selectedAssetId: assetId,
      },
    }));
  },

  setSearchQuery: query => {
    set(state => ({
      assets: {
        ...state.assets,
        searchQuery: query,
      },
    }));
  },

  // 工作流管理实现
  addWorkflow: async workflow => {
    try {
      await storageService.saveWorkflow(workflow);
      set(state => ({
        workflows: [...state.workflows, workflow],
      }));
      console.log('工作流已添加:', workflow.name);
    } catch (error) {
      console.error('添加工作流失败:', error);
      throw error;
    }
  },

  updateWorkflow: async workflow => {
    try {
      await storageService.saveWorkflow(workflow);
      set(state => ({
        workflows: state.workflows.map(w =>
          w.id === workflow.id ? workflow : w
        ),
      }));
      console.log('工作流已更新:', workflow.name);
    } catch (error) {
      console.error('更新工作流失败:', error);
      throw error;
    }
  },

  deleteWorkflow: async workflowId => {
    try {
      await storageService.deleteWorkflow(workflowId);
      set(state => ({
        workflows: state.workflows.filter(w => w.id !== workflowId),
      }));
      console.log('工作流已删除:', workflowId);
    } catch (error) {
      console.error('删除工作流失败:', error);
      throw error;
    }
  },

  executeWorkflow: async workflow => {
    try {
      set(state => ({
        workflow: {
          ...state.workflow,
          executionStatus: 'running',
        },
      }));

      const result = await workflowEngine.executeWorkflow(workflow);

      if (result.success) {
        set(state => ({
          workflow: {
            ...state.workflow,
            executionStatus: 'completed',
          },
        }));
        console.log('工作流执行成功:', result);
      } else {
        set(state => ({
          workflow: {
            ...state.workflow,
            executionStatus: 'failed',
          },
        }));
        console.error('工作流执行失败:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      set(state => ({
        workflow: {
          ...state.workflow,
          executionStatus: 'failed',
        },
      }));
      console.error('工作流执行异常:', error);
      throw error;
    }
  },
}));
