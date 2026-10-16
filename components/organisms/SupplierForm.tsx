"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierCategories, supplierSchema, type SupplierInput } from "@/features/suppliers/schema";
import { FormField } from "@/components/molecules/FormField";
import { SwitchField } from "@/components/molecules/SwitchField";
import { FormAlert } from "@/components/molecules/FormAlert";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import type { Supplier } from "@/types/supplier";

export interface SupplierFormProps {
  supplier?: Supplier;
  mode: "create" | "edit";
}

function toDefaultValues(supplier?: Supplier): SupplierInput {
  if (!supplier) {
    return {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      category: "Fabric",
      gstNumber: "",
      city: "",
      state: "",
      country: "India",
      paymentTerms: "Net 30",
      status: "active",
      notes: "",
    };
  }
  return {
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    email: supplier.email,
    phone: supplier.phone,
    category: supplier.category,
    gstNumber: supplier.gstNumber,
    city: supplier.city,
    state: supplier.state,
    country: supplier.country,
    paymentTerms: supplier.paymentTerms,
    status: supplier.status,
    notes: supplier.notes ?? "",
  };
}

export function SupplierForm({ supplier, mode }: SupplierFormProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: toDefaultValues(supplier),
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    setTimeout(() => router.push(supplier ? `/suppliers/${supplier.id}` : "/suppliers"), 900);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {submitted && (
        <FormAlert variant="success">
          {mode === "create" ? "Supplier added successfully." : "Supplier updated successfully."} (Demo only — changes
          aren&apos;t persisted.)
        </FormAlert>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="name" label="Supplier name" error={errors.name?.message} required>
          <Input id="name" placeholder="e.g. Radiant Textile Mills" hasError={!!errors.name} {...register("name")} />
        </FormField>

        <FormField id="contactPerson" label="Contact person" error={errors.contactPerson?.message} required>
          <Input id="contactPerson" placeholder="e.g. Arvind Menon" hasError={!!errors.contactPerson} {...register("contactPerson")} />
        </FormField>

        <FormField id="email" label="Email address" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="contact@supplier.com" hasError={!!errors.email} {...register("email")} />
        </FormField>

        <FormField id="phone" label="Phone number" error={errors.phone?.message} required>
          <Input id="phone" placeholder="+91 90000 00000" hasError={!!errors.phone} {...register("phone")} />
        </FormField>

        <FormField id="category" label="Category" error={errors.category?.message} required>
          <Select id="category" hasError={!!errors.category} {...register("category")}>
            {supplierCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="gstNumber" label="GST number" error={errors.gstNumber?.message} required>
          <Input id="gstNumber" placeholder="e.g. 29AACCR1234F1Z5" hasError={!!errors.gstNumber} {...register("gstNumber")} />
        </FormField>

        <FormField id="city" label="City" error={errors.city?.message} required>
          <Input id="city" placeholder="e.g. Coimbatore" hasError={!!errors.city} {...register("city")} />
        </FormField>

        <FormField id="state" label="State" error={errors.state?.message} required>
          <Input id="state" placeholder="e.g. Tamil Nadu" hasError={!!errors.state} {...register("state")} />
        </FormField>

        <FormField id="country" label="Country" error={errors.country?.message} required>
          <Input id="country" hasError={!!errors.country} {...register("country")} />
        </FormField>

        <FormField id="paymentTerms" label="Payment terms" error={errors.paymentTerms?.message} required>
          <Input id="paymentTerms" placeholder="e.g. Net 30" hasError={!!errors.paymentTerms} {...register("paymentTerms")} />
        </FormField>

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <SwitchField
              label="Active"
              checked={field.value === "active"}
              onCheckedChange={(on) => field.onChange(on ? "active" : "inactive")}
            />
          )}
        />
      </div>

      <FormField id="notes" label="Notes" error={errors.notes?.message}>
        <textarea
          id="notes"
          rows={3}
          placeholder="Optional internal notes about this supplier…"
          className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
          {...register("notes")}
        />
      </FormField>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Add Supplier" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
