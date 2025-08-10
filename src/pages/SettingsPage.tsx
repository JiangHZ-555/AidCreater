import React from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Typography,
  Space,
  Divider,
  message,
} from 'antd';
import { useAppStore } from '../stores';
import { storageService } from '../services/storageService';
import { zhipuService } from '../services/zhipuService';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsPage: React.FC = () => {
  const { config, updateConfig } = useAppStore();
  const [form] = Form.useForm();

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      const zhipuValues = values.zhipu as Record<string, unknown> | undefined;
      const newConfig = {
        ...config,
        ...values,
        autoSaveInterval: (values.autoSaveInterval as number) * 1000, // 转换为毫秒
        zhipu: {
          ...config.zhipu,
          ...(zhipuValues || {}),
          timeout:
            ((zhipuValues?.timeout as number) || config.zhipu.timeout / 1000) *
            1000, // 转换为毫秒
        },
      };

      // 更新store
      updateConfig(newConfig);

      // 保存到存储服务
      await storageService.saveConfig(newConfig);

      // 更新智谱AI服务配置
      zhipuService.setConfig(newConfig.zhipu);

      message.success('设置保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('设置保存失败');
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
      <Card
        title={<Title level={3}>应用设置</Title>}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            theme: config.theme,
            language: config.language,
            autoSave: config.autoSave,
            autoSaveInterval: config.autoSaveInterval / 1000, // 转换为秒
            zhipu: {
              apiKey: config.zhipu.apiKey,
              model: config.zhipu.model,
              timeout: config.zhipu.timeout / 1000, // 转换为秒
            },
          }}
          onFinish={handleSave}
        >
          <Title level={4}>基础设置</Title>

          <Form.Item label="主题" name="theme" tooltip="选择应用的显示主题">
            <Select>
              <Option value="light">浅色主题</Option>
              <Option value="dark">深色主题</Option>
            </Select>
          </Form.Item>

          <Form.Item label="语言" name="language" tooltip="选择应用的显示语言">
            <Select>
              <Option value="zh-CN">简体中文</Option>
              <Option value="en-US">English</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="自动保存"
            name="autoSave"
            valuePropName="checked"
            tooltip="启用后将自动保存工作流更改"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="自动保存间隔（秒）"
            name="autoSaveInterval"
            tooltip="自动保存的时间间隔"
          >
            <Input type="number" min={10} max={300} />
          </Form.Item>

          <Divider />

          <Title level={4}>智谱AI设置</Title>
          <Text
            type="secondary"
            style={{ display: 'block', marginBottom: '16px' }}
          >
            配置智谱AI API以启用创意生成功能
          </Text>

          <Form.Item
            label="API密钥"
            name={['zhipu', 'apiKey']}
            rules={[{ required: true, message: '请输入智谱AI API密钥' }]}
            tooltip="从智谱AI官网获取的API密钥"
          >
            <Input.Password placeholder="请输入智谱AI API密钥" />
          </Form.Item>

          <Form.Item
            label="模型"
            name={['zhipu', 'model']}
            tooltip="选择要使用的智谱AI模型"
          >
            <Select>
              <Option value="glm-4">GLM-4</Option>
              <Option value="glm-4-plus">GLM-4-Plus</Option>
              <Option value="glm-4-0520">GLM-4-0520</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="请求超时时间（秒）"
            name={['zhipu', 'timeout']}
            tooltip="API请求的超时时间"
          >
            <Input type="number" min={5} max={120} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
