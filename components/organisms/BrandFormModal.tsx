"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandSchema, type BrandInput } from "@/features/brands/schema";
import { Modal } from "@/components/molecules/Modal";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { SwitchField } from "@/components/molecules/SwitchField";
import { Button } from "@/components/atoms/Button";
import { FormAlert } from "@/components/molecules/FormAlert";
import { useAppDispatch } from "@/stores/hooks";
import { createBrand, updateBrand } from "@/features/brands/api";
import type { Brand } from "@/types/product";

const emptyValues: BrandInput = { name: "", description: "", status: "active" };

function toDefaultValues(brand?: Brand): BrandInput {
  if (!brand) return emptyValues;
  return { name: brand.name, description: brand.description ?? "", status: brand.status };
}

export function BrandFormModal({ open, brand, onClose }: { open: boolean; brand?: Brand; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const mode = brand ? "edit" : "create";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: toDefaultValues(brand),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) reset(toDefaultValues(brand));
  }, [open, brand, reset]);

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (input) => {
    setSubmitError(null);
    try {
      if (brand) {
        await dispatch(updateBrand({ id: brand.id, input })).unwrap();
      } else {
        await dispatch(createBrand(input)).unwrap();
      }
      onClose();
    } catch (err) {
      setSubmitError(typeof err === "string" ? err : "Couldn't save the brand. Please try again.");
    }
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "create" ? "Add Brand" : "Edit Brand"}
      subtitle={mode === "create" ? "Create a new product brand." : brand?.name}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {submitError && <FormAlert variant="error">{submitError}</FormAlert>}

        <FormField id="brand-name" label="Brand name" error={errors.name?.message} required>
          <Input id="brand-name" placeholder="e.g. Little Sprout" hasError={!!errors.name} {...register("name")} />
        </FormField>

        <FormField id="brand-description" label="Description" error={errors.description?.message}>
          <textarea
            id="brand-description"
            rows={3}
            placeholder="Optional description…"
            className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
            {...register("description")}
          />
        </FormField>

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <SwitchField
              label="Active"
              description="Inactive brands can't be picked for new products and are hidden from the website."
              checked={field.value === "active"}
              onCheckedChange={(on) => field.onChange(on ? "active" : "inactive")}
            />
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {mode === "create" ? "Add Brand" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
