"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerGroupSchema, customerPaymentTermsOptions, type CustomerGroupInput } from "@/features/customers/schema";
import { Modal } from "@/components/molecules/Modal";
import { FormField } from "@/components/molecules/FormField";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch } from "@/stores/hooks";
import { addCustomerGroup, updateCustomerGroup } from "@/stores/slices/customersSlice";
import type { CustomerGroup } from "@/types/customer";

const emptyValues: CustomerGroupInput = {
  name: "",
  discountPercent: 0,
  creditAllowed: false,
  creditLimit: 0,
  paymentTerms: "Immediate",
};

function toDefaultValues(group?: CustomerGroup): CustomerGroupInput {
  if (!group) return emptyValues;
  return {
    name: group.name,
    discountPercent: group.discountPercent,
    creditAllowed: group.creditAllowed,
    creditLimit: group.creditLimit,
    paymentTerms: group.paymentTerms,
  };
}

export function CustomerGroupFormModal({
  open,
  group,
  onClose,
}: {
  open: boolean;
  group?: CustomerGroup;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const mode = group ? "edit" : "create";
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomerGroupInput>({
    resolver: zodResolver(customerGroupSchema),
    defaultValues: toDefaultValues(group),
  });

  const creditAllowed = watch("creditAllowed");

  useEffect(() => {
    if (open) reset(toDefaultValues(group));
  }, [open, group, reset]);

  const onSubmit = handleSubmit((input) => {
    if (group) {
      dispatch(updateCustomerGroup({ id: group.id, input }));
    } else {
      dispatch(addCustomerGroup(input));
    }
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add Customer Group" : "Edit Customer Group"}
      subtitle={mode === "create" ? "Create a new customer group for pricing and credit rules." : group?.name}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField id="grp-name" label="Group name" error={errors.name?.message} required>
          <Input id="grp-name" placeholder="e.g. VIP" hasError={!!errors.name} {...register("name")} />
        </FormField>

        <FormField id="grp-discount" label="Default discount (%)" error={errors.discountPercent?.message} required>
          <Input
            id="grp-discount"
            type="number"
            min={0}
            max={100}
            step="0.5"
            hasError={!!errors.discountPercent}
            {...register("discountPercent", { valueAsNumber: true })}
          />
        </FormField>

        <CheckboxField id="grp-credit-allowed" label="Credit allowed for this group" {...register("creditAllowed")} />

        <FormField id="grp-credit-limit" label="Credit limit" error={errors.creditLimit?.message}>
          <Input
            id="grp-credit-limit"
            type="number"
            min={0}
            step="1"
            disabled={!creditAllowed}
            hasError={!!errors.creditLimit}
            {...register("creditLimit", { valueAsNumber: true })}
          />
        </FormField>

        <FormField id="grp-payment-terms" label="Payment terms" error={errors.paymentTerms?.message} required>
          <Select id="grp-payment-terms" hasError={!!errors.paymentTerms} {...register("paymentTerms")}>
            {customerPaymentTermsOptions.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Add Group" : "Save Changes"}</Button>
        </div>
      </form>
    </Modal>
  );
}
