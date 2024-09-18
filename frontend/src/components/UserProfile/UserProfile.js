import React from 'react';
import { Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined, GithubOutlined, GoogleOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from './AuthContext';

const UserProfileMenu = () => {
  const { user, login, logout } = useAuth();

  const menu = (
    <Menu>
      {user ? (
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
          Logout
        </Menu.Item>
      ) : (
        <>
          <Menu.Item key="github" icon={<GithubOutlined />} onClick={() => login('github')}>
            Login with GitHub
          </Menu.Item>
          <Menu.Item key="google" icon={<GoogleOutlined />} onClick={() => login('google')}>
            Login with Google
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomRight" arrow>
      <span style={{ cursor: 'pointer' }}>
        <Avatar 
          icon={user ? null : <UserOutlined />} 
          src={user?.avatar_url} 
          alt="User Avatar"
        />
        <span style={{ marginLeft: 8 }}>
          {user ? user.name : 'Guest'}
        </span>
      </span>
    </Dropdown>
  );
};

export default UserProfileMenu;