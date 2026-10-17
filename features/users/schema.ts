import { z } from "zod";

export const userStatuses = ["active", "inactive"] as const;

// Users sign in with their email, and sign-in codes are sent to it.
const emailField = z.email({ error: "Enter a valid email address." }).trim().toLowerCase();
const passwordField = z.string().min(8, { error: "Password must be at least 8 characters." }).max(72);

export const userCreateSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, { error: "Username must be at least 3 characters." })
      .max(30)
      .regex(/^[a-z0-9._]+$/i, { error: "Use letters, numbers, dots, or underscores only." }),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    staffId: z.string().optional(),
    roleId: z.string().min(1, { error: "Select a role." }),
    status: z.enum(userStatuses),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userEditSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { error: "Username must be at least 3 characters." })
    .max(30)
    .regex(/^[a-z0-9._]+$/i, { error: "Use letters, numbers, dots, or underscores only." }),
  email: emailField,
  staffId: z.string().optional(),
  roleId: z.string().min(1, { error: "Select a role." }),
  status: z.enum(userStatuses),
});

export type UserEditInput = z.infer<typeof userEditSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changeRoleSchema = z.object({
  roleId: z.string().min(1, { error: "Select a role." }),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
