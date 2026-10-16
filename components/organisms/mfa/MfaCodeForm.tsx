"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mfaCodeSchema, type MfaCodeInput } from "@/features/auth/schema";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export interface MfaCodeFormProps {
  id: string;
  label: string;
  submitLabel: string;
  onSubmit: (values: MfaCodeInput) => Promise<unknown>;
  notice?: string | null;
  children?: ReactNode;
}

export function MfaCodeForm({ id, label, submitLabel, onSubmit, notice, children }: MfaCodeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MfaCodeInput>({
    resolver: zodResolver(mfaCodeSchema),
    defaultValues: { code: "" },
  });

  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      reset();
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      {error ? <FormAlert variant="error">{error}</FormAlert> : notice && <FormAlert variant="success">{notice}</FormAlert>}

      <FormField id={id} label={label} size="lg" error={errors.code?.message} required>
        <Input
          id={id}
          inputSize="lg"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          autoFocus
          className="text-center text-xl! font-semibold tracking-[0.5em] sm:text-2xl!"
          hasError={!!errors.code}
          {...register("code")}
        />
      </FormField>

      <Button type="submit" size="lg" isLoading={isSubmitting} fullWidth>
        {submitLabel}
      </Button>

      {children}
    </form>
  );
}
