import React, { useEffect } from 'react';
import { Layout, Typography, Spin, message, Breadcrumb, Card } from 'antd';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppSider from '../../components/Sider/Sider';
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

const Canvas = () => {
  const { currentProject, projectContent, loading, error } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentProject) {
      navigate('/');
    }
  }, [currentProject, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!currentProject || !projectContent) {
    return null;
  }

  const breadcrumbItems = [{
    title: user?.user_name || 'User'
  },
  { title: currentProject }]

  return (
    <Layout >
      <AppSider />
      <Layout>
        <Breadcrumb style={{ margin: '16px 5px' }} items={breadcrumbItems} />
        <Content>
          <Title level={2}>{currentProject}</Title>
          <Card style={{ width: '100%', height: 400, marginBottom: 24 }}>
            <div style={{ width: '100%', height: '100%' }}>
              <ReactFlow nodes={initialNodes} edges={initialEdges} />
            </div>
          </Card>
          <Card>
            <Paragraph>{projectContent}</Paragraph>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Canvas;