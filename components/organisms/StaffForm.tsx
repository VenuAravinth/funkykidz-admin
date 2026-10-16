"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema, employmentStatuses, type StaffInput } from "@/features/staff/schema";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch } from "@/stores/hooks";
import { addStaff, updateStaff } from "@/stores/slices/staffSlice";
import type { Staff } from "@/types/staff";

export interface StaffFormProps {
  staff?: Staff;
  mode: "create" | "edit";
}

function toDefaultValues(staff?: Staff): StaffInput {
  if (!staff) {
    return {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      employeeId: "",
      department: "",
      designation: "",
      joiningDate: "",
      salary: 0,
      employmentStatus: "active",
      address: "",
      emergencyContact: "",
    };
  }
  return {
    firstName: staff.firstName,
    lastName: staff.lastName ?? "",
    phone: staff.phone,
    email: staff.email ?? "",
    employeeId: staff.employeeId,
    department: staff.department ?? "",
    designation: staff.designation ?? "",
    joiningDate: staff.joiningDate ?? "",
    salary: staff.salary ?? 0,
    employmentStatus: staff.employmentStatus,
    address: staff.address ?? "",
    emergencyContact: staff.emergencyContact ?? "",
  };
}

const employmentStatusLabels: Record<(typeof employmentStatuses)[number], string> = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
};

export function StaffForm({ staff, mode }: StaffFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffInput>({ resolver: zodResolver(staffSchema), defaultValues: toDefaultValues(staff) });

  const onSubmit = handleSubmit((input) => {
    if (staff) {
      dispatch(updateStaff({ id: staff.id, input }));
      router.push(`/users-access/staff/${staff.id}`);
    } else {
      const action = dispatch(addStaff(input));
      router.push(`/users-access/staff/${action.payload.id}`);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Staff information</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="firstName" label="First Name" error={errors.firstName?.message} required>
            <Input id="firstName" hasError={!!errors.firstName} {...register("firstName")} />
          </FormField>

          <FormField id="lastName" label="Last Name" error={errors.lastName?.message}>
            <Input id="lastName" hasError={!!errors.lastName} {...register("lastName")} />
          </FormField>

          <FormField id="phone" label="Contact Number" error={errors.phone?.message} required>
            <Input id="phone" placeholder="+91 90000 00000" hasError={!!errors.phone} {...register("phone")} />
          </FormField>

          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" hasError={!!errors.email} {...register("email")} />
          </FormField>

          <FormField id="employeeId" label="Employee ID" error={errors.employeeId?.message} required>
            <Input id="employeeId" placeholder="e.g. EMP009" hasError={!!errors.employeeId} {...register("employeeId")} />
          </FormField>

          <FormField id="department" label="Department" error={errors.department?.message}>
            <Input id="department" placeholder="e.g. Sales" hasError={!!errors.department} {...register("department")} />
          </FormField>

          <FormField id="designation" label="Designation" error={errors.designation?.message}>
            <Input id="designation" placeholder="e.g. Cashier" hasError={!!errors.designation} {...register("designation")} />
          </FormField>

          <FormField id="joiningDate" label="Joining Date" error={errors.joiningDate?.message}>
            <Input id="joiningDate" type="date" hasError={!!errors.joiningDate} {...register("joiningDate")} />
          </FormField>

          <FormField id="salary" label="Salary" error={errors.salary?.message}>
            <Input id="salary" type="number" min={0} hasError={!!errors.salary} {...register("salary", { valueAsNumber: true })} />
          </FormField>

          <FormField id="employmentStatus" label="Employment Status" error={errors.employmentStatus?.message} required>
            <Select id="employmentStatus" hasError={!!errors.employmentStatus} {...register("employmentStatus")}>
              {employmentStatuses.map((s) => (
                <option key={s} value={s}>
                  {employmentStatusLabels[s]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold text-ink">Additional details</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="address" label="Address" error={errors.address?.message} className="sm:col-span-2">
            <Input id="address" hasError={!!errors.address} {...register("address")} />
          </FormField>

          <FormField id="emergencyContact" label="Emergency Contact" error={errors.emergencyContact?.message}>
            <Input id="emergencyContact" placeholder="+91 90000 00000" hasError={!!errors.emergencyContact} {...register("emergencyContact")} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Save Staff" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
