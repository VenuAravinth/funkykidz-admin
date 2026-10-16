import axios, { type AxiosInstance } from "axios";

export const http: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
