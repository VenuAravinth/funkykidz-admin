"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { customerPaymentSchema, type CustomerPaymentInput } from "@/features/customer-payments/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { formatCurrency } from "@/lib/format";
import { invoiceBalance } from "@/lib/dummy-data/invoices";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectInvoices, recordPayment } from "@/stores/slices/invoicesSlice";
import { addPayment } from "@/stores/slices/customerPaymentsSlice";
import { PAYMENT_METHODS, type PaymentMethod, type PaymentSplitEntry } from "@/types/payment";

export function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(selectInvoices);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const prefillInvoiceId = searchParams.get("invoiceId") ?? "";
  const prefillInvoice = invoices.find((inv) => inv.id === prefillInvoiceId);

  const [invoiceId, setInvoiceId] = useState(prefillInvoiceId);
  const [customerName, setCustomerName] = useState(prefillInvoice?.customerName ?? "");
  const [method, setMethod] = useState<PaymentMethod | "Split">(PAYMENT_METHODS[0]);
  const [splitBreakdown, setSplitBreakdown] = useState<PaymentSplitEntry[]>([{ method: "Cash", amount: 0 }]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerPaymentInput>({
    resolver: zodResolver(customerPaymentSchema),
    defaultValues: {
      invoiceId: prefillInvoiceId || undefined,
      customerName: prefillInvoice?.customerName ?? "",
      amount: prefillInvoice ? invoiceBalance(prefillInvoice) : 0,
      type: "full",
      notes: "",
    },
  });

  const amount = watch("amount");
  const splitTotal = splitBreakdown.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      setCustomerName(inv.customerName);
      setValue("amount", invoiceBalance(inv));
    }
  };

  const onSubmit = handleSubmit((data) => {
    setSubmitError(null);
    if (!customerName.trim()) {
      setSubmitError("Enter a customer name.");
      return;
    }
    if (method === "Split" && splitTotal !== data.amount) {
      setSubmitError(`Split amounts (${formatCurrency(splitTotal)}) must add up to the payment amount (${formatCurrency(data.amount)}).`);
      return;
    }
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    try {
      const action = dispatch(
        addPayment({
          invoiceId: invoice?.id,
          invoiceNumber: invoice?.invoiceNumber ?? "—",
          customerName: customerName.trim(),
          method,
          splitBreakdown: method === "Split" ? splitBreakdown.filter((s) => s.amount > 0) : undefined,
          amount: data.amount,
          type: data.type,
          notes: data.notes,
        }),
      );
      if (invoice && data.type !== "credit") {
        dispatch(recordPayment({ id: invoice.id, amount: data.amount }));
      }
      router.push(`/sales/payments/${action.payload.id}`);
    } catch {
      setSubmitError("Something went wrong recording the payment. Please try again.");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {submitError && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {submitError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="invoiceId" label="Invoice">
          <Select id="invoiceId" value={invoiceId} onChange={(e) => handleInvoiceChange(e.target.value)}>
            <option value="">No invoice — advance / credit payment</option>
            {invoices
              .filter((inv) => invoiceBalance(inv) > 0)
              .map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.customerName} (outstanding {formatCurrency(invoiceBalance(inv))})
                </option>
              ))}
          </Select>
        </FormField>
        <FormField id="customerName" label="Customer" required>
          <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="amount" label="Amount" error={errors.amount?.message} required>
          <Input id="amount" type="number" min={1} step="0.01" hasError={!!errors.amount} {...register("amount", { valueAsNumber: true })} />
        </FormField>
        <FormField id="type" label="Type" error={errors.type?.message} required>
          <Select id="type" hasError={!!errors.type} {...register("type")}>
            <option value="full">Full payment</option>
            <option value="partial">Partial payment</option>
            <option value="credit">Credit</option>
          </Select>
        </FormField>
      </div>

      <FormField id="method" label="Method" required>
        <div className="flex flex-wrap gap-2">
          {[...PAYMENT_METHODS, "Split" as const].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={
                method === m
                  ? "rounded-full bg-champagne-500 px-4 py-2 text-sm font-medium text-white shadow-sm"
                  : "rounded-full border border-glass-border bg-white/50 px-4 py-2 text-sm text-ink-muted hover:text-ink"
              }
            >
              {m}
            </button>
          ))}
        </div>
      </FormField>

      {method === "Split" && (
        <div className="flex flex-col gap-3 rounded-xl border border-glass-border bg-white/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Split Breakdown</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSplitBreakdown((prev) => [...prev, { method: "Cash", amount: 0 }])}
            >
              <HiOutlinePlus className="h-4 w-4" />
              Add Method
            </Button>
          </div>
          {splitBreakdown.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={entry.method}
                onChange={(e) =>
                  setSplitBreakdown((prev) => prev.map((s, i) => (i === index ? { ...s, method: e.target.value as PaymentMethod } : s)))
                }
                className="flex-1"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                min={0}
                className="w-32"
                value={entry.amount || ""}
                onChange={(e) =>
                  setSplitBreakdown((prev) => prev.map((s, i) => (i === index ? { ...s, amount: Number(e.target.value) || 0 } : s)))
                }
              />
              <IconButton
                label="Remove"
                disabled={splitBreakdown.length === 1}
                onClick={() => setSplitBreakdown((prev) => prev.filter((_, i) => i !== index))}
                className="text-red-500 hover:bg-red-50"
              >
                <HiOutlineTrash className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
          <div className="flex justify-between border-t border-glass-border pt-2 text-sm">
            <span className="text-ink-muted">Split Total</span>
            <span className={splitTotal === amount ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>{formatCurrency(splitTotal)}</span>
          </div>
        </div>
      )}

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
          Record Payment
        </Button>
      </div>
    </form>
  );
}
