import React from "react";
import { Layout, Typography, Space, theme } from "antd";
import { DingtalkOutlined, DiscordOutlined } from "@ant-design/icons";

const { Footer } = Layout;
const { Title, Paragraph } = Typography;

const AppFooter = () => {
    const { token } = theme.useToken();
    return (
        <Footer style={{
            background: "trasparent",
           textAlign: "center",
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Title level={3} style={{ color: token.colorPrimary }}>
                    Join the community
                </Title>
                <Space size="large" align="center">
                    <Paragraph style={{ margin: 0, flex: 1 }}>
                        Discuss with team members, contributors and developers on different
                        channels.
                    </Paragraph>
                    <a
                        href="https://discord.com/invite/eYMpfnkG8h"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <DiscordOutlined
                            style={{ fontSize: "24px", color: token.colorPrimary }}
                        />
                    </a>
                    <a
                        href="https://www.dingtalk.com/download?action=joingroup&code=v1,k1,eENWB2Lr4ic2vWjKDsjvI65YxceIsyuDcbfrNF+5+YA=&_dt_no_comment=1&origin=1"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <DingtalkOutlined
                            style={{ fontSize: "24px", color: token.colorPrimary }}
                        />
                    </a>
                </Space>
            </div>
        </Footer>
    );
};

export default AppFooter;
