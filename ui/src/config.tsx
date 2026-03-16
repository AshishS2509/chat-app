import { useEffect } from "react";
import api from "./api/config";
import { useAuth } from "./hooks/useAuth";

function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { updateAccessToken, refreshToken } = useAuth();

  useEffect(() => {
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

        return Promise.reject(error);
      },
    );
  }, [refreshToken, updateAccessToken]);

  return <>{children}</>;
}
export default ConfigProvider;
