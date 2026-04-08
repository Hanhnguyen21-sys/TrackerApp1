// call all api related to projects here

import api from "./axios";

export const getMyProjects = async (token) => {
    const response = await api.get("/projects",{
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getProjectById = async (projectId, token) => {
    const response = await api.get(`/projects/${projectId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const createProject = async (formData,token) => {
    const response = await api.post("/projects", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateProject = async (projectId, formData, token) => {
    const response = await api.put(`/projects/${projectId}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteProject = async (projectId, token) => {
    const response = await api.delete(`/projects/${projectId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getProjectMembers = async (projectId, token) => {
    const response = await api.get(`/projects/${projectId}/members`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const addProjectMember = async (projectId, memberData, token) => {
    const response = await api.post(`/projects/${projectId}/members`, memberData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const removeProjectMember = async (projectId, memberId, token) => {
    const response = await api.delete(`/projects/${projectId}/members/${memberId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
