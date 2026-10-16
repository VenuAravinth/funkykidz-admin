"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schema";
import { useForgotPassword } from "@/features/auth/hooks";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export function ForgotPasswordForm() {
  const { requestReset, isLoading, error, status } = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (status === "succeeded") {
    return (
      <FormAlert variant="success">
        If an account exists for that email, we&apos;ve sent a link to reset your password. Check your inbox.
      </FormAlert>
    );
  }

  const onSubmit = handleSubmit((values) => {
    requestReset(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {error && <FormAlert variant="error">{error}</FormAlert>}

      <FormField id="email" label="Email address" size="lg" error={errors.email?.message} required>
        <Input id="email" inputSize="lg" type="email" autoComplete="email" placeholder="you@example.com" hasError={!!errors.email} {...register("email")} />
      </FormField>

      <Button type="submit" size="lg" isLoading={isLoading} fullWidth>
        Send reset link
      </Button>
    </form>
  );
}
