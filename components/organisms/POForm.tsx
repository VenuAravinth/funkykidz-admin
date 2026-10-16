"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/features/purchase-orders/schema";
import { FormField } from "@/components/molecules/FormField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { formatCurrency } from "@/lib/format";
import { suppliers } from "@/lib/dummy-data/suppliers";

export function POForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const prefillBarcode = searchParams.get("barcode");
  const prefillFromLowStock = !!prefillBarcode;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseOrderInput>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: searchParams.get("supplierId") ?? "",
      expectedDeliveryDate: "",
      tax: 12,
      notes: "",
      items: prefillFromLowStock
        ? [
            {
              description: searchParams.get("description") ?? "",
              barcode: prefillBarcode,
              quantity: Number(searchParams.get("qty")) || 1,
              unitPrice: Number(searchParams.get("price")) || 0,
            },
          ]
        : [{ description: "", barcode: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const tax = watch("tax") || 0;
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const total = subtotal * (1 + tax / 100);

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    setTimeout(() => router.push("/purchase-orders?status=pending"), 900);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {submitted && (
        <FormAlert variant="success">
          Purchase order created successfully. (Demo only — changes aren&apos;t persisted.)
        </FormAlert>
      )}

      {!submitted && prefillFromLowStock && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
          Prefilled from a Low Stock suggestion — review the supplier and quantity, then confirm.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="supplierId" label="Supplier" error={errors.supplierId?.message} required>
          <Select id="supplierId" hasError={!!errors.supplierId} {...register("supplierId")}>
            <option value="">Select a supplier…</option>
            {suppliers
              .filter((s) => s.status === "active")
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
          </Select>
        </FormField>

        <FormField id="expectedDeliveryDate" label="Expected delivery date" error={errors.expectedDeliveryDate?.message} required>
          <Input id="expectedDeliveryDate" type="date" hasError={!!errors.expectedDeliveryDate} {...register("expectedDeliveryDate")} />
        </FormField>

        <FormField id="tax" label="Tax (%)" error={errors.tax?.message} required>
          <Input id="tax" type="number" min={0} max={100} step="0.5" hasError={!!errors.tax} {...register("tax", { valueAsNumber: true })} />
        </FormField>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Line Items</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ description: "", barcode: "", quantity: 1, unitPrice: 0 })}
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {errors.items?.root?.message && <p className="mb-2 text-xs font-medium text-red-500">{errors.items.root.message}</p>}

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 items-start gap-3 rounded-xl border border-glass-border bg-white/40 p-4 sm:grid-cols-[2fr_1fr_0.8fr_1fr_auto]"
            >
              <FormField id={`items.${index}.description`} label="Description" error={errors.items?.[index]?.description?.message}>
                <Input
                  id={`items.${index}.description`}
                  placeholder="Item description"
                  hasError={!!errors.items?.[index]?.description}
                  {...register(`items.${index}.description`)}
                />
              </FormField>
              <FormField id={`items.${index}.barcode`} label="Barcode" error={errors.items?.[index]?.barcode?.message}>
                <Input id={`items.${index}.barcode`} placeholder="Barcode" hasError={!!errors.items?.[index]?.barcode} {...register(`items.${index}.barcode`)} />
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
              <FormField id={`items.${index}.unitPrice`} label="Unit Price" error={errors.items?.[index]?.unitPrice?.message}>
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
                  label="Remove item"
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

      <FormField id="notes" label="Notes">
        <textarea
          id="notes"
          rows={3}
          placeholder="Optional notes for this purchase order…"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("notes")}
        />
      </FormField>

      <div className="flex items-center justify-between rounded-xl border border-glass-border bg-white/50 px-5 py-4">
        <div className="flex gap-8 text-sm">
          <div>
            <p className="text-ink-muted">Subtotal</p>
            <p className="font-semibold text-ink">{formatCurrency(subtotal)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Tax ({tax}%)</p>
            <p className="font-semibold text-ink">{formatCurrency(subtotal * (tax / 100))}</p>
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
          Create Purchase Order
        </Button>
      </div>
    </form>
  );
}
