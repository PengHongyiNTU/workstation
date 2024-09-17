import React, { useState, useEffect } from "react"
import { Button } from "antd"
import { GithubOutlined, StarOutlined } from "@ant-design/icons"
import styles from "./GithubButton.module.css"

const GithubButton = ({ repo }) => {
    const [starCount, setStarCount] = useState(null);

    useEffect(() => {
        const fetchStarCount = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/${repo}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch repository data');
                }
                const data = await response.json();
                setStarCount(data.stargazers_count);
            } catch (error) {
                console.error('Error fetching star count:', error);
                setStarCount('N/A');
            }
        };

        fetchStarCount();
    }, [repo]);

    return (
        <Button 
            className={styles.githubButton}
            icon={<GithubOutlined />} 
            href={`https://github.com/${repo}`} 
            target="_blank"
        >
            <span className={styles.divider} />
            <StarOutlined className={styles.starIcon} />
            <span className={styles.starCount}>
                {starCount !== null ? starCount : '...'}
            </span>
        </Button>
    );
};

export default GithubButton;