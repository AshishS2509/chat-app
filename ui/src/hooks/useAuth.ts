import { createContext, useState, type RefObject } from "react";
import type { TUser } from "../types/auth.types";

const REFRESH_TOKEN_KEY = "refresh_token";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: TUser | null;
};

const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setStoredRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const clearStoredRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    accessToken: null,
    refreshToken: getStoredRefreshToken(),
    user: null,
  });

  const login = ({ accessToken, refreshToken, user }: AuthState) => {
    setAuth({
      accessToken,
      refreshToken,
      user,
    });

    if (refreshToken) {
      setStoredRefreshToken(refreshToken);
    }
  };

  const logout = () => {
    setAuth({
      accessToken: null,
      refreshToken: null,
      user: null,
    });

    clearStoredRefreshToken();
  };

  const updateAccessToken = (accessToken: string) => {
    setAuth((prev) => ({
      ...prev,
      accessToken,
    }));
  };

  const updateRefreshToken = (refreshToken: string) => {
    setAuth((prev) => ({
      ...prev,
      refreshToken,
    }));

    setStoredRefreshToken(refreshToken);
  };

  const updateUser = (user: TUser) => {
    setAuth((prev) => ({
      ...prev,
      user,
    }));
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

export const AuthContext = createContext<
  (ReturnType<typeof useAuth> & { socket: RefObject<WebSocket | null> }) | null
>(null);
