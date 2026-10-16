import { z } from "zod";
import { couponConditionTypes, discountTypes } from "@/types/onlineStore";

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, { error: "Coupon code must be at least 3 characters." })
      .max(20)
      .transform((v) => v.toUpperCase()),
    discountType: z.enum(discountTypes),
    discountValue: z.number({ error: "Discount is required." }).positive({ error: "Discount must be greater than 0." }),
    minimumOrder: z.number().min(0).optional(),
    maximumDiscount: z.number().min(0).optional(),
    usageLimit: z.number().min(1).optional(),
    perCustomerLimit: z.number().min(1).optional(),
    startDate: z.string().min(1, { error: "Start date is required." }),
    endDate: z.string().min(1, { error: "End date is required." }),
    onlineOnly: z.boolean(),
    allowPos: z.boolean(),
    conditions: z.array(z.enum(couponConditionTypes)),
  })
  .refine((data) => data.endDate >= data.startDate, {
    error: "End date must be on or after the start date.",
    path: ["endDate"],
  })
  .refine((data) => data.discountType !== "Percentage" || data.discountValue <= 100, {
    error: "Percentage discount cannot exceed 100.",
    path: ["discountValue"],
  });

export type CouponInput = z.infer<typeof couponSchema>;
