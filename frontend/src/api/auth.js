import api from "./axios";

// formData = { name, email, password }
// POST /api/auth/register
// BODY :
// {
//   "name": "John Doe",
//   "email": "john.doe@example.com",
//   "password": "password123"
// }
export const registerUser = async (formData) => {
    const response = await api.post("/auth/register", formData);
    // wait for backend to respond and return the data
    return response.data; // data from backend will be in response.data
}

// same thing for login
export const loginUser = async (formData) => {
    const response = await api.post("/auth/login", formData);
    return response.data;
}


// GET /api/auth/me
// include headers

export const getMe = async (token) => {
    const response = await api.get("/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
}
  