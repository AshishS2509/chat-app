import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { AuthContext, useAuth } from "./hooks/useAuth";
import api from "./api/config";

type MessageHandler = (data: unknown) => void;

const Config = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const { accessToken, refreshToken, logout, updateAccessToken } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef<WebSocket | null>(null);
  const listeners = useRef<MessageHandler[]>([]);

  useEffect(() => {
    api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const res = await api.post("/refresh", {
            refreshToken,
          });
          const newAccessToken = res.data.token;
          updateAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      },
    );
  }, [accessToken, refreshToken, updateAccessToken]);

  useEffect(() => {
    const initAuth = async () => {
      if (!refreshToken) {
        if (location.pathname !== "/login") {
          navigate("/login");
        }
        return;
      }

      if (!accessToken) {
        try {
          const res = await api.post("/refresh", {
            refreshToken,
          });

          updateAccessToken(res.data.accessToken);

          if (location.pathname === "/login") {
            navigate("/");
          }
        } catch {
          logout();
          navigate("/login");
        }
        return;
      }

      if (location.pathname === "/login") {
        navigate("/");
      }
    };

    initAuth();
  }, [
    location.pathname,
    navigate,
    refreshToken,
    accessToken,
    updateAccessToken,
    logout,
  ]);

  useEffect(() => {
    if (!auth?.accessToken) return;

    const ws = new WebSocket(
      `ws://192.168.31.195:3000/wss?token=${auth.accessToken}`,
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Socket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      listeners.current.forEach((handler) => handler(data));
    };

    ws.onclose = () => {
      console.log("Socket closed");
    };

    return () => {
      ws.close();
    };
  }, [auth?.accessToken]);

  return (
    <AuthContext.Provider value={{ ...auth, socket: socketRef }}>
      {children}
    </AuthContext.Provider>
  );
};

export default Config;
