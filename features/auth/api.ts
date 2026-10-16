import { createAsyncThunk } from "@reduxjs/toolkit";
import { callApi, callApiGet } from "@/services/apiCaller";
import { AUTH_ENDPOINTS } from "@/services/endpoints";
import type { AuthUser, LoginResponse, MfaQrSetup } from "@/types/auth";
import type { LoginInput, RegisterInput, ForgotPasswordInput, MfaCodeInput, MfaEmailInput } from "./schema";

export const loginUser = createAsyncThunk<LoginResponse, LoginInput, { rejectValue: string }>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      return await callApi<LoginResponse>(
        AUTH_ENDPOINTS.folder,
        AUTH_ENDPOINTS.actions.login,
        credentials,
        "Invalid email or password.",
      );
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Invalid email or password.");
    }
  },
);

export const registerUser = createAsyncThunk<AuthUser, RegisterInput, { rejectValue: string }>(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { user } = await callApi<{ user: AuthUser }>(
        AUTH_ENDPOINTS.folder,
        AUTH_ENDPOINTS.actions.register,
        payload,
        "Could not create your account.",
      );
      return user;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Could not create your account.");
    }
  },
);

export const requestPasswordReset = createAsyncThunk<{ message: string }, ForgotPasswordInput, { rejectValue: string }>(
  "auth/requestPasswordReset",
  async (payload, { rejectWithValue }) => {
    try {
      return await callApi<{ message: string }>(
        AUTH_ENDPOINTS.folder,
        AUTH_ENDPOINTS.actions.forgotPassword,
        payload,
      );
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  },
);

export const restoreSession = createAsyncThunk<AuthUser | null>("auth/restoreSession", async () => {
  try {
    const { user } = await callApiGet<{ user: AuthUser }>(AUTH_ENDPOINTS.folder, AUTH_ENDPOINTS.actions.me);
    return user;
  } catch {
    return null;
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await callApi(AUTH_ENDPOINTS.folder, AUTH_ENDPOINTS.actions.logout).catch(() => undefined);
});

const { folder, actions } = AUTH_ENDPOINTS;

export const mfaApi = {
  setupSendOtp: (payload: MfaEmailInput) => callApi<{ message: string }>(folder, actions.mfaSetupSendOtp, payload),
  setupVerifyOtp: (payload: MfaCodeInput) => callApi<{ ok: true }>(folder, actions.mfaSetupVerifyOtp, payload),
  setupInit: () => callApi<MfaQrSetup>(folder, actions.mfaSetupInit),
  setupConfirm: (payload: MfaCodeInput) => callApi<{ user: AuthUser }>(folder, actions.mfaSetupConfirm, payload),
  verify: (payload: MfaCodeInput) => callApi<{ user: AuthUser }>(folder, actions.mfaVerify, payload),
  loginSendOtp: () => callApi<{ message: string }>(folder, actions.mfaLoginSendOtp),
  loginVerifyOtp: (payload: MfaCodeInput) => callApi<{ user: AuthUser }>(folder, actions.mfaLoginVerifyOtp, payload),
};
