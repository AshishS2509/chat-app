import { z } from "zod";

/* ================= REGISTER ================= */
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export type TRegister = z.infer<typeof registerSchema>;

/* ================= LOGIN ================= */
export const loginSchema = z.object({
  email: z.email("Invalid email format").toLowerCase(),
  password: z.string().min(6, "Password is required"),
});

export type TLogin = z.infer<typeof loginSchema>;

/* ================= REFRESH ================= */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type TRefresh = z.infer<typeof refreshSchema>;
