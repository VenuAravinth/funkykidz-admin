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
import { FormAlert } from "@/components/molecules/FormAlert";
import { PasswordInput } from "@/components/molecules/PasswordInput";
import { Modal } from "@/components/molecules/Modal";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { resetPasswordSchema, changeRoleSchema, type ResetPasswordInput, type ChangeRoleInput } from "@/features/users/schema";
import { changeUserRole, resetUserPassword, signOutUser } from "@/features/users/api";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { addActivityLog } from "@/stores/slices/activityLogsSlice";
import { selectAuthUser } from "@/stores/slices/authSlice";
import { selectRoles } from "@/stores/slices/rolesSlice";
import type { User } from "@/types/user";

export interface UserActionsProps {
  user: User;
  onMessage?: (message: { variant: "success" | "error"; text: string }) => void;
}

const failure = (err: unknown, fallback: string) => (typeof err === "string" ? err : fallback);

export function UserActions({ user, onMessage }: UserActionsProps) {
  const dispatch = useAppDispatch();
  const roles = useAppSelector(selectRoles);
  const me = useAppSelector(selectAuthUser);

  const [resetOpen, setResetOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const log = (action: string) =>
    dispatch(addActivityLog({ userId: me?.id ?? "", userName: me?.name ?? "Admin", action, module: "Security", reference: user.username }));

  const openModal = (open: (value: boolean) => void) => {
    setModalError(null);
    open(true);
  };

  const onResetPassword = handleResetSubmit(async (input) => {
    try {
      await dispatch(resetUserPassword({ id: user.id, input })).unwrap();
    } catch (err) {
      setModalError(failure(err, "Couldn't reset the password. Please try again."));
      return;
    }
    log("Password Reset");
    resetResetForm();
    setResetOpen(false);
    onMessage?.({ variant: "success", text: `Password updated. ${user.username} has been signed out everywhere.` });
  });

  const onChangeRole = handleRoleSubmit(async (input) => {
    try {
      await dispatch(changeUserRole({ id: user.id, input })).unwrap();
    } catch (err) {
      setModalError(failure(err, "Couldn't change the role. Please try again."));
      return;
    }
    log("Role Changed");
    setRoleOpen(false);
  });

  const onForceLogout = async () => {
    setLogoutConfirmOpen(false);
    try {
      await dispatch(signOutUser({ id: user.id })).unwrap();
    } catch (err) {
      onMessage?.({ variant: "error", text: failure(err, "Couldn't sign the user out. Please try again.") });
      return;
    }
    log("Force Logout");
    onMessage?.({ variant: "success", text: `${user.username} has been signed out of every session.` });
  };

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto [&>a>button]:w-full">
      <Link href={`/users-access/users/${user.id}/edit`}>
        <Button variant="secondary" size="sm">
          <HiOutlinePencilSquare className="h-4 w-4" />
          Edit
        </Button>
      </Link>

      <Button variant="secondary" size="sm" onClick={() => openModal(setResetOpen)}>
        <HiOutlineKey className="h-4 w-4" />
        Reset Password
      </Button>

      <Button variant="secondary" size="sm" onClick={() => openModal(setRoleOpen)}>
        <HiOutlineShieldCheck className="h-4 w-4" />
        Change Role
      </Button>

      <Button variant="secondary" size="sm" onClick={() => setLogoutConfirmOpen(true)}>
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
          {modalError && <FormAlert variant="error">{modalError}</FormAlert>}
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
          {modalError && <FormAlert variant="error">{modalError}</FormAlert>}
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
