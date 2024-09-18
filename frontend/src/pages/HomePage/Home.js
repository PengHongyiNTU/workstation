import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, message, Spin, Typography, Space, Layout } from 'antd';
import { PlusOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';

const API_URL = 'http://localhost:5000';
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const { Title, Text } = Typography;
const { Content } = Layout;

const HomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { openProject, loading: projectLoading, error: projectError } = useProject();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [fetchingFiles, setFetchingFiles] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  useEffect(() => {
    if (projectError) {
      message.error(projectError);
    }
  }, [projectError]);

  const fetchFiles = async () => {
    setFetchingFiles(true);
    try {
      const response = await api.get('/api/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      message.error('Failed to fetch files');
    } finally {
      setFetchingFiles(false);
    }
  };

  const handleCreateFile = async () => {
    try {
      await api.post('api/files', 
        { file: new File([''], newFileName, { type: 'text/plain' }) },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      message.success('File created successfully');
      setIsModalVisible(false);
      setNewFileName('');
      await fetchFiles();
      await handleOpenProject(newFileName);
    } catch (error) {
      console.error('Error creating file:', error);
      message.error('Failed to create file');
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      await api.delete(`/api/files/${filename}`, { withCredentials: true });
      message.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('Failed to delete file');
    }
  };

  const handleOpenProject = async (filename) => {
    try {
      await openProject(filename);
      navigate('/workspace');
    } catch (error) {
      console.error('Error opening project:', error);
      message.error('Failed to open project');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const ProjectCard = ({ file }) => (
    <Card 
      className={styles.projectCard}
      actions={[
        <Button type="primary" onClick={() => handleOpenProject(file.name)}>Open</Button>,
        <Button icon={<DeleteOutlined />} onClick={() => handleDeleteFile(file.name)} danger />
      ]}
    >
      <div className={styles.cardContent}>
        <FileOutlined className={styles.fileIcon} />
        <div>
          <Title level={4}>{file.name}</Title>
          <Text type="secondary">Last modified: {formatDate(file.last_edit)}</Text>
        </div>
      </div>
    </Card>
  );

  const NewProjectCard = () => (
    <Card
      className={styles.newProjectCard}
      onClick={() => setIsModalVisible(true)}
    >
      <Space direction="vertical" align="center">
        <PlusOutlined className={styles.plusIcon} />
        <Title level={4}>Create New Project</Title>
      </Space>
    </Card>
  );

  if (authLoading) {
    return <Spin size="large" />;
  }

  if (!user) {
    return <div>Please log in to view your projects.</div>;
  }

  return (
    <Content>
      <div className={styles.homePage}>
        <Title className={styles.welcome}>Welcome, {user.user_name || 'User'}!</Title>
        {fetchingFiles || projectLoading ? (
          <Spin size="large" />
        ) : (
          <div className={styles.projectGrid}>
            <NewProjectCard />
            {files.map(file => (
              <ProjectCard key={file.name} file={file} />
            ))}
          </div>
        )}
        <Modal
          title="Create New Project"
          open={isModalVisible}
          onOk={handleCreateFile}
          onCancel={() => setIsModalVisible(false)}
        >
          <Input 
            placeholder="Enter project name" 
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
        </Modal>
      </div>
    </Content>
  );
};

export default HomePage;