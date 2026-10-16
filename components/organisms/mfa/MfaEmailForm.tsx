"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mfaEmailSchema, type MfaEmailInput } from "@/features/auth/schema";
import { mfaApi } from "@/features/auth/api";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export interface MfaEmailFormProps {
  defaultEmail: string;
  onSent: (message: string) => void;
}

export function MfaEmailForm({ defaultEmail, onSent }: MfaEmailFormProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MfaEmailInput>({
    resolver: zodResolver(mfaEmailSchema),
    defaultValues: { email: defaultEmail },
  });

  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      onSent((await mfaApi.setupSendOtp(values)).message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the code.");
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      {error && <FormAlert variant="error">{error}</FormAlert>}

      <FormField id="mfa-email" label="Email address" size="lg" error={errors.email?.message} required>
        <Input id="mfa-email" type="email" inputSize="lg" autoComplete="email" placeholder="you@example.com" hasError={!!errors.email} {...register("email")} />
      </FormField>

      <Button type="submit" size="lg" isLoading={isSubmitting} fullWidth>
        Send verification code
      </Button>
    </form>
  );
}
