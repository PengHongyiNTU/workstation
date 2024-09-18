import React from 'react';
import { Layout, ConfigProvider, App as AntApp } from 'antd';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import AppHeader from './components/Header/Header';
import AppFooter from './components/Footer/Footer';
import Canvas from './pages/Canvas/Canvas';
import Home from './pages/HomePage/Home';

import "./styles/global.css";

const { Content } = Layout;

const AppRoutes = () => {
  const { currentProject } = useProject();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/workspace"
        element={currentProject ? <Canvas project={currentProject} /> : <Navigate to="/" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};


const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#54A258',
        },
      }}>
      <AntApp>
        <AuthProvider>
          <ProjectProvider>
            <Router>
              <Layout style={{ height: '100vh' }}>
                <AppHeader />
                <Layout>
                  <Content>
                    <AppRoutes />
                  </Content>
                </Layout>
                <AppFooter />
              </Layout>
            </Router>
          </ProjectProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;

