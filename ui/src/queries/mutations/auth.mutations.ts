import { useMutation } from "@tanstack/react-query";
import api from "../config";
import { useNavigate } from "react-router";
import type { TUser } from "../../types/auth.types";
import { clearUserData, setUserData } from "../../lib/user.localStorage";

///////////////////////////////// API calls /////////////////////////////////
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const response = await api.post<{ user: TUser }>("/login", {
      email,
      password,
    });

    return response.data.user;
  } catch (error) {
    alert(
      error instanceof Error ? error.message : "An error occurred during login",
    );
    return null;
  }
}

export async function logout() {
  try {
    await api.post("/logout");
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "An error occurred during logout",
    );
  }
}

////////////////////////////// Mutations /////////////////////////////

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data: TUser | null) => {
      if (data) {
        setUserData({ ...data, isLoggedIn: true });
        navigate("/");
      }
    },
    onError: (e) => {
      console.log(e);
    },
  });
  return { mutate, isPending };
};

export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      navigate("/login");
      clearUserData();
    },
    onError: (e) => {
      console.log(e);
    },
  });
  return { mutate, isPending };
};
