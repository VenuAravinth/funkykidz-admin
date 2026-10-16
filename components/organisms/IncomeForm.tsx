"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema, type IncomeInput } from "@/features/finance/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { FINANCE_PAYMENT_METHODS, INCOME_CATEGORIES } from "@/types/finance";
import { useAppDispatch } from "@/stores/hooks";
import { addIncome } from "@/stores/slices/financeSlice";

export function IncomeForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      category: INCOME_CATEGORIES[0],
      source: "",
      reference: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      method: "Cash",
      status: "received",
    },
  });

  const onSubmit = handleSubmit((data) => {
    dispatch(
      addIncome({
        category: data.category,
        source: data.source,
        reference: data.reference || "—",
        amount: data.amount,
        date: data.date,
        method: data.method,
        status: data.status,
      }),
    );
    router.push("/finance/income");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="category" label="Category" error={errors.category?.message} required>
          <Select id="category" hasError={!!errors.category} {...register("category")}>
            {INCOME_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="source" label="Source" error={errors.source?.message} required>
          <Input id="source" placeholder="Customer or income source" hasError={!!errors.source} {...register("source")} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="reference" label="Reference">
          <Input id="reference" placeholder="Invoice / receipt number" {...register("reference")} />
        </FormField>
        <FormField id="amount" label="Amount" error={errors.amount?.message} required>
          <Input id="amount" type="number" min={1} step="0.01" hasError={!!errors.amount} {...register("amount", { valueAsNumber: true })} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="date" label="Date" error={errors.date?.message} required>
          <Input id="date" type="date" hasError={!!errors.date} {...register("date")} />
        </FormField>
        <FormField id="method" label="Method" error={errors.method?.message} required>
          <Select id="method" hasError={!!errors.method} {...register("method")}>
            {FINANCE_PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id="status" label="Status">
        <Select id="status" {...register("status")}>
          <option value="received">Received</option>
          <option value="pending">Pending</option>
        </Select>
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Income
        </Button>
      </div>
    </form>
  );
}
