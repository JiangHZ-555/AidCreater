import React from 'react';
import { Card, Typography, Collapse, Space, Tag } from 'antd';
import {
  QuestionCircleOutlined,
  BookOutlined,
  ToolOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HelpPage: React.FC = () => {
  const faqItems = [
    {
      key: '1',
      label: '如何创建第一个工作流？',
      children: (
        <div>
          <Paragraph>1. 在主工作台点击"新建工作流"按钮</Paragraph>
          <Paragraph>2. 从左侧节点面板拖拽节点到画布</Paragraph>
          <Paragraph>3. 连接节点创建工作流</Paragraph>
          <Paragraph>4. 配置节点参数</Paragraph>
          <Paragraph>5. 点击"运行工作流"执行</Paragraph>
        </div>
      ),
    },
    {
      key: '2',
      label: '如何配置智谱AI？',
      children: (
        <div>
          <Paragraph>1. 前往设置页面</Paragraph>
          <Paragraph>2. 在"智谱AI设置"部分输入您的API密钥</Paragraph>
          <Paragraph>3. 选择合适的模型（推荐GLM-4）</Paragraph>
          <Paragraph>4. 点击保存设置</Paragraph>
        </div>
      ),
    },
    {
      key: '3',
      label: '支持哪些节点类型？',
      children: (
        <div>
          <Space direction="vertical">
            <div>
              <Tag color="blue">输入节点</Tag>
              <Text>用于接收外部输入数据</Text>
            </div>
            <div>
              <Tag color="green">处理节点</Tag>
              <Text>用于数据处理和转换</Text>
            </div>
            <div>
              <Tag color="orange">AI节点</Tag>
              <Text>调用智谱AI进行创意生成</Text>
            </div>
            <div>
              <Tag color="purple">输出节点</Tag>
              <Text>用于输出处理结果</Text>
            </div>
          </Space>
        </div>
      ),
    },
    {
      key: '4',
      label: '如何保存和管理工作流？',
      children: (
        <div>
          <Paragraph>工作流会自动保存到本地存储，您也可以：</Paragraph>
          <Paragraph>• 手动点击保存按钮</Paragraph>
          <Paragraph>• 在设置中启用自动保存</Paragraph>
          <Paragraph>• 通过资产管理页面管理已保存的工作流</Paragraph>
        </div>
      ),
    },
  ];

  const shortcuts = [
    { key: 'Ctrl + S', desc: '保存工作流' },
    { key: 'Ctrl + N', desc: '新建工作流' },
    { key: 'Ctrl + R', desc: '运行工作流' },
    { key: 'Delete', desc: '删除选中节点' },
    { key: 'Ctrl + Z', desc: '撤销操作' },
    { key: 'Ctrl + Y', desc: '重做操作' },
  ];

  return (
    <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card
          title={
            <Space>
              <QuestionCircleOutlined />
              <Title level={3} style={{ margin: 0 }}>
                帮助中心
              </Title>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Paragraph>
            欢迎使用 AidCreater！这是一个基于节点连接的创意生成工具，
            帮助您通过可视化的方式构建和执行创意工作流。
          </Paragraph>
        </Card>

        <Card
          title={
            <Space>
              <BookOutlined />
              <Title level={4} style={{ margin: 0 }}>
                常见问题
              </Title>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Collapse items={faqItems} />
        </Card>

        <Card
          title={
            <Space>
              <ToolOutlined />
              <Title level={4} style={{ margin: 0 }}>
                快捷键
              </Title>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text code>{shortcut.key}</Text>
                <Text type="secondary">{shortcut.desc}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title={
            <Space>
              <BulbOutlined />
              <Title level={4} style={{ margin: 0 }}>
                使用技巧
              </Title>
            </Space>
          }
        >
          <Space direction="vertical" size="middle">
            <div>
              <Title level={5}>节点连接</Title>
              <Paragraph>
                拖拽节点的输出端口到另一个节点的输入端口来创建连接。
                确保数据类型匹配以避免执行错误。
              </Paragraph>
            </div>
            <div>
              <Title level={5}>参数配置</Title>
              <Paragraph>
                选中节点后，在右侧属性面板中配置节点参数。
                不同类型的节点有不同的配置选项。
              </Paragraph>
            </div>
            <div>
              <Title level={5}>调试工作流</Title>
              <Paragraph>
                运行工作流时，可以查看每个节点的执行状态和输出结果，
                帮助您快速定位问题。
              </Paragraph>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
