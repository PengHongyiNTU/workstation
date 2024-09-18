import React from "react";
import { Layout, Menu, Space } from "antd";
import styles from "./Header.module.css";
import GithubButton from "../GithubButton/GithubButton";
import UserProfile from "../UserProfile/UserProfile";



const { Header } = Layout;

const AppHeader = ({ currentProject }) => {
    const navItems = [
        {
            key: 'home',
            label: 'Home',
            icon: <span className="material-symbols-outlined">home</span>,
        },
        {
            key: 'canvas',
            label: 'Canvas',
            icon: <span className="material-symbols-outlined">automation</span>,
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
                <Space>
                <UserProfile />
                <GithubButton repo="modelscope/agentscope"/>
                </Space>
            </div>
        </Header>
    );
}

export default AppHeader;