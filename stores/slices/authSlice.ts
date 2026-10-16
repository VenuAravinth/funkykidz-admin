import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loginUser, logoutUser, registerUser, requestPasswordReset, restoreSession } from "@/features/auth/api";
import type { AuthUser } from "@/types/auth";

export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

export interface AuthState {
  user: AuthUser | null;
  sessionChecked: boolean;
  status: AsyncStatus;
  error: string | null;
  resetStatus: AsyncStatus;
  resetError: string | null;
}

const initialState: AuthState = {
  user: null,
  sessionChecked: false,
  status: "idle",
  error: null,
  resetStatus: "idle",
  resetError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticated(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearResetError(state) {
      state.resetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.error = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        if ("user" in action.payload) state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Login failed.";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Registration failed.";
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.resetStatus = "loading";
        state.resetError = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.resetStatus = "succeeded";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.resetStatus = "failed";
        state.resetError = action.payload ?? "Request failed.";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.sessionChecked = true;
        if (action.payload) {
          state.user = action.payload;
          state.status = "succeeded";
        }
      });
  },
});

export const { authenticated, logout, clearAuthError, clearResetError } = authSlice.actions;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectSessionChecked = (state: { auth: AuthState }) => state.auth.sessionChecked;
export const selectIsAuthenticated = (state: { auth: AuthState }) => Boolean(state.auth.user);
export default authSlice.reducer;
