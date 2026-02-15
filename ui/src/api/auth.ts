import api from "./api";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const response = await api.post<{ user: { name: string; email: string } }>(
      "/login",
      {
        email,
        password,
      },
    );

    return response.data.user;
  } catch (error) {
    alert(
      error instanceof Error ? error.message : "An error occurred during login",
    );
    return null;
  }
}

export async function register({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const response = await api.post<{ message: string }>("/register", {
      name,
      email,
      password,
    });
    return response.status;
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "An error occurred during registration",
    );
    return null;
  }
}

export async function logout() {
  try {
    await api.get("/logout");
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "An error occurred during logout",
    );
  }
}

export async function checkAuth() {
  try {
    const resp = await api.get<{ user: { name: string; email: string } }>(
      "/auth-check",
    );
    return resp.data.user;
  } catch {
    return null;
  }
}
