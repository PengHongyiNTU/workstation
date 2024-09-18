import React, { useEffect, useCallback} from 'react';
import { Layout, Spin, message, Breadcrumb, Card } from 'antd';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppSider from '../../components/Sider/Sider';
import FlowEditor from '../../components/FlowEditor/FlowEditor';
import styles from './Workstation.module.css';

const { Content } = Layout;


const Canvas = () => {
  const { currentProject, projectContent, loading, error } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log("currentProject", currentProject);

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
    <Layout className={styles.canvasLayout}>
      <AppSider />
      <Layout className={styles.contentLayout}>
        <Breadcrumb className={styles.breadcrumb} items={breadcrumbItems} />
        <Content className={styles.content}>
          <Card 
            title="Flow Editor" 
            className={styles.flowEditorCard}
            styles={{
              body: {
                flex: 1,
                padding: 0,
                height: 'calc(100% - 57px)', // Adjust for Card header height
              }
            }}
          >
            <div className={styles.flowEditorContainer}>
              <FlowEditor />
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Canvas;