import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../api/auth";

// use for authentication state management across the app

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // current logged in user
  const [token, setToken] = useState(localStorage.getItem("token") || ""); // JWT token for API requests
  const [loading, setLoading] = useState(true); // checking if user data is being loaded

  // save token and user data to localStorage and state
  const saveAuth = (token, user) => {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
  };

  // clear token and user data from localStorage and state
  const clearAuth = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    saveAuth(data.token, data.user);
    return data;
  };

  const login = async (formData) => {
    const data = await loginUser(formData);
    saveAuth(data.token, data.user);
    return data;
  };

  const logout = () => {
    clearAuth();
  };

  // retrieve user data on app load if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe(token);
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
