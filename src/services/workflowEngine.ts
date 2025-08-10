import type {
  Workflow,
  WorkflowNode,
  Edge,
  ExecutionContext,
  ExecutionResult,
  ValidationResult,
  ExecutionStatus,
} from '../types';
import { zhipuService } from './zhipuService';
import { storageService } from './storageService';

/**
 * 工作流引擎类
 * 负责工作流的验证、执行和监控
 */
export class WorkflowEngine {
  private executionContext: ExecutionContext | null = null;
  private onStatusChange?: (status: ExecutionStatus) => void;
  private onNodeExecuted?: (nodeId: string, result: ExecutionResult) => void;

  /**
   * 设置状态变化回调
   */
  setStatusChangeCallback(callback: (status: ExecutionStatus) => void) {
    this.onStatusChange = callback;
  }

  /**
   * 设置节点执行完成回调
   */
  setNodeExecutedCallback(
    callback: (nodeId: string, result: ExecutionResult) => void
  ) {
    this.onNodeExecuted = callback;
  }

  /**
   * 验证工作流
   */
  validateWorkflow(workflow: Workflow): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查是否有节点
    if (workflow.nodes.length === 0) {
      errors.push('工作流必须包含至少一个节点');
      return { isValid: false, errors, warnings };
    }

    // 检查是否有输入节点
    const inputNodes = workflow.nodes.filter(node => node.type === 'input');
    if (inputNodes.length === 0) {
      errors.push('工作流必须包含至少一个输入节点');
    }

    // 检查是否有输出节点
    const outputNodes = workflow.nodes.filter(node => node.type === 'output');
    if (outputNodes.length === 0) {
      warnings.push('建议添加至少一个输出节点');
    }

    // 检查节点连接
    const nodeIds = new Set(workflow.nodes.map(node => node.id));
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`连接边引用了不存在的源节点: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`连接边引用了不存在的目标节点: ${edge.target}`);
      }
    }

    // 检查是否有孤立节点
    const connectedNodes = new Set<string>();
    workflow.edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedNodes = workflow.nodes.filter(
      node => !connectedNodes.has(node.id) && workflow.nodes.length > 1
    );
    if (isolatedNodes.length > 0) {
      warnings.push(
        `发现 ${isolatedNodes.length} 个孤立节点: ${isolatedNodes.map(n => n.data.label).join(', ')}`
      );
    }

    // 检查循环依赖
    if (this.hasCyclicDependency(workflow.nodes, workflow.edges)) {
      errors.push('工作流存在循环依赖');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(workflow: Workflow): Promise<ExecutionResult> {
    // 验证工作流
    const validation = this.validateWorkflow(workflow);
    if (!validation.isValid) {
      return {
        success: false,
        error: `工作流验证失败: ${validation.errors.join(', ')}`,
      };
    }

    // 初始化智谱AI配置
    await this.initializeZhipuConfig();

    // 创建执行上下文
    this.executionContext = {
      workflowId: workflow.id,
      variables: new Map(),
      executionId: this.generateExecutionId(),
      startTime: new Date(),
      status: 'running',
    };

    this.updateStatus('running');

    try {
      // 获取执行顺序
      const executionOrder = this.getExecutionOrder(
        workflow.nodes,
        workflow.edges
      );

      // 按顺序执行节点
      for (const nodeId of executionOrder) {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        const result = await this.executeNode(node, workflow.edges);

        // 通知节点执行完成
        if (this.onNodeExecuted) {
          this.onNodeExecuted(nodeId, result);
        }

        if (!result.success) {
          this.updateStatus('failed');
          return {
            success: false,
            error: `节点 ${node.data.label} 执行失败: ${result.error}`,
          };
        }

        // 将结果存储到上下文变量中
        if (result.data) {
          this.executionContext.variables.set(nodeId, result.data);
        }
      }

      this.updateStatus('completed');
      return {
        success: true,
        data: Object.fromEntries(this.executionContext.variables),
        duration: Date.now() - this.executionContext.startTime.getTime(),
      };
    } catch (error) {
      this.updateStatus('failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: WorkflowNode,
    edges: Edge[]
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      let result: Record<string, unknown> = {};

      switch (node.type) {
        case 'input':
          result = await this.executeInputNode(node);
          break;
        case 'agent':
          result = await this.executeAgentNode(node, edges);
          break;
        case 'output':
          result = await this.executeOutputNode(node, edges);
          break;
        default:
          throw new Error(`不支持的节点类型: ${node.type}`);
      }

      return {
        success: true,
        data: result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '节点执行失败',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 执行输入节点
   */
  private async executeInputNode(
    node: WorkflowNode
  ): Promise<Record<string, unknown>> {
    // 输入节点直接返回其内容
    return {
      content: node.data.content || '',
      nodeId: node.id,
      type: 'input',
    };
  }

  /**
   * 执行Agent节点
   */
  private async executeAgentNode(
    node: WorkflowNode,
    edges: Edge[]
  ): Promise<Record<string, unknown>> {
    try {
      // 构建提示词
      let prompt = node.data.config?.promptTemplate || node.data.content || '';

      // 获取前置节点的输出作为输入
      const inputContent = this.getInputContentForNode(node.id, edges);
      if (inputContent) {
        prompt = prompt.replace(/\{input\}/g, inputContent);
      }

      if (!prompt.trim()) {
        throw new Error('Agent节点缺少提示词内容');
      }

      // 调用智谱AI服务
      const response = await zhipuService.generateContent({
        prompt,
        model: node.data.config?.model || 'glm-4',
        temperature: node.data.config?.temperature || 0.7,
        maxTokens: node.data.config?.maxTokens || 1000,
      });

      if (!response.success) {
        throw new Error(response.error || 'AI生成失败');
      }

      const result = {
        content: response.data?.content || '',
        nodeId: node.id,
        type: 'agent',
        model: node.data.config?.model || 'glm-4',
        prompt: prompt,
        timestamp: new Date().toISOString(),
      };

      // 保存结果到存储服务
      await this.saveNodeResult(node.id, result);

      return result;
    } catch (error) {
      console.error(`Agent节点执行失败 (${node.id}):`, error);
      throw error;
    }
  }

  /**
   * 执行输出节点
   */
  private async executeOutputNode(
    node: WorkflowNode,
    edges: Edge[]
  ): Promise<Record<string, unknown>> {
    const inputContent = this.getInputContentForNode(node.id, edges);
    // 输出节点处理前置节点的结果
    return {
      content: inputContent || node.data.content || '',
      nodeId: node.id,
      type: 'output',
    };
  }

  /**
   * 检查是否存在循环依赖
   */
  private hasCyclicDependency(nodes: WorkflowNode[], edges: Edge[]): boolean {
    const graph = new Map<string, string[]>();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    // 构建邻接表
    nodes.forEach(node => {
      graph.set(node.id, []);
    });

    edges.forEach(edge => {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);
    });

    // DFS检查循环
    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  /**
   * 获取节点执行顺序（拓扑排序）
   */
  private getExecutionOrder(nodes: WorkflowNode[], edges: Edge[]): string[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const result: string[] = [];

    // 初始化
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // 构建图和计算入度
    edges.forEach(edge => {
      const neighbors = graph.get(edge.source) || [];
      neighbors.push(edge.target);
      graph.set(edge.source, neighbors);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // 找到所有入度为0的节点
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    // 拓扑排序
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = graph.get(current) || [];
      neighbors.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    return result;
  }

  /**
   * 更新执行状态
   */
  private updateStatus(status: ExecutionStatus) {
    if (this.executionContext) {
      this.executionContext.status = status;
    }
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  /**
   * 生成执行ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 延迟函数
   * @unused 预留方法，用于节点执行间的延迟
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 获取当前执行上下文
   */
  getExecutionContext(): ExecutionContext | null {
    return this.executionContext;
  }

  /**
   * 停止执行
   */
  stopExecution(): void {
    if (this.executionContext) {
      this.updateStatus('cancelled');
      this.executionContext = null;
    }
  }

  /**
   * 获取节点的输入内容
   */
  private getInputContentForNode(nodeId: string, edges: Edge[]): string {
    if (!this.executionContext) return '';

    const sourceEdges = edges.filter(edge => edge.target === nodeId);
    const sourceNodeIds = sourceEdges.map(edge => edge.source);

    const inputContents = sourceNodeIds
      .map(sourceId => {
        const sourceResult = this.executionContext!.variables.get(sourceId);
        if (
          sourceResult &&
          typeof sourceResult === 'object' &&
          'content' in sourceResult &&
          typeof sourceResult.content === 'string'
        ) {
          return sourceResult.content;
        }
        return null;
      })
      .filter(content => content !== null) as string[];

    return inputContents.join('\n\n');
  }

  /**
   * 保存节点执行结果
   */
  private async saveNodeResult(
    nodeId: string,
    result: Record<string, unknown>
  ): Promise<void> {
    try {
      // 这里可以保存到资产管理或执行历史
      console.log(`节点 ${nodeId} 执行结果已保存:`, result);
    } catch (error) {
      console.error('保存节点结果失败:', error);
    }
  }

  /**
   * 初始化智谱AI配置
   */
  async initializeZhipuConfig(): Promise<void> {
    try {
      const config = storageService.getConfig();
      if (config && config.zhipu) {
        zhipuService.setConfig(config.zhipu);
        console.log('智谱AI配置已加载');
      } else {
        console.warn('未找到智谱AI配置');
      }
    } catch (error) {
      console.error('初始化智谱AI配置失败:', error);
    }
  }
}

// 导出单例实例
export const workflowEngine = new WorkflowEngine();
