export type EmploymentStatus = "active" | "on_leave" | "inactive";

export interface Staff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  salary?: number;
  employmentStatus: EmploymentStatus;
  address?: string;
  emergencyContact?: string;
  hasLogin: boolean;
}

export function staffFullName(staff: Pick<Staff, "firstName" | "lastName">): string {
  return [staff.firstName, staff.lastName].filter(Boolean).join(" ");
}
