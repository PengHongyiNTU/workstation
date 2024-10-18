

import React, { useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Button } from 'antd';
import { ExpandAltOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './BaseNode.module.css';

const NodeView = ({ data, isExpanded, onExpand, onClose }) => (
    <div className={styles.baseNode}>
        {data.icon}
        <div className={styles.nodeContent}>{data.name}</div>
        <div className={styles.nodeContent}>{data.job}</div>
        {isExpanded ? (
            <button className={styles.closeButton} onClick={onClose}>
                <CloseOutlined />
            </button>
        ) : (
            <button className={styles.expandButton} onClick={onExpand}>
                <ExpandAltOutlined />
            </button>
        )}
        <Handle type="target" position={Position.Top} className={styles.handle} />
        <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
);

const PanelView = ({ data, onChange, onMouseLeave }) => {
    const [name, setName] = useState(data.name);
    const [job, setJob] = useState(data.job);

    const handleSubmit = useCallback(() => {
        onChange({ name, job });
    }, [name, job, onChange]);

    return (
        <div className={styles.panelView} onMouseLeave={onMouseLeave}>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className={styles.inputField}
            />
            <input
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Job"
                className={styles.inputField}
            />
            <Button onClick={handleSubmit} type="primary" size="small" className={styles.saveButton}>
                Save
            </Button>
        </div>
    );
};

const BaseNode = ({ id, data, isConnectable }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [nodeData, setNodeData] = useState(data);
    const timeoutRef = useRef(null);

    const handleExpand = useCallback(() => {
        setIsExpanded(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsExpanded(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            setIsExpanded(false);
        }, 300);
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    const handleChange = useCallback((newData) => {
        setNodeData((prevData) => ({ ...prevData, ...newData }));
        data.onChange(id, newData);
    }, [id, data]);

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <NodeView
                data={nodeData}
                isExpanded={isExpanded}
                onExpand={handleExpand}
                onClose={handleClose}
            />
            {isExpanded && (
                <PanelView
                    data={nodeData}
                    onChange={handleChange}
                    onMouseLeave={handleMouseLeave}
                />
            )}
        </div>
    );
    
};

export default BaseNode;