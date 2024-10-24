import React from 'react';
import { useAuth } from './contexts/AuthContext'; // Update this path

export const AuthTest = () => {
    const { user, login, logout } = useAuth();
  
    const handleLogin = async (provider) => {
      try {
        await login(provider);
        console.log('Login successful');
      } catch (error) {
        console.error('Login failed:', error);
      }
    };
  
    return (
      <div>
        <h2>Auth Test</h2>
        {user ? (
          <div>
            <p>Welcome, {user.username}!</p>
            <img src={user.avatar_url} alt="User Avatar" style={{ width: 50, height: 50, borderRadius: '50%' }} />
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => handleLogin('github')}>Login with GitHub</button>
            <button onClick={() => handleLogin('google')}>Login with Google</button>
          </div>
        )}
      </div>
    );
  };
  