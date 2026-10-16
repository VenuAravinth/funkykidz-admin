"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentMethods, recordPaymentSchema, type RecordPaymentInput } from "@/features/payments/schema";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import type { SupplierPayment } from "@/types/supplier";

export function RecordPaymentForm({ payment }: { payment: SupplierPayment }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const balance = payment.amount - payment.paidAmount;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: balance,
      method: "Bank Transfer",
      paidDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    setTimeout(() => router.push("/payments?status=history"), 900);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {submitted && (
        <FormAlert variant="success">Payment recorded successfully. (Demo only — changes aren&apos;t persisted.)</FormAlert>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="amount" label={`Amount (balance due: ${balance.toLocaleString("en-IN")})`} error={errors.amount?.message} required>
          <Input id="amount" type="number" min={0} step="0.01" hasError={!!errors.amount} {...register("amount", { valueAsNumber: true })} />
        </FormField>

        <FormField id="method" label="Payment method" error={errors.method?.message} required>
          <Select id="method" hasError={!!errors.method} {...register("method")}>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="paidDate" label="Payment date" error={errors.paidDate?.message} required>
          <Input id="paidDate" type="date" hasError={!!errors.paidDate} {...register("paidDate")} />
        </FormField>
      </div>

      <FormField id="notes" label="Notes">
        <textarea
          id="notes"
          rows={2}
          placeholder="Optional reference / transaction notes…"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("notes")}
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Record Payment
        </Button>
      </div>
    </form>
  );
}
