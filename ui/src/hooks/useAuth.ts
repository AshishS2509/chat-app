import { useState } from "react";
import type { TUser } from "../types/auth.types";

const AUTH_STORAGE_KEY = "auth_data";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: TUser | null;
};

export const getStoredAuth = (): AuthState => {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, user: null };
  }

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return { accessToken: null, refreshToken: null, user: null };
  }

  return JSON.parse(stored);
};

const setStoredAuth = (data: AuthState) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
};

const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth());

  const login = (data: AuthState) => {
    setAuth(data);
    setStoredAuth(data);
  };

  const logout = () => {
    setAuth({
      accessToken: null,
      refreshToken: null,
      user: null,
    });

    clearStoredAuth();
  };

  const updateAccessToken = (accessToken: string) => {
    setAuth((prev) => {
      const updated = { ...prev, accessToken };
      setStoredAuth(updated);
      return updated;
    });
  };

  const updateRefreshToken = (refreshToken: string) => {
    setAuth((prev) => {
      const updated = { ...prev, refreshToken };
      setStoredAuth(updated);
      return updated;
    });
  };

  const updateUser = (user: TUser) => {
    setAuth((prev) => {
      const updated = { ...prev, user };
      setStoredAuth(updated);
      return updated;
    });
  };

  return {
    ...auth,
    login,
    logout,
    updateAccessToken,
    updateRefreshToken,
    updateUser,
  };
};
