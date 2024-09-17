import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (provider) => {
    try {
      const response = await api.get(`/auth/${provider}`);
      window.open(response.data.authUrl, 'OAuth', 'width=500,height=600');

      return new Promise((resolve, reject) => {
        window.addEventListener('message', async (event) => {
          if (event.data && event.data.user_id) {
            const userData = event.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            resolve(userData);
          } else if (event.data && event.data.error) {
            console.error('Login failed:', event.data.error);
            reject(new Error(event.data.error));
          }
        }, { once: true });
      });
    } catch (error) {
      console.error('Failed to initiate login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);