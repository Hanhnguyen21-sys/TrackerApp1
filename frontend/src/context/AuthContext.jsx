import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginUser, registerUser } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });

  const [loading, setLoading] = useState(true);

  const saveAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);
    setUser(user);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

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

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe(token);

        const loadedUser = userData.user || userData;

        localStorage.setItem("user", JSON.stringify(loadedUser));
        setUser(loadedUser);
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
