import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, { error: "Category name must be at least 2 characters." }).max(60, { error: "Category name must be 60 characters or fewer." }),
  description: z.string().trim().max(300).optional(),
  status: z.enum(["active", "inactive"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;
