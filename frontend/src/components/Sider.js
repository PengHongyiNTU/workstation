import React, { useState, useCallback, useEffect, useRef} from "react";
import { Layout, Menu, theme} from "antd";

const { Sider } = Layout;

const menuItems = [
  {
    key: "explore",
    label: "Explore",
    icon: <span className="material-symbols-outlined">travel_explore</span>,
  },
  {
    key: "studio",
    label: "Studio",
    icon: <span className="material-symbols-outlined">automation</span>,
  },
  {
    key: "knowledge",
    label: "Knowledge",
    icon: <span className="material-symbols-outlined">psychology</span>,
  },
  {
    key: "tools",
    label: "Tools",
    icon: (
      <span className="material-symbols-outlined">home_repair_service</span>
    ),
  },
];

const COLAPSE_TIMEOUT = 500;

const AppSider = () => {
  const [collapsed, setCollapsed] = useState(false);
  const timerRef = useRef();
  const { token } = theme.useToken();

  const startCollapseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setCollapsed(true), COLAPSE_TIMEOUT);
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
      style={{ background: token.colorPrimary, 
                BorderRight: "1px solid #f0f0f0"
      }}
      theme="light"
    >
      <Menu
        mode="inline"
        theme="light"
        defaultSelectedKeys={["studio"]}
        items={menuItems}/>
    </Sider>
  );
};

export default AppSider;
