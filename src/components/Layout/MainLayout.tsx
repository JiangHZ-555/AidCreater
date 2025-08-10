import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Space, Tooltip } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../stores';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ui, setSidebarVisible } = useAppStore();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '工作台',
    },
    {
      key: '/assets',
      icon: <FolderOutlined />,
      label: '资产管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: '帮助',
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: '关于',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!ui.sidebarVisible);
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={!ui.sidebarVisible}
        width={200}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1890ff',
          }}
        >
          {ui.sidebarVisible ? 'AidCreater' : 'AC'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Tooltip title={ui.sidebarVisible ? '收起侧边栏' : '展开侧边栏'}>
              <Button
                type="text"
                icon={
                  ui.sidebarVisible ? (
                    <MenuFoldOutlined />
                  ) : (
                    <MenuUnfoldOutlined />
                  )
                }
                onClick={toggleSidebar}
              />
            </Tooltip>
            <span style={{ fontSize: '16px', fontWeight: 500 }}>
              {menuItems.find(item => item.key === location.pathname)?.label ||
                '工作台'}
            </span>
          </Space>

          <Space>{/* 这里可以添加用户信息、通知等 */}</Space>
        </Header>

        <Content
          style={{
            margin: 0,
            padding: 0,
            background: '#f5f5f5',
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
