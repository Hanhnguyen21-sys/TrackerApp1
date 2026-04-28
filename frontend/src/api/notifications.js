import api from './axios';

export const getNotifications = async (token) => {
  const response = await api.get('/notifications', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const markNotificationRead = async (notificationId, token) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
