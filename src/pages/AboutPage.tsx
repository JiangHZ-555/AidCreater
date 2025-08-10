import React from 'react';
import { Card, Typography, Space, Divider, Tag, Button } from 'antd';
import {
  GithubOutlined,
  MailOutlined,
  HeartOutlined,
  RocketOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
  const techStack = [
    'React 18',
    'TypeScript',
    'Vite',
    'Ant Design',
    'React Flow',
    'Zustand',
    '智谱AI GLM-4',
  ];

  const features = [
    '可视化节点编辑器',
    '拖拽式工作流构建',
    '智谱AI集成',
    '本地数据存储',
    '实时执行监控',
    '多种节点类型',
    '响应式设计',
    '快捷键支持',
  ];

  return (
    <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Space direction="vertical" size="large">
            <div>
              <Title level={1} style={{ color: '#1890ff', margin: 0 }}>
                AidCreater
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                基于节点连接的创意生成工具
              </Text>
            </div>

            <div>
              <Tag color="blue">v1.0.0</Tag>
              <Tag color="green">开发中</Tag>
            </div>

            <Paragraph
              style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}
            >
              AidCreater
              是一个创新的可视化创意生成平台，通过直观的节点连接方式，
              让用户能够轻松构建复杂的创意工作流，并结合智谱AI的强大能力，
              实现高效的内容创作和数据处理。
            </Paragraph>
          </Space>
        </Card>

        <Card
          title={
            <Space>
              <RocketOutlined />
              <Title level={4} style={{ margin: 0 }}>
                核心特性
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
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  background: '#f5f5f5',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <Text>{feature}</Text>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title={
            <Title level={4} style={{ margin: 0 }}>
              技术栈
            </Title>
          }
          style={{ marginBottom: '24px' }}
        >
          <Space wrap>
            {techStack.map((tech, index) => (
              <Tag key={index} color="processing" style={{ margin: '4px' }}>
                {tech}
              </Tag>
            ))}
          </Space>
        </Card>

        <Card
          title={
            <Title level={4} style={{ margin: 0 }}>
              开发信息
            </Title>
          }
          style={{ marginBottom: '24px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>项目类型：</Text>
              <Text style={{ marginLeft: '8px' }}>开源创意工具</Text>
            </div>
            <div>
              <Text strong>开发框架：</Text>
              <Text style={{ marginLeft: '8px' }}>React + TypeScript</Text>
            </div>
            <div>
              <Text strong>AI服务：</Text>
              <Text style={{ marginLeft: '8px' }}>智谱AI GLM-4.5</Text>
            </div>
            <div>
              <Text strong>许可证：</Text>
              <Text style={{ marginLeft: '8px' }}>MIT License</Text>
            </div>
          </Space>
        </Card>

        <Card
          title={
            <Title level={4} style={{ margin: 0 }}>
              联系我们
            </Title>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Button
                type="link"
                icon={<GithubOutlined />}
                href="https://github.com/aidcreater/aidcreater"
                target="_blank"
                style={{ padding: 0 }}
              >
                GitHub 仓库
              </Button>
            </div>
            <div>
              <Button
                type="link"
                icon={<MailOutlined />}
                href="mailto:support@aidcreater.com"
                style={{ padding: 0 }}
              >
                技术支持
              </Button>
            </div>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Space>
                <HeartOutlined style={{ color: '#ff4d4f' }} />
                <Text type="secondary">
                  感谢您使用 AidCreater，让创意无限可能！
                </Text>
              </Space>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
