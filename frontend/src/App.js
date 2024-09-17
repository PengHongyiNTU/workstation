// import React, { useState, useEffect } from 'react';
// import { Layout, ConfigProvider } from 'antd';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext'; // Update this path
// import AppHeader from './components/Header/Header';
// import AppFooter from './components/Footer';
// import AppSider from './components/Sider';
// import Canvas from './components/Canvas';
// import Home from './pages/HomePage/Home';
// import "./styles/global.css";

// const { Content } = Layout;

// const App = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const login = async (provider) => {
//     setLoading(true);
//     try {
//       // Example API call (replace with your actual API endpoint)
//       const response = await fetch(`/api/auth/${provider}`);
//       const userData = await response.json();
//       setUser(userData);
//     } catch (error) {
//       console.error('Login failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     setLoading(true);
//     try {
//       await fetch('/api/auth/logout');
//       setUser(null);
//     } catch (error) {
//       console.error('Logout failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch('/api/auth/check');
//         const userData = await response.json();
//         if (userData.user) {
//           setUser(userData.user);
//         }
//       } catch (error) {
//         console.error('Auth check failed:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   const [currentProject, setCurrentProject] = useState(null);

//   const createProject = async (projectName, projectDescription) => {
//     const newProject = {
//       id: Date.now(),
//       name: projectName,
//       description: projectDescription
//     };
//     return newProject;
//   };

//   return (
//     <ConfigProvider
//       theme={{
//         token: {
//           colorPrimary: '#54A258',
//         },
//       }}>
//       <AuthProvider value={{ user, login, logout}}>
//         <Router>
//           <Layout style={{ minHeight: '100vh' }}>
//             {/* <AppSider /> */}
//             <Layout>
//               <AppHeader currentProject={currentProject} />
//               <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/canvas" element={currentProject ? <Canvas project={currentProject} /> : <Navigate to="/" />} />
//               </Routes>
//               <Content>
//                 {/* <Canvas /> */}
//               </Content>
//               <AppFooter />
//             </Layout>
//           </Layout>
//         </Router>
//       </AuthProvider>
//     </ConfigProvider>
//   );
// };

// export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_URL = 'http://localhost:5000/api';

function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    fetchUserInfo();
    fetchFiles();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/info`);
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/files`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const loginGithub = () => {
    window.location.href = `${API_URL}/login/github`;
  };

  const loginGoogle = () => {
    window.location.href = `${API_URL}/login/google`;
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`);
      if (response.status === 200) {
        setUserInfo(null);
        setFiles([]);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log("Guest users cannot log out.");
      } else {
        console.error('Error logging out:', error);
      }
    }
    fetchUserInfo();
    fetchFiles();
  };

  const createFile = async () => {
    if (!newFileName) return;
    try {
      const formData = new FormData();
      formData.append('file', new Blob([''], { type: 'text/plain' }), newFileName);
      await axios.post(`${API_URL}/files`, formData);
      setNewFileName('');
      fetchFiles();
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const selectFile = async (filename) => {
    try {
      const response = await axios.get(`${API_URL}/files/${filename}`);
      setSelectedFile(filename);
      setFileContent(response.data.content);
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  const updateFile = async () => {
    if (!selectedFile) return;
    try {
      await axios.put(`${API_URL}/files/${selectedFile}`, { content: fileContent });
      fetchFiles();
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  const deleteFile = async () => {
    if (!selectedFile) return;
    try {
      await axios.delete(`${API_URL}/files/${selectedFile}`);
      setSelectedFile(null);
      setFileContent('');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>File Manager App</h1>
      
      <div>
        {userInfo ? (
          <div>
            <p>Logged in as: {userInfo.user_name} ({userInfo.user_type})</p>
            {userInfo.avatar_url && <img src={userInfo.avatar_url} alt="User Avatar" style={{ width: '50px', height: '50px' }} />}
            {userInfo.user_type !== 'guest' && <button onClick={logout}>Logout</button>}
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
        {userInfo && userInfo.user_type === 'guest' && (
          <div>
            <p>Upgrade your account:</p>
            <button onClick={loginGithub}>Login with GitHub</button>
            <button onClick={loginGoogle}>Login with Google</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="New file name"
        />
        <button onClick={createFile}>Create File</button>
      </div>

      <div style={{ display: 'flex', marginTop: '20px' }}>
        <div style={{ marginRight: '20px' }}>
          <h2>Files</h2>
          <ul>
            {files.map((file) => (
              <li key={file.name} onClick={() => selectFile(file.name)} style={{ cursor: 'pointer' }}>
                {file.name} (Last edited: {new Date(file.last_edit).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>

        {selectedFile && (
          <div>
            <h2>Edit File: {selectedFile}</h2>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              rows="10"
              cols="50"
            />
            <br />
            <button onClick={updateFile}>Save Changes</button>
            <button onClick={deleteFile}>Delete File</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;