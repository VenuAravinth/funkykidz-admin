import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { loginUser, registerUser, requestPasswordReset } from "./api";
import type { LoginInput, RegisterInput, ForgotPasswordInput } from "./schema";

export function useLogin() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const login = useCallback((values: LoginInput) => dispatch(loginUser(values)), [dispatch]);
  return { login, status, error, isLoading: status === "loading" };
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const register = useCallback((values: RegisterInput) => dispatch(registerUser(values)), [dispatch]);
  return { register, status, error, isLoading: status === "loading" };
}

export function useForgotPassword() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.resetStatus);
  const error = useAppSelector((state) => state.auth.resetError);
  const requestReset = useCallback((values: ForgotPasswordInput) => dispatch(requestPasswordReset(values)), [dispatch]);
  return { requestReset, status, error, isLoading: status === "loading" };
}
