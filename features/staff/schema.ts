import { z } from "zod";

export const employmentStatuses = ["active", "on_leave", "inactive"] as const;

export const staffSchema = z.object({
  firstName: z.string().trim().min(2, { error: "First name must be at least 2 characters." }).max(50),
  lastName: z.string().trim().max(50).optional(),
  phone: z.string().trim().min(7, { error: "Enter a valid contact number." }).max(15),
  email: z.union([z.email({ error: "Enter a valid email address." }).trim().toLowerCase(), z.literal("")]).optional(),
  employeeId: z.string().trim().min(2, { error: "Employee ID is required." }).max(20),
  department: z.string().trim().max(60).optional(),
  designation: z.string().trim().max(60).optional(),
  joiningDate: z.string().trim().optional(),
  salary: z.number().min(0).optional(),
  employmentStatus: z.enum(employmentStatuses),
  address: z.string().trim().max(200).optional(),
  emergencyContact: z.string().trim().max(15).optional(),
});

export type StaffInput = z.infer<typeof staffSchema>;
