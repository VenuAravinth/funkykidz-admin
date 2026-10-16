import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(2, { error: "Role name must be at least 2 characters." }).max(60),
  description: z.string().trim().max(200).optional(),
});

export type RoleInput = z.infer<typeof roleSchema>;
