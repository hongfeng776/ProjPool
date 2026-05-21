import { Layout as AntLayout, Menu, Button } from 'antd';
import { HomeOutlined, ProjectOutlined, BulbOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
      onClick: () => navigate('/projects'),
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BulbOutlined style={{ fontSize: 28, color: '#1677ff' }} />
          <span style={{ fontSize: 20, fontWeight: 600, color: '#1677ff' }}>
            装家宝
          </span>
          <span style={{ fontSize: 14, color: '#999' }}>室内装修预览系统</span>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ minWidth: 200, borderBottom: 'none' }}
        />
        <Button type="primary" icon={<BulbOutlined />}>
          新建项目
        </Button>
      </Header>
      <Content
        style={{
          padding: '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px - 70px)',
        }}
      >
        {children}
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          background: '#fff',
          color: '#999',
        }}
      >
        装家宝室内装修预览系统 ©{new Date().getFullYear()} Three.js + React + Node.js + PostgreSQL
      </Footer>
    </AntLayout>
  );
};
