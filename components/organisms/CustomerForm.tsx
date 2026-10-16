"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerTypes,
  customerGenders,
  customerPaymentTermsOptions,
  customerSchema,
  type CustomerInput,
} from "@/features/customers/schema";
import { FormField } from "@/components/molecules/FormField";
import { SwitchField } from "@/components/molecules/SwitchField";
import { CheckboxField } from "@/components/molecules/CheckboxField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addCustomer, updateCustomer, selectCustomerGroups } from "@/stores/slices/customersSlice";
import type { Customer } from "@/types/customer";

export interface CustomerFormProps {
  customer?: Customer;
  mode: "create" | "edit";
}

function toDefaultValues(customer?: Customer): CustomerInput {
  if (!customer) {
    return {
      name: "",
      phone: "",
      email: "",
      dob: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      groupId: "grp_regular",
      customerType: "Retail",
      allowCredit: false,
      creditLimit: 0,
      paymentTerms: "Immediate",
      notes: "",
      status: "active",
    };
  }
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    dob: customer.dob ?? "",
    gender: customer.gender ?? "",
    address: customer.address ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    pincode: customer.pincode ?? "",
    groupId: customer.groupId,
    customerType: customer.customerType,
    allowCredit: customer.allowCredit,
    creditLimit: customer.creditLimit,
    paymentTerms: customer.paymentTerms,
    notes: customer.notes ?? "",
    status: customer.status,
  };
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectCustomerGroups);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    control,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: toDefaultValues(customer),
  });

  const allowCredit = watch("allowCredit");

  const onSubmit = handleSubmit((input) => {
    if (customer) {
      dispatch(updateCustomer({ id: customer.id, input }));
      router.push(`/customers/${encodeURIComponent(customer.name)}`);
    } else {
      dispatch(addCustomer(input));
      router.push("/customers");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Basic information</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="name" label="Customer name" error={errors.name?.message} required>
            <Input id="name" placeholder="e.g. Venu" hasError={!!errors.name} {...register("name")} />
          </FormField>

          <FormField id="phone" label="Contact number" error={errors.phone?.message} required>
            <Input id="phone" placeholder="+91 90000 00000" hasError={!!errors.phone} {...register("phone")} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" placeholder="customer@example.com" hasError={!!errors.email} {...register("email")} />
          </FormField>

          <FormField id="dob" label="Date of birth" error={errors.dob?.message}>
            <Input id="dob" type="date" hasError={!!errors.dob} {...register("dob")} />
          </FormField>

          <FormField id="gender" label="Gender" error={errors.gender?.message}>
            <Select id="gender" hasError={!!errors.gender} {...register("gender")}>
              <option value="">Not specified</option>
              {customerGenders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Address</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="address" label="Address" error={errors.address?.message} className="sm:col-span-2">
            <Input id="address" placeholder="House / street / area" hasError={!!errors.address} {...register("address")} />
          </FormField>

          <FormField id="city" label="City" error={errors.city?.message}>
            <Input id="city" placeholder="e.g. Coimbatore" hasError={!!errors.city} {...register("city")} />
          </FormField>

          <FormField id="state" label="State" error={errors.state?.message}>
            <Input id="state" placeholder="e.g. Tamil Nadu" hasError={!!errors.state} {...register("state")} />
          </FormField>

          <FormField id="pincode" label="Pincode" error={errors.pincode?.message}>
            <Input id="pincode" placeholder="e.g. 641001" hasError={!!errors.pincode} {...register("pincode")} />
          </FormField>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Customer classification</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="groupId" label="Customer group" error={errors.groupId?.message} required>
            <Select id="groupId" hasError={!!errors.groupId} {...register("groupId")}>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField id="customerType" label="Customer type" error={errors.customerType?.message} required>
            <Select id="customerType" hasError={!!errors.customerType} {...register("customerType")}>
              {customerTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
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
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Credit</h2>
        <div className="flex flex-col gap-5">
          <CheckboxField id="allowCredit" label="Allow credit for this customer" {...register("allowCredit")} />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="creditLimit" label="Credit limit" error={errors.creditLimit?.message} required={allowCredit}>
              <Input
                id="creditLimit"
                type="number"
                min={0}
                step="1"
                disabled={!allowCredit}
                hasError={!!errors.creditLimit}
                {...register("creditLimit", { valueAsNumber: true })}
              />
            </FormField>

            <FormField id="paymentTerms" label="Payment terms" error={errors.paymentTerms?.message} required>
              <Select id="paymentTerms" hasError={!!errors.paymentTerms} {...register("paymentTerms")}>
                {customerPaymentTermsOptions.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Additional</h2>
        <FormField id="notes" label="Notes" error={errors.notes?.message}>
          <textarea
            id="notes"
            rows={3}
            placeholder="Size preferences, important notes, special requests…"
            className="w-full rounded-xl border border-glass-border bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 backdrop-blur-sm transition-all duration-150 ease-out focus:border-champagne-500 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-champagne-500/60"
            {...register("notes")}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Save Customer" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
