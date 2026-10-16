import { z } from "zod";

export const supplierCategories = ["Fabric", "Trims", "Packaging", "Printing", "Logistics"] as const;

export const supplierSchema = z.object({
  name: z.string().trim().min(2, { error: "Supplier name must be at least 2 characters." }).max(120),
  contactPerson: z.string().trim().min(2, { error: "Contact person is required." }).max(80),
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase(),
  phone: z.string().trim().min(7, { error: "Enter a valid phone number." }).max(20),
  category: z.enum(supplierCategories, { error: "Select a category." }),
  gstNumber: z.string().trim().min(4, { error: "GST number is required." }).max(20),
  city: z.string().trim().min(2, { error: "City is required." }),
  state: z.string().trim().min(2, { error: "State is required." }),
  country: z.string().trim().min(2, { error: "Country is required." }),
  paymentTerms: z.string().trim().min(2, { error: "Payment terms are required." }),
  status: z.enum(["active", "inactive"]),
  notes: z.string().trim().max(500).optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
