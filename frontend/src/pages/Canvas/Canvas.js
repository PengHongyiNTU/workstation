import React, { useEffect, useCallback} from 'react';
import { Layout, Spin, message, Breadcrumb, Card } from 'antd';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppSider from '../../components/Sider/Sider';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const { Content } = Layout;

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

const Canvas = () => {
  const { currentProject, projectContent, loading, error } = useProject();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { user } = useAuth();
  const navigate = useNavigate();


  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );


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
      <Breadcrumb style={{ margin: '16px 5px' }} items={breadcrumbItems} />
      <Content>
        <Card>
          <div>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
            />
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Canvas;