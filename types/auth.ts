export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
}

export interface AuthErrorBody {
  message: string;
  fieldErrors?: Partial<Record<string, string[]>>;
}

export type MfaStage = "setup" | "verify";

export type LoginResponse = { user: AuthUser } | { mfa: MfaStage; email: string };

export interface MfaQrSetup {
  qrCode: string;
  secret: string;
}
