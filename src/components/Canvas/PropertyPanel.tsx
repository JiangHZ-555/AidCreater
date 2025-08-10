import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Slider,
  Button,
  Space,
  Divider,
  InputNumber,
} from 'antd';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import type { Node } from '@xyflow/react';
import type { WorkflowNode } from '../../types';

// const { Text: AntText } = Typography; // 暂时注释掉未使用的变量
const { TextArea } = Input;
const { Option } = Select;

interface PropertyPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  onDeleteNode: (nodeId: string) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  node,
  onUpdateNode,
  onDeleteNode,
}) => {
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    form.setFieldsValue({
      label: node.data.label,
      ...(node.data.config || {}),
    });
    setHasChanges(false);
  }, [node, form]);

  // 处理表单变化
  const handleFormChange = () => {
    setHasChanges(true);
  };

  // 保存更改
  const handleSave = () => {
    const values = form.getFieldsValue();
    const { label, ...config } = values;

    onUpdateNode(node.id, {
      label,
      config,
    });
    setHasChanges(false);
  };

  // 删除节点
  const handleDelete = () => {
    onDeleteNode(node.id);
  };

  // 渲染输入节点属性
  const renderInputNodeProperties = () => (
    <>
      <Form.Item label="内容" name="content" tooltip="输入节点的文本内容">
        <TextArea
          rows={4}
          placeholder="请输入文本内容..."
          showCount
          maxLength={1000}
        />
      </Form.Item>

      <Form.Item
        label="占位符"
        name="placeholder"
        tooltip="当内容为空时显示的提示文本"
      >
        <Input placeholder="请输入占位符文本..." />
      </Form.Item>
    </>
  );

  // 渲染Agent节点属性
  const renderAgentNodeProperties = () => (
    <>
      <Form.Item
        label="模型"
        name="model"
        tooltip="选择要使用的AI模型"
        rules={[{ required: true, message: '请选择模型' }]}
      >
        <Select placeholder="选择模型">
          <Option value="glm-4">GLM-4</Option>
          <Option value="glm-4v">GLM-4V</Option>
          <Option value="glm-3-turbo">GLM-3-Turbo</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="提示词"
        name="prompt"
        tooltip="AI模型的指令提示词"
        rules={[{ required: true, message: '请输入提示词' }]}
      >
        <TextArea
          rows={6}
          placeholder="请输入提示词...\n\n例如：请帮我总结以下内容的要点"
          showCount
          maxLength={2000}
        />
      </Form.Item>

      <Form.Item
        label="温度"
        name="temperature"
        tooltip="控制输出的随机性，0-1之间，值越高越随机"
      >
        <Slider
          min={0}
          max={1}
          step={0.1}
          marks={{
            0: '0',
            0.5: '0.5',
            1: '1',
          }}
        />
      </Form.Item>

      <Form.Item
        label="最大令牌数"
        name="maxTokens"
        tooltip="生成内容的最大长度"
      >
        <InputNumber
          min={1}
          max={4000}
          placeholder="1024"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="系统提示"
        name="systemPrompt"
        tooltip="系统级别的提示词，定义AI的角色和行为"
      >
        <TextArea
          rows={3}
          placeholder="你是一个专业的助手..."
          showCount
          maxLength={500}
        />
      </Form.Item>
    </>
  );

  // 渲染输出节点属性
  const renderOutputNodeProperties = () => (
    <>
      <Form.Item label="输出格式" name="format" tooltip="选择输出内容的格式">
        <Select placeholder="选择格式">
          <Option value="text">纯文本</Option>
          <Option value="json">JSON</Option>
          <Option value="markdown">Markdown</Option>
          <Option value="html">HTML</Option>
        </Select>
      </Form.Item>

      <Form.Item label="文件名" name="filename" tooltip="导出文件的名称">
        <Input placeholder="output.txt" />
      </Form.Item>

      <Form.Item
        label="自动导出"
        name="autoExport"
        tooltip="是否在接收到内容后自动导出"
      >
        <Select placeholder="选择导出方式">
          <Option value={false}>手动导出</Option>
          <Option value={true}>自动导出</Option>
        </Select>
      </Form.Item>
    </>
  );

  // 根据节点类型渲染属性
  const renderNodeProperties = () => {
    switch (node.type) {
      case 'input':
        return renderInputNodeProperties();
      case 'agent':
        return renderAgentNodeProperties();
      case 'output':
        return renderOutputNodeProperties();
      default:
        return null;
    }
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'input':
        return '输入节点';
      case 'agent':
        return 'Agent节点';
      case 'output':
        return '输出节点';
      default:
        return '未知节点';
    }
  };

  return (
    <Card
      title={`${getNodeTypeLabel(node.type || '')}属性`}
      size="small"
      style={{
        position: 'absolute',
        top: 16,
        right: 272, // 节点面板宽度 + 间距
        width: 320,
        maxHeight: 'calc(100vh - 32px)',
        overflow: 'auto',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
      bodyStyle={{ padding: 16 }}
      extra={
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
        />
      }
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        size="small"
      >
        {/* 基础属性 */}
        <Form.Item
          label="节点名称"
          name="label"
          rules={[{ required: true, message: '请输入节点名称' }]}
        >
          <Input placeholder="请输入节点名称" />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        {/* 节点特定属性 */}
        {renderNodeProperties()}

        {/* 操作按钮 */}
        <div style={{ marginTop: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              保存
            </Button>
          </Space>
        </div>

        {/* 节点信息 */}
        <Divider style={{ margin: '12px 0' }} />
        <div style={{ fontSize: 11, color: '#999' }}>
          <div>节点ID: {node.id}</div>
          <div>节点类型: {node.type}</div>
          <div>
            位置: ({Math.round(node.position.x)}, {Math.round(node.position.y)})
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default PropertyPanel;
