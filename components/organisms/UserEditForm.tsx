"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userEditSchema, type UserEditInput } from "@/features/users/schema";
import { FormField } from "@/components/molecules/FormField";
import { SwitchField } from "@/components/molecules/SwitchField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { updateUser, selectUsers } from "@/stores/slices/usersSlice";
import { setStaffHasLogin, selectStaff } from "@/stores/slices/staffSlice";
import { selectRoles } from "@/stores/slices/rolesSlice";
import { staffFullName } from "@/types/staff";
import type { User } from "@/types/user";

export function UserEditForm({ user }: { user: User }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const allStaff = useAppSelector(selectStaff);
  const users = useAppSelector(selectUsers);

  const linkedStaffIds = new Set(users.filter((u) => u.id !== user.id).map((u) => u.staffId).filter(Boolean));
  const availableStaff = allStaff.filter((s) => !s.hasLogin && !linkedStaffIds.has(s.id));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<UserEditInput>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      username: user.username,
      email: user.email ?? "",
      staffId: user.staffId ?? "",
      roleId: user.roleId,
      status: user.status,
    },
  });

  const onSubmit = handleSubmit((input) => {
    dispatch(updateUser({ id: user.id, input }));
    if (input.staffId && input.staffId !== user.staffId) {
      dispatch(setStaffHasLogin({ id: input.staffId, hasLogin: true }));
    }
    if (user.staffId && user.staffId !== input.staffId) {
      dispatch(setStaffHasLogin({ id: user.staffId, hasLogin: false }));
    }
    router.push(`/users-access/users/${user.id}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="username" label="Username" error={errors.username?.message} required>
          <Input id="username" hasError={!!errors.username} {...register("username")} />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" hasError={!!errors.email} {...register("email")} />
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
