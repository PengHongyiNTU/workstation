import React, { useEffect} from 'react';
import { Layout, Spin, message, Breadcrumb, Card } from 'antd';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppSider from '../../components/Sider/Sider';
import FlowEditorWithProvider from '../../components/FlowEditor/FlowEditor';
import styles from './Workstation.module.css';

const { Content } = Layout;


const Workstation = () => {
  const { currentProject, loading, error } = useProject();
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
              <FlowEditorWithProvider />
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Workstation;