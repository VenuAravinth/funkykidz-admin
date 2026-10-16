export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  username: string;
  email?: string;
  staffId?: string;
  roleId: string;
  status: UserStatus;
  isOnline: boolean;
  lastLoginAt?: string;
  lastPasswordResetAt?: string;
  createdDate: string;
}
