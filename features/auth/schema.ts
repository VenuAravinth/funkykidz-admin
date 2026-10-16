import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
  remember: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }).max(80),
    email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
    password: z
      .string()
      .min(8, { error: "Must be at least 8 characters long." })
      .regex(/[a-z]/, { error: "Include at least one lowercase letter." })
      .regex(/[A-Z]/, { error: "Include at least one uppercase letter." })
      .regex(/[0-9]/, { error: "Include at least one number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const mfaEmailSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
});
export type MfaEmailInput = z.infer<typeof mfaEmailSchema>;

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Enter the 6-digit code." }),
});
export type MfaCodeInput = z.infer<typeof mfaCodeSchema>;
