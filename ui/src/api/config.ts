import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { setUserData } from "../lib/user.localStorage";

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
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (d) => d,
  (err) => {
    if (err.status === 401) {
      setUserData({ name: "", email: "", isLoggedIn: false });
      window.location.pathname = "/login";
      return;
    }
    return err;
  },
);

export default api;
