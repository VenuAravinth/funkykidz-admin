"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HiOutlinePencilSquare,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { Modal } from "@/components/molecules/Modal";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { resetPasswordSchema, changeRoleSchema, type ResetPasswordInput, type ChangeRoleInput } from "@/features/users/schema";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { changeUserRole, resetUserPassword, forceLogoutUser } from "@/stores/slices/usersSlice";
import { addActivityLog } from "@/stores/slices/activityLogsSlice";
import { selectRoles } from "@/stores/slices/rolesSlice";
import type { User } from "@/types/user";

export function UserActions({ user }: { user: User }) {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);

  const [resetOpen, setResetOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
    formState: { errors: resetErrors, isSubmitting: isResetting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirmPassword: "" } });

  const {
    register: registerRole,
    handleSubmit: handleRoleSubmit,
    formState: { errors: roleErrors, isSubmitting: isChangingRole },
  } = useForm<ChangeRoleInput>({ resolver: zodResolver(changeRoleSchema), defaultValues: { roleId: user.roleId } });

  const onResetPassword = handleResetSubmit(() => {
    dispatch(resetUserPassword({ id: user.id }));
    dispatch(
      addActivityLog({ userId: "usr_admin", userName: "Admin", action: "Password Reset", module: "Security", reference: user.username }),
    );
    resetResetForm();
    setResetOpen(false);
  });

  const onChangeRole = handleRoleSubmit((input) => {
    dispatch(changeUserRole({ id: user.id, roleId: input.roleId }));
    dispatch(
      addActivityLog({ userId: "usr_admin", userName: "Admin", action: "Role Changed", module: "Security", reference: user.username }),
    );
    setRoleOpen(false);
  });


  const onForceLogout = () => {
    dispatch(forceLogoutUser({ id: user.id }));
    dispatch(
      addActivityLog({ userId: "usr_admin", userName: "Admin", action: "Force Logout", module: "Security", reference: user.username }),
    );
    setLogoutConfirmOpen(false);
  };

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto [&>a>button]:w-full">
      <Link href={`/users-access/users/${user.id}/edit`}>
        <Button variant="secondary" size="sm">
          <HiOutlinePencilSquare className="h-4 w-4" />
          Edit
        </Button>
      </Link>

      <Button variant="secondary" size="sm" onClick={() => setResetOpen(true)}>
        <HiOutlineKey className="h-4 w-4" />
        Reset Password
      </Button>

      <Button variant="secondary" size="sm" onClick={() => setRoleOpen(true)}>
        <HiOutlineShieldCheck className="h-4 w-4" />
        Change Role
      </Button>

      <Button
        variant="secondary"
        size="sm"
        disabled={!user.isOnline}
        title={user.isOnline ? undefined : "User is not currently signed in."}
        onClick={() => setLogoutConfirmOpen(true)}
      >
        <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
        Force Logout
      </Button>

      <Link href={`/users-access/activity-logs?userId=${user.id}`}>
        <Button variant="secondary" size="sm">
          <HiOutlineClipboardDocumentList className="h-4 w-4" />
          View Activity
        </Button>
      </Link>

      <Modal open={resetOpen} title="Reset Password" subtitle={`Set a new password for ${user.username}.`} onClose={() => setResetOpen(false)}>
        <form onSubmit={onResetPassword} noValidate className="flex flex-col gap-5">
          <FormField id="reset-password" label="New Password" error={resetErrors.password?.message} required>
            <PasswordInput id="reset-password" autoComplete="new-password" hasError={!!resetErrors.password} {...registerReset("password")} />
          </FormField>
          <FormField id="reset-confirm-password" label="Confirm Password" error={resetErrors.confirmPassword?.message} required>
            <PasswordInput
              id="reset-confirm-password"
              autoComplete="new-password"
              hasError={!!resetErrors.confirmPassword}
              {...registerReset("confirmPassword")}
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isResetting}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={roleOpen} title="Change Role" subtitle={`Assign a new role to ${user.username}.`} onClose={() => setRoleOpen(false)}>
        <form onSubmit={onChangeRole} noValidate className="flex flex-col gap-5">
          <FormField id="change-role" label="Role" error={roleErrors.roleId?.message} required>
            <Select id="change-role" hasError={!!roleErrors.roleId} {...registerRole("roleId")}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setRoleOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isChangingRole}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Force logout?"
        description={`${user.username} will be signed out of all active sessions immediately.`}
        confirmLabel="Force Logout"
        onConfirm={onForceLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
