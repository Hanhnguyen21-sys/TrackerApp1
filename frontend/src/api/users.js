import api from './axios';

export const searchUsers = async (query, token) => {
  const response = await api.get(`/users/search`, {
    params: { query },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
