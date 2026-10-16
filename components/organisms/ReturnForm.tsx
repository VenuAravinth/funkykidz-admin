"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { returnSchema, type ReturnInput } from "@/features/returns/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { formatCurrency } from "@/lib/format";
import { buildStockRows } from "@/lib/stockRows";
import { RETURN_REASONS } from "@/types/return";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import { selectInvoices } from "@/stores/slices/invoicesSlice";
import { addReturn } from "@/stores/slices/returnsSlice";

export function ReturnForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const invoices = useAppSelector(selectInvoices);
  const [submitError, setSubmitError] = useState(false);

  const rows = useMemo(() => buildStockRows(products), [products]);

  const prefillInvoiceId = searchParams.get("invoiceId") ?? "";
  const prefillInvoice = invoices.find((inv) => inv.id === prefillInvoiceId);

  const [invoiceId, setInvoiceId] = useState(prefillInvoiceId);
  const [customerName, setCustomerName] = useState(prefillInvoice?.customerName ?? "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReturnInput>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      invoiceId: prefillInvoiceId || undefined,
      rowKey: "",
      quantity: 1,
      amount: 0,
      reason: "Wrong size",
      notes: "",
    },
  });

  const rowKey = watch("rowKey");
  const quantity = watch("quantity");
  const amount = watch("amount");

  useEffect(() => {
    const row = rows.find((r) => r.key === rowKey);
    if (row) setValue("amount", row.price * (quantity || 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowKey]);

  const onSubmit = handleSubmit((data) => {
    setSubmitError(false);
    const row = rows.find((r) => r.key === data.rowKey);
    if (!row || !customerName.trim()) {
      setSubmitError(true);
      return;
    }
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    try {
      const action = dispatch(
        addReturn({
          invoiceId: invoice?.id,
          invoiceNumber: invoice?.invoiceNumber ?? "—",
          customerName: customerName.trim(),
          productId: row.productId,
          variantId: row.variantId,
          barcode: row.barcode,
          product: row.name,
          quantity: data.quantity,
          amount: data.amount,
          reason: data.reason,
          notes: data.notes,
        }),
      );
      router.push(`/sales/returns/${action.payload.id}`);
    } catch {
      setSubmitError(true);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {submitError && (
        <p role="alert" className="text-sm font-medium text-red-500">
          Select a product and enter a customer name before saving.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="invoiceId" label="Invoice">
          <Select
            id="invoiceId"
            value={invoiceId}
            onChange={(e) => {
              const id = e.target.value;
              setInvoiceId(id);
              const inv = invoices.find((i) => i.id === id);
              if (inv) setCustomerName(inv.customerName);
            }}
          >
            <option value="">No invoice — walk-in return</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} — {inv.customerName}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="customerName" label="Customer" required>
          <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
        </FormField>
      </div>

      <FormField id="rowKey" label="Product" error={errors.rowKey?.message} required>
        <Select id="rowKey" hasError={!!errors.rowKey} {...register("rowKey")}>
          <option value="">Select the returned product…</option>
          {rows.map((row) => (
            <option key={row.key} value={row.key}>
              {row.name} — {row.barcode} ({formatCurrency(row.price)})
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="quantity" label="Return Quantity" error={errors.quantity?.message} required>
          <Input id="quantity" type="number" min={1} hasError={!!errors.quantity} {...register("quantity", { valueAsNumber: true })} />
        </FormField>
        <FormField id="amount" label="Refund Amount" error={errors.amount?.message} required>
          <Input id="amount" type="number" min={0} step="0.01" hasError={!!errors.amount} {...register("amount", { valueAsNumber: true })} />
        </FormField>
      </div>

      <FormField id="reason" label="Reason" error={errors.reason?.message} required>
        <Select id="reason" hasError={!!errors.reason} {...register("reason")}>
          {RETURN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
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

      <div className="flex items-center justify-between rounded-xl border border-glass-border bg-white/50 px-5 py-4">
        <span className="text-sm font-medium text-ink-muted">Refund Amount</span>
        <span className="text-lg font-semibold text-champagne-700">{formatCurrency(amount || 0)}</span>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Request Return
        </Button>
      </div>
    </form>
  );
}
