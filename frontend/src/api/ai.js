import api from "./axios";

export const generateProjectAI = async (projectName, token) => {
  

  const response = await api.post(
    "/ai/generate-project",
    { name: projectName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    }
  );

  

  return response.data;
};