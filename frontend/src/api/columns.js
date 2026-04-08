import api from "./axios";

export const getColumnsByProject = async (projectId, token) => {
    const response = await api.get(`/projects/${projectId}/columns`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const createColumn = async (projectId, columnData, token) => {
    const response = await api.post(`/projects/${projectId}/columns`, columnData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateColumn = async (columnId, columnData, token) => {
    const response = await api.put(`/columns/${columnId}`, columnData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteColumn = async (columnId, token) => {
    const response = await api.delete(`/columns/${columnId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};