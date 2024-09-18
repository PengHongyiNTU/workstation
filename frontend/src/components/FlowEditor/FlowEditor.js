import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Dropdown , Input} from 'antd';
import { PlusOutlined, SaveOutlined, PlayCircleOutlined, HomeOutlined, StopOutlined, UserOutlined } from '@ant-design/icons';

// Node components (simplified for brevity)
const BaseNode = ({ data }) => (
  <div style={{
    padding: '10px',
    borderRadius: '3px',
    width: 150,
    fontSize: '12px',
    color: '#222',
    textAlign: 'center',
    border: '1px solid #1a192b',
    backgroundColor: 'white',
  }}>
    {data.icon}
    <div>{data.name}</div>
    <div>{data.job}</div>
    <Handle type="target" position={Position.Top} style={{background: '#555'}} />
    <Handle type="source" position={Position.Bottom} style={{background: '#555'}} />
  </div>
);

const InteractiveNode = ({ data, id }) => {
    const [fields, setFields] = useState(data.fields || [{ name: '', value: '' }]);
    const [handlers, setHandlers] = useState(data.handlers || []);
  
    const handleFieldChange = (index, key, value) => {
      const newFields = [...fields];
      newFields[index][key] = value;
      setFields(newFields);
      data.onFieldsChange(id, newFields);
    };
  
    const addHandler = () => {
      const newHandlers = [...handlers, { id: `handler-${handlers.length}` }];
      setHandlers(newHandlers);
      data.onHandlersChange(id, newHandlers);
    };
  
    return (
      <div style={{
        padding: '10px',
        borderRadius: '3px',
        width: 200,
        fontSize: '12px',
        color: '#222',
        textAlign: 'left',
        border: '1px solid #1a192b',
        backgroundColor: 'white',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{data.name}</div>
        {fields.map((field, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <Input
              placeholder="Field name"
              value={field.name}
              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              style={{ width: '45%', marginRight: '5%' }}
            />
            <Input
              placeholder="Value"
              value={field.value}
              onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
              style={{ width: '50%' }}
            />
          </div>
        ))}
        <Button onClick={() => setFields([...fields, { name: '', value: '' }])} style={{ marginTop: '5px' }}>
          Add Field
        </Button>
        <Button onClick={addHandler} style={{ marginTop: '5px', marginLeft: '5px' }}>
          Add Handler
        </Button>
        <Handle type="target" position={Position.Top} style={{background: '#555'}} />
        <Handle type="source" position={Position.Bottom} style={{background: '#555'}} />
        {handlers.map((handler, index) => (
          <Handle
            key={handler.id}
            type="source"
            position={Position.Right}
            id={handler.id}
            style={{top: `${25 + index * 20}%`, background: '#555'}}
          />
        ))}
      </div>
    );
  };
  
  // Update nodeTypes

const HomeNode = (props) => <BaseNode {...props} />;
const EndNode = (props) => <BaseNode {...props} />;
const CustomNode = (props) => <BaseNode {...props} />;

const nodeTypes = {
    homeNode: HomeNode,
    endNode: EndNode,
    customNode: CustomNode,
    interactiveNode: InteractiveNode,
  };

// NodePanel Component
const NodePanel = ({ node, onClose, onUpdate }) => {
  const [name, setName] = useState(node.data.name);
  const [job, setJob] = useState(node.data.job);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(node.id, { name, job });
    onClose();
  };

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '250px',
      padding: '15px',
      backgroundColor: 'white',
      boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
      zIndex: 10,
      overflow: 'auto',
    }}>
      <h3>Edit Node</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{width: '100%', marginBottom: '10px'}}
          />
        </div>
        <div>
          <label>Job:</label>
          <input
            type="text"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            style={{width: '100%', marginBottom: '10px'}}
          />
        </div>
        <div>
          <button type="submit" style={{marginRight: '5px'}}>Update</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

// FlowEditor component
const FlowEditor = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([
      { id: 'home', type: 'homeNode', data: { name: 'Home', job: 'Start', icon: <HomeOutlined /> }, position: { x: 250, y: 25 } },
      { id: 'end', type: 'endNode', data: { name: 'End', job: 'Finish', icon: <StopOutlined /> }, position: { x: 250, y: 250 } },
    ]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const flowRef = useRef(null);
    const panelRef = useRef(null);
  
    const onConnect = useCallback((params) => {
      setEdges((eds) => [
        ...eds,
        {
          ...params,
          id: `e${params.source}-${params.target}-${eds.length}`,
          animated: true,
          style: { stroke: '#1890ff' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff' },
        },
      ]);
    }, [setEdges]);
  
    const onNodeClick = useCallback((event, node) => {
      event.stopPropagation();
      setSelectedNode(node);
    }, []);
  
    const handleAddNode = (type) => {
      const newNode = {
        id: `node-${nodes.length + 1}`,
        type: type === 'Interactive' ? 'interactiveNode' : 'customNode',
        data: { 
          name: type, 
          job: 'New Node', 
          icon: <UserOutlined />,
          onFieldsChange: handleFieldsChange,
          onHandlersChange: handleHandlersChange,
        },
        position: { x: Math.random() * 300, y: Math.random() * 300 },
      };
      setNodes((nds) => [...nds, newNode]);
    };
  
    const handleFieldsChange = (nodeId, newFields) => {
      setNodes((nds) =>
        nds.map((node) => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, fields: newFields } } 
            : node
        )
      );
    };
  
    const handleHandlersChange = (nodeId, newHandlers) => {
      setNodes((nds) =>
        nds.map((node) => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, handlers: newHandlers } } 
            : node
        )
      );
    };
  
    const handleUpdateNode = (id, data) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...data } } : node))
      );
    };
  
    const handleSave = () => {
      console.log('Saving flow:', { nodes, edges });
    };
  
    const handleRun = () => {
      console.log('Running flow');
    };
  
    const addNodeMenu = (
      <Dropdown
        menu={{
          items: [
            { key: '1', label: 'Node1', onClick: () => handleAddNode('Node1') },
            { key: '2', label: 'Node2', onClick: () => handleAddNode('Node2') },
            { key: '3', label: 'Interactive', onClick: () => handleAddNode('Interactive') },
          ],
        }}
        trigger={['click']}
      >
        <Button icon={<PlusOutlined />}>Add Node</Button>
      </Dropdown>
    );
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (flowRef.current && flowRef.current.contains(event.target) && 
            (!panelRef.current || !panelRef.current.contains(event.target))) {
          setSelectedNode(null);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    return (
      <div style={{ width: '100%', height: '600px', position: 'relative' }} ref={flowRef}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: selectedNode ? '250px' : 0,
          bottom: 0,
          transition: 'right 0.3s ease-in-out',
        }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
  
        {selectedNode && (
          <div ref={panelRef}>
            <NodePanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={handleUpdateNode}
            />
          </div>
        )}
  
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20 }}>
          {addNodeMenu}
        </div>
  
        <div style={{ position: 'absolute', top: 10, right: selectedNode ? '260px' : '10px', zIndex: 20, transition: 'right 0.3s ease-in-out' }}>
          <Button icon={<SaveOutlined />} onClick={handleSave} style={{ marginRight: 8 }}>
            Save
          </Button>
          <Button icon={<PlayCircleOutlined />} onClick={handleRun}>
            Run
          </Button>
        </div>
      </div>
    );
  };
  
  export default FlowEditor;