import { useMutation } from "@tanstack/react-query";
import api from "../config";
import { useNavigate } from "react-router";
import type { TLogin, TRegisterUser, TUser } from "../../types/auth.types";
import { useAuth } from "../../hooks/useAuth";

///////////////////////////////// API calls /////////////////////////////////

async function registerUser({ name, email, password }: TRegisterUser) {
  const response = await api.post<{
    user: TUser;
    refresh: string;
    token: string;
  }>("/register", {
    name,
    email,
    password,
  });

  return response.data;
}

async function login({ email, password }: TLogin) {
  const response = await api.post<{
    user: TUser;
    refresh: string;
    token: string;
  }>("/login", {
    email,
    password,
  });

  return response.data;
}

////////////////////////////// Mutations /////////////////////////////

export const useRegisterMutation = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (
      data: { refresh: string; user: TUser; token: string } | null,
    ) => {
      if (data) {
        login({
          accessToken: data.token,
          refreshToken: data.refresh,
          user: { ...data.user, isLoggedIn: true },
        });
        navigate("/");
      }
    },
    onError: (e) => {
      alert(e instanceof Error ? e.message : "An error occurred during login");
      console.log(e);
    },
  });

  return { mutate, isPending };
};

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const { login: loginFn } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (
      data: { user: TUser; refresh: string; token: string } | null,
    ) => {
      if (data) {
        loginFn({
          accessToken: data.token,
          refreshToken: data.refresh,
          user: { ...data.user, isLoggedIn: true },
        });
        navigate("/");
      }
    },
    onError: (e) => {
      alert(e instanceof Error ? e.message : "An error occurred during login");
      console.log(e);
    },
  });
  return { mutate, isPending };
};
