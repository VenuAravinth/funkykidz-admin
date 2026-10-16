"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { invoiceSchema, type InvoiceInput } from "@/features/invoices/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { formatCurrency } from "@/lib/format";
import { topCustomers } from "@/lib/dummy-data/sales";
import { useAppDispatch } from "@/stores/hooks";
import { addInvoice, updateInvoice } from "@/stores/slices/invoicesSlice";
import type { Invoice } from "@/types/invoice";

export function InvoiceForm({ invoice }: { invoice?: Invoice }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [submitError, setSubmitError] = useState(false);
  const isEditing = !!invoice;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice
      ? {
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          discountAmount: invoice.discountAmount,
          gstPercent: invoice.gstPercent,
          paidAmount: invoice.paidAmount,
          notes: invoice.notes ?? "",
          items: invoice.items.map(({ product, quantity, rate }) => ({ product, quantity, rate })),
        }
      : {
          customerName: "",
          customerPhone: "",
          discountAmount: 0,
          gstPercent: 5,
          paidAmount: 0,
          notes: "",
          items: [{ product: "", quantity: 1, rate: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discountAmount = watch("discountAmount") || 0;
  const gstPercent = watch("gstPercent") || 0;

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const taxable = subtotal - discountAmount;
  const gstAmount = taxable * (gstPercent / 100);
  const grandTotal = taxable + gstAmount;

  const onSubmit = handleSubmit((data) => {
    setSubmitError(false);
    try {
      if (isEditing) {
        dispatch(updateInvoice({ id: invoice.id, ...data }));
        router.push(`/sales/invoices/${invoice.id}`);
      } else {
        const action = dispatch(addInvoice(data));
        router.push(`/sales/invoices/${action.payload.id}`);
      }
    } catch {
      setSubmitError(true);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {submitError && (
        <p role="alert" className="text-sm font-medium text-red-500">
          Something went wrong saving the invoice. Please try again.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="customerName" label="Customer" error={errors.customerName?.message} required>
          <Input id="customerName" list="customer-suggestions" placeholder="Customer or store name" hasError={!!errors.customerName} {...register("customerName")} />
          <datalist id="customer-suggestions">
            {topCustomers.map((c) => (
              <option key={c.name} value={c.name} />
            ))}
          </datalist>
        </FormField>

        <FormField id="customerPhone" label="Customer Phone" error={errors.customerPhone?.message} required>
          <Input id="customerPhone" type="tel" placeholder="9876543210" hasError={!!errors.customerPhone} {...register("customerPhone")} />
        </FormField>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Products</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ product: "", quantity: 1, rate: 0 })}>
            <HiOutlinePlus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {errors.items?.root?.message && <p className="mb-2 text-xs font-medium text-red-500">{errors.items.root.message}</p>}

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 items-start gap-3 rounded-xl border border-glass-border bg-white/40 p-4 sm:grid-cols-[2fr_1fr_1fr_auto]"
            >
              <FormField id={`items.${index}.product`} label="Product" error={errors.items?.[index]?.product?.message}>
                <Input
                  id={`items.${index}.product`}
                  placeholder="Product name"
                  hasError={!!errors.items?.[index]?.product}
                  {...register(`items.${index}.product`)}
                />
              </FormField>
              <FormField id={`items.${index}.quantity`} label="Qty" error={errors.items?.[index]?.quantity?.message}>
                <Input
                  id={`items.${index}.quantity`}
                  type="number"
                  min={1}
                  hasError={!!errors.items?.[index]?.quantity}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </FormField>
              <FormField id={`items.${index}.rate`} label="Rate" error={errors.items?.[index]?.rate?.message}>
                <Input
                  id={`items.${index}.rate`}
                  type="number"
                  min={0}
                  step="0.01"
                  hasError={!!errors.items?.[index]?.rate}
                  {...register(`items.${index}.rate`, { valueAsNumber: true })}
                />
              </FormField>
              <div className="flex h-11 items-end justify-end sm:pt-6">
                <IconButton
                  label="Remove product"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length === 1}
                  className="text-red-500 hover:bg-red-50"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FormField id="discountAmount" label="Discount (₹)" error={errors.discountAmount?.message} required>
          <Input id="discountAmount" type="number" min={0} step="1" hasError={!!errors.discountAmount} {...register("discountAmount", { valueAsNumber: true })} />
        </FormField>
        <FormField id="gstPercent" label="GST (%)" error={errors.gstPercent?.message} required>
          <Input id="gstPercent" type="number" min={0} max={100} step="0.5" hasError={!!errors.gstPercent} {...register("gstPercent", { valueAsNumber: true })} />
        </FormField>
        <FormField id="paidAmount" label="Paid Amount" error={errors.paidAmount?.message} required>
          <Input id="paidAmount" type="number" min={0} step="0.01" hasError={!!errors.paidAmount} {...register("paidAmount", { valueAsNumber: true })} />
        </FormField>
      </div>

      <FormField id="notes" label="Notes">
        <textarea
          id="notes"
          rows={3}
          placeholder="Optional notes for this invoice…"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("notes")}
        />
      </FormField>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-glass-border bg-white/50 px-5 py-4">
        <div className="flex flex-wrap gap-8 text-sm">
          <div>
            <p className="text-ink-muted">Subtotal</p>
            <p className="font-semibold text-ink">{formatCurrency(subtotal)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Discount</p>
            <p className="font-semibold text-ink">-{formatCurrency(discountAmount)}</p>
          </div>
          <div>
            <p className="text-ink-muted">GST ({gstPercent}%)</p>
            <p className="font-semibold text-ink">{formatCurrency(gstAmount)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Grand Total</p>
            <p className="text-lg font-semibold text-champagne-700">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Save Changes" : "Save Invoice"}
        </Button>
      </div>
    </form>
  );
}
