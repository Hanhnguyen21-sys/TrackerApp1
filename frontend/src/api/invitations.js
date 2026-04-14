import api from "./axios";

export const sendProjectInvitation = async (projectId, formData, token) => {
  const response = await api.post(`/invitations/${projectId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMyInvitations = async (token) => {
  const response = await api.get("/invitations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const acceptInvitation = async (invitationId, token) => {
  const response = await api.put(
    `/invitations/${invitationId}/accept`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const rejectInvitation = async (invitationId, token) => {
  const response = await api.put(
    `/invitations/${invitationId}/reject`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};