import api from "./axios";

 const getProjectActivity = async (projectId, token) => {
  const response = await api.get(`/projects/${projectId}/activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
export default getProjectActivity;