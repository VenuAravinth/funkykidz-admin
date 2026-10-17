"use client";

import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectAuthUser } from "@/stores/slices/authSlice";
import { setUserStatus } from "@/features/users/api";
import { addActivityLog } from "@/stores/slices/activityLogsSlice";
import type { User } from "@/types/user";

export interface UserStatusSwitchProps {
  user: User;
  onError?: (message: string) => void;
}

export function UserStatusSwitch({ user, onError }: UserStatusSwitchProps) {
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectAuthUser);

  const toggle = async (active: boolean) => {
    try {
      await dispatch(setUserStatus({ id: user.id, status: active ? "active" : "inactive" })).unwrap();
    } catch (err) {
      onError?.(typeof err === "string" ? err : "Couldn't change the status. Please try again.");
      return;
    }
    dispatch(
      addActivityLog({
        userId: me?.id ?? "",
        userName: me?.name ?? "Admin",
        action: active ? "User Activated" : "User Deactivated",
        module: "Security",
        reference: user.username,
      }),
    );
  };

  return <StatusSwitch active={user.status === "active"} name={user.username} onChange={toggle} />;
}
