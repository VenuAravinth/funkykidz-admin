"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { onlineOrderSchema, type OnlineOrderInput } from "@/features/online-orders/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { IconButton } from "@/components/atoms/IconButton";
import { formatCurrency } from "@/lib/format";
import { buildStockRows, applyReservedStock } from "@/lib/stockRows";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectProducts } from "@/stores/slices/catalogSlice";
import { addOnlineOrder } from "@/stores/slices/onlineOrdersSlice";

const PAYMENT_METHODS = ["Cash on Delivery", "UPI", "Card", "Net Banking"];
const SHIPPING_METHODS = ["Standard Delivery", "Express Delivery"];

export function OnlineOrderForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const [submitError, setSubmitError] = useState(false);

  const rows = useMemo(() => {
    const published = buildStockRows(products.filter((p) => p.published));
    return applyReservedStock(published, products);
  }, [products]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnlineOrderInput>({
    resolver: zodResolver(onlineOrderSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      address: "",
      paymentMethod: PAYMENT_METHODS[0],
      shippingMethod: SHIPPING_METHODS[0],
      items: [{ rowKey: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const itemInputs = watch("items");

  const total = itemInputs.reduce((sum, input) => {
    const row = rows.find((r) => r.key === input.rowKey);
    return sum + (row ? row.price * (Number(input.quantity) || 0) : 0);
  }, 0);

  const onSubmit = handleSubmit((data) => {
    setSubmitError(false);
    try {
      const items = data.items.map((input) => {
        const row = rows.find((r) => r.key === input.rowKey)!;
        return { productId: row.productId, variantId: row.variantId, barcode: row.barcode, product: row.name, quantity: input.quantity, price: row.price };
      });
      const action = dispatch(
        addOnlineOrder({
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          paymentMethod: data.paymentMethod,
          shippingMethod: data.shippingMethod,
          items,
        }),
      );
      router.push(`/sales/online-orders/${action.payload.id}`);
    } catch {
      setSubmitError(true);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {submitError && (
        <p role="alert" className="text-sm font-medium text-red-500">
          Something went wrong creating the order. Please try again.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="customerName" label="Customer" error={errors.customerName?.message} required>
          <Input id="customerName" placeholder="Customer name" hasError={!!errors.customerName} {...register("customerName")} />
        </FormField>
        <FormField id="phone" label="Phone" error={errors.phone?.message} required>
          <Input id="phone" type="tel" placeholder="9876543210" hasError={!!errors.phone} {...register("phone")} />
        </FormField>
      </div>

      <FormField id="address" label="Address" error={errors.address?.message} required>
        <textarea
          id="address"
          rows={2}
          placeholder="Delivery address"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("address")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="paymentMethod" label="Payment" error={errors.paymentMethod?.message} required>
          <Select id="paymentMethod" hasError={!!errors.paymentMethod} {...register("paymentMethod")}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField id="shippingMethod" label="Shipping" error={errors.shippingMethod?.message} required>
          <Select id="shippingMethod" hasError={!!errors.shippingMethod} {...register("shippingMethod")}>
            {SHIPPING_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Products</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ rowKey: "", quantity: 1 })}>
            <HiOutlinePlus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {errors.items?.root?.message && <p className="mb-2 text-xs font-medium text-red-500">{errors.items.root.message}</p>}

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 items-start gap-3 rounded-xl border border-glass-border bg-white/40 p-4 sm:grid-cols-[2fr_1fr_auto]"
            >
              <FormField id={`items.${index}.rowKey`} label="Product" error={errors.items?.[index]?.rowKey?.message}>
                <Select id={`items.${index}.rowKey`} hasError={!!errors.items?.[index]?.rowKey} {...register(`items.${index}.rowKey`)}>
                  <option value="">Select a product…</option>
                  {rows.map((row) => (
                    <option key={row.key} value={row.key} disabled={row.available <= 0}>
                      {row.name} — {row.barcode} ({formatCurrency(row.price)}) {row.available <= 0 ? "— out of stock" : `— ${row.available} available`}
                    </option>
                  ))}
                </Select>
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

      <div className="flex items-center justify-between rounded-xl border border-glass-border bg-white/50 px-5 py-4">
        <span className="text-sm font-medium text-ink-muted">Order Total</span>
        <span className="text-lg font-semibold text-champagne-700">{formatCurrency(total)}</span>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create Order
        </Button>
      </div>
    </form>
  );
}
