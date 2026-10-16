"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/features/auth/schema";
import { useRegister } from "@/features/auth/hooks";
import { FormField } from "@/components/molecules/FormField";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading, error } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values).unwrap();
      router.push("/login?registered=1");
    } catch {
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {error && <FormAlert variant="error">{error}</FormAlert>}

      <FormField id="name" label="Full name" error={errors.name?.message} size="lg" required>
        <Input inputSize="lg" id="name" autoComplete="name" placeholder="Jane Doe" hasError={!!errors.name} {...register("name")} />
      </FormField>

      <FormField id="email" label="Email address" error={errors.email?.message} size="lg" required>
        <Input inputSize="lg" id="email" type="email" autoComplete="email" placeholder="you@example.com" hasError={!!errors.email} {...register("email")} />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message} size="lg" required>
        <PasswordInput inputSize="lg" id="password" autoComplete="new-password" placeholder="••••••••" hasError={!!errors.password} {...register("password")} />
      </FormField>

      <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message} size="lg" required>
        <PasswordInput
          id="confirmPassword"
          inputSize="lg"
          autoComplete="new-password"
          placeholder="••••••••"
          hasError={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </FormField>

      <Button type="submit" size="lg" isLoading={isLoading} fullWidth>
        Create account
      </Button>
    </form>
  );
}
