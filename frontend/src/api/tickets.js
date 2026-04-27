import api from "./axios";

export const getTicketsByProject = async (projectId, token) => {
    const response = await api.get(`/projects/${projectId}/tickets`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const createTicket = async (projectId, formData, token) => {
    const response = await api.post(`/projects/${projectId}/tickets`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateTicket = async (ticketId, formData, token) => {
    const response = await api.put(`/tickets/${ticketId}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteTicket = async (ticketId, token) => {
    const response = await api.delete(`/tickets/${ticketId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getTicketsByColumn = async (columnId, token) => {
    const response = await api.get(`/columns/${columnId}/tickets`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const moveTicket = async (ticketId, formData, token) => {
    const response = await api.put(`/tickets/${ticketId}/move`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getTicketDetails = async (ticketId, token) => {
    const response = await api.get(`/tickets/${ticketId}/details`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const addTicketComment = async (ticketId, body, token) => {
    const response = await api.post(
        `/tickets/${ticketId}/comments`,
        { body },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );
    return response.data;
};