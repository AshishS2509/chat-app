import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Infinity,
    },
    mutations: {
      gcTime: Infinity,
    },
  },
});

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export default api;
