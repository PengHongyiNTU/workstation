import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Update this path

const ProjectContext = createContext(null);
const API_URL = 'http://localhost:5000';
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const ProjectProvider = ({ children }) => {
    const { user } = useAuth();
    const [currentProject, setCurrentProject] = useState(null);
    const [projectContent, setProjectContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            closeProject();
        }
    }, [user]);

    const openProject = useCallback(async (projectName) => {
        if (!user) {
            setError('User must be logged in to open a project');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/files/${projectName}`);
            setCurrentProject(projectName);
            setProjectContent(response.data.content);
        } catch (error) {
            console.error('Error opening project:', error);
            setError('Failed to open project');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const closeProject = useCallback(() => {
        setCurrentProject(null);
        setProjectContent(null);
        setError(null);
    }, []);

    const saveProject = useCallback(async () => {
        if (!user) {
            setError('User must be logged in to save a project');
            return;
        }
        if (!currentProject || projectContent === null) {
            setError('No project is currently open');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await api.put(`/api/files/${currentProject}`, { content: projectContent });
        } catch (error) {
            console.error('Error saving project:', error);
            setError('Failed to save project');
            throw error; // Rethrow the error so the component can handle it
        } finally {
            setLoading(false);
        }
    }, [user, currentProject, projectContent]);

    const updateProjectContent = useCallback((newContent) => {
        setProjectContent(newContent);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        currentProject,
        projectContent,
        loading,
        error,
        openProject,
        closeProject,
        saveProject,
        updateProjectContent,
        clearError,
    };

    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};