import React from "react";
import { Layout, Menu, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import GithubButton from "../GithubButton/GithubButton";
import UserProfile from "../UserProfile/UserProfile";
import { useProject } from "../../contexts/ProjectContext";

const { Header } = Layout;

const AppHeader = () => {
    const { currentProject } = useProject();
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavigation = (key) => {
        if (key === '/workspace' && !currentProject) {
            // Do nothing or show a message that a project needs to be opened first
            return;
        }
        navigate(key);
    };

    const navItems = [
        {
            key: '/',
            label: 'Home',
            icon: <span className="material-symbols-outlined">home</span>,
        },
        {
            key: '/workspace',
            label: 'Workspace',
            icon: <span className="material-symbols-outlined">desk</span>,
            disabled: !currentProject,
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
                selectedKeys={[location.pathname]}
                items={navItems}
                onClick={({ key }) => handleNavigation(key)}
                className={styles.menu}
            />

            <div className={styles.headerSpace}>
                <Space>
                    <UserProfile />
                    <GithubButton repo="modelscope/agentscope" />
                </Space>
            </div>
        </Header>
    );
}

export default AppHeader;