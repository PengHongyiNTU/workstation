import React from 'react';
import { Dropdown, Avatar, Spin } from 'antd';
import { UserOutlined, GithubOutlined, GoogleOutlined, LogoutOutlined, LoadingOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
    );
  }

  const isGuest = user.user_type === 'guest';

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'github' || key === 'google') {
      login(key);
    }
  };

  const menuItems = [
    {
      key: 'user_info',
      label: (
        <div>
          <p><strong>Name:</strong> {user.user_name}</p>
          <p><strong>Type:</strong> {user.user_type}</p>
          <p><strong>ID:</strong> {user.user_id}</p>
        </div>
      ),
      
    },
    { type: 'divider' },
    ...(isGuest
      ? [
          {
            key: 'github',
            icon: <GithubOutlined />,
            label: 'Login with GitHub',
          },
          {
            key: 'google',
            icon: <GoogleOutlined />,
            label: 'Login with Google',
          },
        ]
      : [
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
          },
        ]
    ),
  ];

  const icon = user?.avatar_url ? (
    <Avatar src={user.avatar_url} />
  ) : (
    <Avatar icon={<UserOutlined />}  />
  );

  return (
    <Dropdown.Button
      menu={{ 
        items: menuItems,
        onClick: handleMenuClick
      }} 
      placement="bottomRight"
      icon={<DownOutlined />}
    >
        {icon}
    </Dropdown.Button>
  );
};

export default UserProfile;