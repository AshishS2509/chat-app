import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getStoredAuth } from "../hooks/useAuth";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
      refetchOnWindowFocus: false,
    },
    mutations: {
      gcTime: Infinity,
    },
  },
});

const api = axios.create({
  baseURL: "http://192.168.31.195:3000",
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getStoredAuth().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
