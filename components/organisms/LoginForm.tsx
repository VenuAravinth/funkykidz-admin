"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { useLogin } from "@/features/auth/hooks";
import { FormField } from "@/components/molecules/FormField";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import type { LoginResponse } from "@/types/auth";

export interface LoginFormProps {
  onSuccess: (result: LoginResponse) => void;
  notice?: string;
}

export function LoginForm({ onSuccess, notice }: LoginFormProps) {
  const { login, isLoading, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      onSuccess(await login(values).unwrap());
    } catch {
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {error ? <FormAlert variant="error">{error}</FormAlert> : notice && <FormAlert variant="success">{notice}</FormAlert>}

      <FormField id="email" label="Email address" size="lg" error={errors.email?.message} required>
        <Input id="email" type="email" inputSize="lg" autoComplete="email" placeholder="you@example.com" hasError={!!errors.email} {...register("email")} />
      </FormField>

      <FormField id="password" label="Password" size="lg" error={errors.password?.message} required>
        <PasswordInput id="password" inputSize="lg" autoComplete="current-password" placeholder="••••••••" hasError={!!errors.password} {...register("password")} />
      </FormField>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CheckboxField id="remember" label="Remember me" labelClassName="text-[15px] sm:text-base" {...register("remember")} />
        <Link href="/forgetpassword" className="text-[15px] font-medium text-champagne-600 hover:text-champagne-700 sm:text-base">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" isLoading={isLoading} fullWidth>
        Sign in
      </Button>
    </form>
  );
}
