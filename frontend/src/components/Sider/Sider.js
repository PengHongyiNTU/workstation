import React, { useState, useCallback, useEffect, useRef } from "react";
import { Layout, Menu, theme } from "antd";
import styles from "./Sider.module.css";

const { Sider } = Layout;

const menuItems = [
  {
    key: "Canvas",
    label: "Canvas",
    icon: <span className="material-symbols-outlined">automation</span>,
  },
  {
    key: "Logs",
    label: "Logs",
    icon: <span className="material-symbols-outlined">terminal</span>,
    disabled: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: <span className="material-symbols-outlined">analytics</span>,
    disabled: true,
  },
];

const COLLAPSE_TIMEOUT = 500;

const AppSider = () => {
  const [collapsed, setCollapsed] = useState(false);
  const timerRef = useRef();
  const { token } = theme.useToken();

  const startCollapseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setCollapsed(true), COLLAPSE_TIMEOUT);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setCollapsed(false);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    startCollapseTimer();
  }, [startCollapseTimer]);

  const handleCollapse = useCallback((value) => {
    setCollapsed(value);
    if (!value) {
      startCollapseTimer();
    }
  }, [startCollapseTimer]);

  useEffect(() => {
    startCollapseTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startCollapseTimer]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorder}`,
      }}
      theme="light"
      className={styles.sider}
    >
      <Menu
        mode="inline"
        theme="light"
        defaultSelectedKeys={["Canvas"]}
        items={menuItems}
        className={styles.menu}
      />
    </Sider>
  );
};

export default AppSider;