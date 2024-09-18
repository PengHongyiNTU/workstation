import React from "react";
import { Layout, Menu, Dropdown, Button, Avatar, Space } from "antd";
import { HomeOutlined, UserOutlined, GithubOutlined, GoogleOutlined, DownOutlined } from "@ant-design/icons";
import styles from "./Header.module.css";
import GithubButton from "../GithubButton/GithubButton";
import { useAuth } from "../../contexts/AuthContext";


const { Header } = Layout;

const AppHeader = ({ currentProject }) => {
    const { user, login, logout, loading } = useAuth();

    const navItems = [
        {
            key: 'home',
            icon: <HomeOutlined/>,
            label: 'Home',
        },
        {
            key: 'canvas',
            label: 'Canvas',
            icon: <span className="material-symbols-outlined">automation</span>,
        },
    ];
    
    const loginDropDown = [
        {
            key: 'github',
            icon: <GithubOutlined />,
            label: 'Login with Github',
            onClick: () => login('github'),
        },
        {
            key: 'google',
            icon: <GoogleOutlined />,
            label: 'Login with Google',
            onClick: () => login('google'),
        }
    ];

    const userMenu = [
        {
            key: 'logout',
            label: 'Logout',
            onClick: logout,
        },
    ];
    
    return (
        <Header className={styles.header}>
            <div className={styles.headerSpace}>
                <div className={styles.logo}>
                    <img src="/modelscope_logo.svg" alt="ModelScope" />
                </div>
            </div>

            <Menu 
                mode="horizontal" 
                defaultSelectedKeys={['home']}
                items={navItems}
                className={styles.menu}
            />

            <div className={styles.headerSpace}>
                <GithubButton repo="modelscope/agentscope"/>
                <Space size="small">
                   
                </Space>
            </div>
        </Header>
    );
}

export default AppHeader;