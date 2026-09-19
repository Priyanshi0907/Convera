import { createContext, useContext, useEffect, useState } from "react";
import { getMeApi, loginApi, logoutApi, registerApi } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("convera_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("convera_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMeApi()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("convera_user", JSON.stringify(userData));
        })
        .catch(() => {
          // If token invalid, clear
          localStorage.removeItem("convera_token");
          localStorage.removeItem("convera_user");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("convera_token", data.token);
    localStorage.setItem("convera_user", JSON.stringify(data.user));
    return data;
  };

  const register = async (email, password, fullName) => {
    const data = await registerApi(email, password, fullName);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("convera_token", data.token);
    localStorage.setItem("convera_user", JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore network errors on logout
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("convera_token");
    localStorage.removeItem("convera_user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("convera_user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
