"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/features/categories/schema";
import { Modal } from "@/components/molecules/Modal";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { SwitchField } from "@/components/molecules/SwitchField";
import { Button } from "@/components/atoms/Button";
import { FormAlert } from "@/components/molecules/FormAlert";
import { useAppDispatch } from "@/stores/hooks";
import { createCategory, updateCategory } from "@/features/categories/api";
import type { Category } from "@/types/product";

const emptyValues: CategoryInput = { name: "", description: "", status: "active" };

function toDefaultValues(category?: Category): CategoryInput {
  if (!category) return emptyValues;
  return { name: category.name, description: category.description ?? "", status: category.status };
}

export function CategoryFormModal({
  open,
  category,
  onClose,
}: {
  open: boolean;
  category?: Category;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const mode = category ? "edit" : "create";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: toDefaultValues(category),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) reset(toDefaultValues(category));
  }, [open, category, reset]);

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (input) => {
    setSubmitError(null);
    try {
      if (category) {
        await dispatch(updateCategory({ id: category.id, input })).unwrap();
      } else {
        await dispatch(createCategory(input)).unwrap();
      }
      onClose();
    } catch (err) {
      setSubmitError(typeof err === "string" ? err : "Couldn't save the category. Please try again.");
    }
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "create" ? "Add Category" : "Edit Category"}
      subtitle={mode === "create" ? "Create a new product category." : category?.name}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {submitError && <FormAlert variant="error">{submitError}</FormAlert>}

        <FormField id="cat-name" label="Category name" error={errors.name?.message} required>
          <Input id="cat-name" placeholder="e.g. Dresses & Frocks" hasError={!!errors.name} {...register("name")} />
        </FormField>

        <FormField id="cat-description" label="Description" error={errors.description?.message}>
          <textarea
            id="cat-description"
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
              description="Inactive categories can't be picked for new products and are hidden from the website."
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
            {mode === "create" ? "Add Category" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
