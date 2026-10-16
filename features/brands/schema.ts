import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().trim().min(2, { error: "Brand name must be at least 2 characters." }).max(60, { error: "Brand name must be 60 characters or fewer." }),
  description: z.string().trim().max(300).optional(),
  status: z.enum(["active", "inactive"]),
});

export type BrandInput = z.infer<typeof brandSchema>;
