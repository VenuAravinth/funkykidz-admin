import { z } from "zod";
import { customerPaymentTermsOptions } from "@/types/customer";

export const customerTypes = ["Retail", "Wholesale", "VIP", "Corporate"] as const;
export const customerGenders = ["Male", "Female", "Other"] as const;
export { customerPaymentTermsOptions };

export const customerSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Customer name must be at least 2 characters." }).max(80),
    phone: z.string().trim().min(7, { error: "Enter a valid contact number." }).max(15),
    email: z.union([z.email({ error: "Enter a valid email address." }).trim().toLowerCase(), z.literal("")]).optional(),
    dob: z.string().trim().optional(),
    gender: z.union([z.enum(customerGenders), z.literal("")]).optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(60).optional(),
    state: z.string().trim().max(60).optional(),
    pincode: z.string().trim().max(10).optional(),
    groupId: z.string().min(1, { error: "Select a customer group." }),
    customerType: z.enum(customerTypes, { error: "Select a customer type." }),
    allowCredit: z.boolean(),
    creditLimit: z.number().min(0),
    paymentTerms: z.enum(customerPaymentTermsOptions, { error: "Select payment terms." }),
    notes: z.string().trim().max(500).optional(),
    status: z.enum(["active", "inactive"]),
  })
  .refine((data) => !data.allowCredit || data.creditLimit > 0, {
    error: "Credit limit is required when credit is allowed.",
    path: ["creditLimit"],
  });

export type CustomerInput = z.infer<typeof customerSchema>;

export const customerGroupSchema = z.object({
  name: z.string().trim().min(2, { error: "Group name must be at least 2 characters." }).max(60),
  discountPercent: z.number({ error: "Discount is required." }).min(0).max(100),
  creditAllowed: z.boolean(),
  creditLimit: z.number().min(0),
  paymentTerms: z.enum(customerPaymentTermsOptions, { error: "Select payment terms." }),
});

export type CustomerGroupInput = z.infer<typeof customerGroupSchema>;
