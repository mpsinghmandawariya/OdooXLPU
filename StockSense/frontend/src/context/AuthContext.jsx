import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../services/api";

const STORAGE_KEY = "stocksense_user";
const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = getStoredUser();
    const hasToken = Boolean(localStorage.getItem("stocksense_token"));

    return storedUser && hasToken ? storedUser : null;
  });

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("stocksense_token");
      const storedUser = getStoredUser();

      if (!token || !storedUser) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("stocksense_token");
        setUser(null);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const nextUser =
          response?.data?.data || response?.data?.user || storedUser;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("stocksense_token");
        setUser(null);
      }
    };

    restoreSession();
  }, []);

  const login = async (userData) => {
    const nextUser = {
      id: userData.id,
      loginId: userData.loginId,
      email: userData.email,
      role: userData.role,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("stocksense_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(
        user && localStorage.getItem("stocksense_token"),
      ),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default AuthContext;
