import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

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

export default api;
