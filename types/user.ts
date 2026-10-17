export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  username: string;
  email: string;
  staffId?: string;
  roleId: string;
  status: UserStatus;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  lastPasswordResetAt?: string;
  createdAt: string;
}
