"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema, type RoleInput } from "@/features/roles/schema";
import { Modal } from "@/components/molecules/Modal";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch } from "@/stores/hooks";
import { addRole, updateRole } from "@/stores/slices/rolesSlice";
import type { Role } from "@/types/role";

const emptyValues: RoleInput = { name: "", description: "" };

function toDefaultValues(role?: Role): RoleInput {
  if (!role) return emptyValues;
  return { name: role.name, description: role.description ?? "" };
}

export function RoleFormModal({ open, role, onClose }: { open: boolean; role?: Role; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const mode = role ? "edit" : "create";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleInput>({ resolver: zodResolver(roleSchema), defaultValues: toDefaultValues(role) });

  useEffect(() => {
    if (open) reset(toDefaultValues(role));
  }, [open, role, reset]);

  const onSubmit = handleSubmit((input) => {
    if (role) {
      dispatch(updateRole({ id: role.id, input }));
    } else {
      dispatch(addRole(input));
    }
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Create Role" : "Edit Role"}
      subtitle={mode === "create" ? "Define a new role, then assign its permissions." : role?.name}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField id="role-name" label="Role Name" error={errors.name?.message} required>
          <Input id="role-name" placeholder="e.g. Cashier" hasError={!!errors.name} {...register("name")} />
        </FormField>

        <FormField id="role-description" label="Description" error={errors.description?.message}>
          <textarea
            id="role-description"
            rows={3}
            placeholder="e.g. Handles POS billing and customer payments"
            className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
            {...register("description")}
          />
        </FormField>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {mode === "create" ? "Save Role" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
