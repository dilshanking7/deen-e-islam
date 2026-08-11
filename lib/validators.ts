import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Full name is too short"),

    username: z.string().min(3),

    email: z.email(),

    password: z.string().min(8),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email(),

  password: z.string().min(8),
});