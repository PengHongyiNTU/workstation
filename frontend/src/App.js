import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider } from 'antd';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Update this path
import AppHeader from './components/Header/Header';
import AppFooter from './components/Footer';
import AppSider from './components/Sider';
import Canvas from './components/Canvas';
import Home from './pages/HomePage/Home';
import "./styles/global.css";

const { Content } = Layout;

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (provider) => {
    setLoading(true);
    try {
      // Example API call (replace with your actual API endpoint)
      const response = await fetch(`/api/auth/${provider}`);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const userData = await response.json();
        if (userData.user) {
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const [currentProject, setCurrentProject] = useState(null);

  const createProject = async (projectName, projectDescription) => {
    const newProject = {
      id: Date.now(),
      name: projectName,
      description: projectDescription
    };
    return newProject;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#54A258',
        },
      }}>
      <AuthProvider value={{ user, login, logout}}>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            {/* <AppSider /> */}
            <Layout>
              <AppHeader currentProject={currentProject} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/canvas" element={currentProject ? <Canvas project={currentProject} /> : <Navigate to="/" />} />
              </Routes>
              <Content>
                {/* <Canvas /> */}
              </Content>
              <AppFooter />
            </Layout>
          </Layout>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;