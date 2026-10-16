"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userCreateSchema, type UserCreateInput } from "@/features/users/schema";
import { FormField } from "@/components/molecules/FormField";
import { SwitchField } from "@/components/molecules/SwitchField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addUser, selectUsers } from "@/stores/slices/usersSlice";
import { setStaffHasLogin, selectStaff } from "@/stores/slices/staffSlice";
import { selectRoles } from "@/stores/slices/rolesSlice";
import { staffFullName } from "@/types/staff";

export interface UserFormProps {
  defaultStaffId?: string;
}

export function UserForm({ defaultStaffId }: UserFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const allStaff = useAppSelector(selectStaff);
  const users = useAppSelector(selectUsers);

  const linkedStaffIds = new Set(users.map((u) => u.staffId).filter(Boolean));
  const availableStaff = allStaff.filter((s) => !s.hasLogin && (!linkedStaffIds.has(s.id) || s.id === defaultStaffId));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      staffId: defaultStaffId ?? "",
      roleId: "",
      status: "active",
    },
  });

  const onSubmit = handleSubmit((input) => {
    const action = dispatch(addUser(input));
    if (input.staffId) {
      dispatch(setStaffHasLogin({ id: input.staffId, hasLogin: true }));
    }
    router.push(`/users-access/users/${action.payload.id}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="username" label="Username" error={errors.username?.message} required>
          <Input id="username" placeholder="e.g. arun" hasError={!!errors.username} {...register("username")} />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="user@funkykids.in" hasError={!!errors.email} {...register("email")} />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message} required>
          <PasswordInput id="password" autoComplete="new-password" hasError={!!errors.password} {...register("password")} />
        </FormField>

        <FormField id="confirmPassword" label="Confirm Password" error={errors.confirmPassword?.message} required>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            hasError={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        <FormField id="staffId" label="Staff Member" error={errors.staffId?.message}>
          <Select id="staffId" hasError={!!errors.staffId} {...register("staffId")}>
            <option value="">Select Staff</option>
            {availableStaff.map((s) => (
              <option key={s.id} value={s.id}>
                {staffFullName(s)} — {s.employeeId}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="roleId" label="Role" error={errors.roleId?.message} required>
          <Select id="roleId" hasError={!!errors.roleId} {...register("roleId")}>
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create User
        </Button>
      </div>
    </form>
  );
}
