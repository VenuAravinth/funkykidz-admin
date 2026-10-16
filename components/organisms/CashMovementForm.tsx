"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cashMovementSchema, type CashMovementInput } from "@/features/finance/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addCashMovement, selectBankAccounts } from "@/stores/slices/financeSlice";
import type { CashMovementDirection } from "@/types/finance";

export function CashMovementForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bankAccounts = useAppSelector(selectBankAccounts);
  const [direction, setDirection] = useState<CashMovementDirection>("deposit");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CashMovementInput>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: {
      direction: "deposit",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      bankAccountId: bankAccounts[0]?.id ?? "",
      notes: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    dispatch(
      addCashMovement({
        direction: data.direction,
        amount: data.amount,
        date: data.date,
        bankAccountId: data.bankAccountId,
        notes: data.notes || undefined,
      }),
    );
    router.push("/finance/cash");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FormField id="direction" label="Movement" required>
        <div className="flex gap-2">
          {(["deposit", "withdraw"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDirection(d);
                setValue("direction", d);
              }}
              className={
                direction === d
                  ? "rounded-full bg-champagne-500 px-4 py-2 text-sm font-medium text-white shadow-sm"
                  : "rounded-full border border-glass-border bg-white/50 px-4 py-2 text-sm text-ink-muted hover:text-ink"
              }
            >
              {d === "deposit" ? "Deposit to Bank" : "Withdraw from Bank"}
            </button>
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="amount" label="Amount" error={errors.amount?.message} required>
          <Input id="amount" type="number" min={1} step="0.01" hasError={!!errors.amount} {...register("amount", { valueAsNumber: true })} />
        </FormField>
        <FormField id="date" label="Date" error={errors.date?.message} required>
          <Input id="date" type="date" hasError={!!errors.date} {...register("date")} />
        </FormField>
      </div>

      <FormField id="bankAccountId" label="Bank Account" error={errors.bankAccountId?.message} required>
        <Select id="bankAccountId" hasError={!!errors.bankAccountId} {...register("bankAccountId")}>
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="notes" label="Notes">
        <textarea
          id="notes"
          rows={3}
          placeholder="Optional notes…"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("notes")}
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Record Movement
        </Button>
      </div>
    </form>
  );
}
