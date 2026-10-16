"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountSchema, type BankAccountInput } from "@/features/finance/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch } from "@/stores/hooks";
import { addBankAccount } from "@/stores/slices/financeSlice";

export function BankAccountForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankAccountInput>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: { name: "", bankName: "", accountNumber: "", ifsc: "", type: "current", openingBalance: 0 },
  });

  const onSubmit = handleSubmit((data) => {
    dispatch(
      addBankAccount({
        name: data.name,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifsc: data.ifsc || undefined,
        type: data.type,
        openingBalance: data.openingBalance,
      }),
    );
    router.push("/finance/bank-accounts");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FormField id="name" label="Account Name" error={errors.name?.message} required>
        <Input id="name" placeholder="e.g. HDFC Bank — Current A/c" hasError={!!errors.name} {...register("name")} />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="bankName" label="Bank Name" error={errors.bankName?.message} required>
          <Input id="bankName" hasError={!!errors.bankName} {...register("bankName")} />
        </FormField>
        <FormField id="type" label="Account Type">
          <Select id="type" {...register("type")}>
            <option value="current">Current</option>
            <option value="savings">Savings</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="accountNumber" label="Account Number" error={errors.accountNumber?.message} required>
          <Input id="accountNumber" hasError={!!errors.accountNumber} {...register("accountNumber")} />
        </FormField>
        <FormField id="ifsc" label="IFSC Code">
          <Input id="ifsc" {...register("ifsc")} />
        </FormField>
      </div>

      <FormField id="openingBalance" label="Opening Balance" error={errors.openingBalance?.message} required>
        <Input
          id="openingBalance"
          type="number"
          min={0}
          step="0.01"
          hasError={!!errors.openingBalance}
          {...register("openingBalance", { valueAsNumber: true })}
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Add Bank Account
        </Button>
      </div>
    </form>
  );
}
