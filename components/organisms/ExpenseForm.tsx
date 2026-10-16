"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseInput } from "@/features/finance/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { EXPENSE_CATEGORIES, FINANCE_PAYMENT_METHODS } from "@/types/finance";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addExpense, selectBankAccounts } from "@/stores/slices/financeSlice";

export function ExpenseForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bankAccounts = useAppSelector(selectBankAccounts);
  const [attachmentName, setAttachmentName] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: EXPENSE_CATEGORIES[0],
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      method: "Bank",
      paidFrom: "Cash",
      description: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    dispatch(
      addExpense({
        category: data.category,
        amount: data.amount,
        date: data.date,
        method: data.method,
        paidFrom: data.paidFrom,
        description: data.description || undefined,
        attachmentName,
        status: "paid",
      }),
    );
    router.push("/finance/expenses");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="category" label="Category" error={errors.category?.message} required>
          <Select id="category" hasError={!!errors.category} {...register("category")}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="amount" label="Amount" error={errors.amount?.message} required>
          <Input id="amount" type="number" min={1} step="0.01" hasError={!!errors.amount} {...register("amount", { valueAsNumber: true })} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="date" label="Date" error={errors.date?.message} required>
          <Input id="date" type="date" hasError={!!errors.date} {...register("date")} />
        </FormField>
        <FormField id="method" label="Payment Method" error={errors.method?.message}>
          <Select id="method" hasError={!!errors.method} {...register("method")}>
            {FINANCE_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id="paidFrom" label="Paid From" error={errors.paidFrom?.message}>
        <Select id="paidFrom" hasError={!!errors.paidFrom} {...register("paidFrom")}>
          <option value="Cash">Cash</option>
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="description" label="Description">
        <textarea
          id="description"
          rows={3}
          placeholder="What was this expense for?"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("description")}
        />
      </FormField>

      <FormField id="attachment" label="Attachment">
        <input
          id="attachment"
          type="file"
          onChange={(e) => setAttachmentName(e.target.files?.[0]?.name)}
          className="w-full text-sm text-ink-muted file:mr-4 file:rounded-full file:border-0 file:bg-champagne-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:brightness-105"
        />
        {attachmentName && <p className="text-xs text-ink-muted">{attachmentName}</p>}
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Expense
        </Button>
      </div>
    </form>
  );
}
