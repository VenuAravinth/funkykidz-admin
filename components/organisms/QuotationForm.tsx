"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { quotationSchema, type QuotationInput } from "@/features/quotations/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { formatCurrency } from "@/lib/format";
import { topCustomers } from "@/lib/dummy-data/sales";
import { salespeople } from "@/lib/dummy-data/quotations";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addQuotation, updateQuotation } from "@/stores/slices/quotationsSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";
import type { Quotation } from "@/types/quotation";

function defaultValidUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function QuotationForm({ quotation }: { quotation?: Quotation }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const [submitError, setSubmitError] = useState(false);
  const isEditing = !!quotation;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema),
    defaultValues: quotation
      ? {
          customerName: quotation.customerName,
          salesperson: quotation.salesperson,
          validUntil: quotation.validUntil,
          discount: quotation.discount,
          tax: quotation.tax,
          notes: quotation.notes ?? "",
          items: quotation.items.map(({ product, quantity, unitPrice }) => ({ product, quantity, unitPrice })),
        }
      : {
          customerName: "",
          salesperson: authUser?.name ?? "",
          validUntil: defaultValidUntil(),
          discount: 0,
          tax: 0,
          notes: "",
          items: [{ product: "", quantity: 1, unitPrice: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discount = watch("discount") || 0;
  const tax = watch("tax") || 0;

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const discountAmount = subtotal * (discount / 100);
  const taxable = subtotal - discountAmount;
  const taxAmount = taxable * (tax / 100);
  const total = taxable + taxAmount;

  const onSubmit = handleSubmit((data) => {
    setSubmitError(false);
    try {
      if (isEditing) {
        dispatch(updateQuotation({ id: quotation.id, ...data }));
        router.push(`/sales/quotations/${quotation.id}`);
      } else {
        const action = dispatch(addQuotation(data));
        router.push(`/sales/quotations/${action.payload.id}`);
      }
    } catch {
      setSubmitError(true);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {submitError && (
        <p role="alert" className="text-sm font-medium text-red-500">
          Something went wrong saving the quotation. Please try again.
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

        <FormField id="salesperson" label="Salesperson" error={errors.salesperson?.message} required>
          <Input id="salesperson" list="salesperson-suggestions" placeholder="Salesperson name" hasError={!!errors.salesperson} {...register("salesperson")} />
          <datalist id="salesperson-suggestions">
            {salespeople.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </FormField>

        <FormField id="validUntil" label="Valid Until" error={errors.validUntil?.message} required>
          <Input id="validUntil" type="date" hasError={!!errors.validUntil} {...register("validUntil")} />
        </FormField>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Products</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ product: "", quantity: 1, unitPrice: 0 })}>
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
              <FormField id={`items.${index}.quantity`} label="Quantity" error={errors.items?.[index]?.quantity?.message}>
                <Input
                  id={`items.${index}.quantity`}
                  type="number"
                  min={1}
                  hasError={!!errors.items?.[index]?.quantity}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </FormField>
              <FormField id={`items.${index}.unitPrice`} label="Price" error={errors.items?.[index]?.unitPrice?.message}>
                <Input
                  id={`items.${index}.unitPrice`}
                  type="number"
                  min={0}
                  step="0.01"
                  hasError={!!errors.items?.[index]?.unitPrice}
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="discount" label="Discount (%)" error={errors.discount?.message} required>
          <Input id="discount" type="number" min={0} max={100} step="0.5" hasError={!!errors.discount} {...register("discount", { valueAsNumber: true })} />
        </FormField>
        <FormField id="tax" label="Tax (%)" error={errors.tax?.message} required>
          <Input id="tax" type="number" min={0} max={100} step="0.5" hasError={!!errors.tax} {...register("tax", { valueAsNumber: true })} />
        </FormField>
      </div>

      <FormField id="notes" label="Notes">
        <textarea
          id="notes"
          rows={3}
          placeholder="Optional notes for this quotation…"
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
            <p className="text-ink-muted">Discount ({discount}%)</p>
            <p className="font-semibold text-ink">-{formatCurrency(discountAmount)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Tax ({tax}%)</p>
            <p className="font-semibold text-ink">{formatCurrency(taxAmount)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Total</p>
            <p className="text-lg font-semibold text-champagne-700">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Save Changes" : "Save Quotation"}
        </Button>
      </div>
    </form>
  );
}
