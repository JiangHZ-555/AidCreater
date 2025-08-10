import type { Workflow, Asset, AppConfig } from '../types';

/**
 * 内存存储服务类
 * 使用内存存储实现数据管理，数据在页面刷新后会丢失
 */
export class StorageService {
  // 内存存储
  private workflows: Map<string, Workflow> = new Map();
  private assets: Map<string, Asset> = new Map();
  private executions: Map<
    string,
    {
      id: string;
      workflowId: string;
      startTime: Date;
      endTime?: Date;
      status: string;
      result?: Record<string, unknown>;
      error?: string;
    }
  > = new Map();
  private currentWorkflowId: string | null = null;
  private config: AppConfig | null = null;

  /**
   * 初始化存储服务
   */
  async initDatabase(): Promise<void> {
    // 内存存储不需要数据库初始化，仅保留接口兼容性
    console.log('内存存储服务已初始化');
  }

  // ==================== 工作流相关 ====================

  /**
   * 保存工作流
   */
  async saveWorkflow(workflow: Workflow): Promise<void> {
    const updatedWorkflow = {
      ...workflow,
      updatedAt: new Date(),
    };

    this.workflows.set(workflow.id, updatedWorkflow);
    console.log(`工作流已保存: ${workflow.name} (${workflow.id})`);
  }

  /**
   * 获取所有工作流
   */
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  /**
   * 获取单个工作流
   */
  async getWorkflow(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) || null;
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow(id: string): Promise<void> {
    this.workflows.delete(id);
    console.log(`工作流已删除: ${id}`);
  }

  // ==================== 资产相关 ====================

  /**
   * 保存资产
   */
  async saveAsset(asset: Asset): Promise<void> {
    const updatedAsset = {
      ...asset,
      updatedAt: new Date(),
    };

    this.assets.set(asset.id, updatedAsset);
    console.log(`资产已保存: ${asset.title} (${asset.id})`);
  }

  /**
   * 获取所有资产
   */
  async getAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  /**
   * 根据工作流ID获取资产
   */
  async getAssetsByWorkflow(workflowId: string): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      asset => asset.workflowId === workflowId
    );
  }

  /**
   * 删除资产
   */
  async deleteAsset(id: string): Promise<void> {
    this.assets.delete(id);
    console.log(`资产已删除: ${id}`);
  }

  // ==================== 配置相关 ====================

  /**
   * 保存应用配置
   */
  saveConfig(config: AppConfig): void {
    this.config = config;
    console.log('应用配置已保存');
  }

  /**
   * 获取应用配置
   */
  getConfig(): AppConfig | null {
    return this.config;
  }

  /**
   * 保存当前工作流ID
   */
  saveCurrentWorkflowId(workflowId: string | null): void {
    this.currentWorkflowId = workflowId;
    console.log(`当前工作流ID已设置: ${workflowId}`);
  }

  /**
   * 获取当前工作流ID
   */
  getCurrentWorkflowId(): string | null {
    return this.currentWorkflowId;
  }

  // ==================== 执行历史相关 ====================

  /**
   * 保存执行历史
   */
  async saveExecution(execution: {
    id: string;
    workflowId: string;
    startTime: Date;
    endTime?: Date;
    status: string;
    result?: Record<string, unknown>;
    error?: string;
  }): Promise<void> {
    this.executions.set(execution.id, execution);
    console.log(`执行历史已保存: ${execution.id}`);
  }

  /**
   * 获取执行历史
   */
  async getExecutions(workflowId?: string): Promise<
    {
      id: string;
      workflowId: string;
      startTime: Date;
      endTime?: Date;
      status: string;
      result?: Record<string, unknown>;
      error?: string;
    }[]
  > {
    const allExecutions = Array.from(this.executions.values());

    if (workflowId) {
      return allExecutions.filter(exec => exec.workflowId === workflowId);
    }

    return allExecutions;
  }

  // ==================== 辅助方法 ====================

  /**
   * 清空所有数据
   */
  async clearAllData(): Promise<void> {
    this.workflows.clear();
    this.assets.clear();
    this.executions.clear();
    this.currentWorkflowId = null;
    this.config = null;
    console.log('所有数据已清空');
  }

  /**
   * 导出数据
   */
  async exportData(): Promise<{
    workflows: Workflow[];
    assets: Asset[];
    executions: {
      id: string;
      workflowId: string;
      startTime: Date;
      endTime?: Date;
      status: string;
      result?: Record<string, unknown>;
      error?: string;
    }[];
    config: AppConfig | null;
  }> {
    return {
      workflows: Array.from(this.workflows.values()),
      assets: Array.from(this.assets.values()),
      executions: Array.from(this.executions.values()),
      config: this.config,
    };
  }

  /**
   * 导入数据
   */
  async importData(data: {
    workflows?: Workflow[];
    assets?: Asset[];
    executions?: {
      id: string;
      workflowId: string;
      startTime: Date;
      endTime?: Date;
      status: string;
      result?: Record<string, unknown>;
      error?: string;
    }[];
    config?: AppConfig;
  }): Promise<void> {
    if (data.workflows) {
      for (const workflow of data.workflows) {
        await this.saveWorkflow(workflow);
      }
    }

    if (data.assets) {
      for (const asset of data.assets) {
        await this.saveAsset(asset);
      }
    }

    if (data.config) {
      this.saveConfig(data.config);
    }

    console.log('数据导入完成');
  }
}

// 导出单例实例
export const storageService = new StorageService();
