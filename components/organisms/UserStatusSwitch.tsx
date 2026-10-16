"use client";

import { StatusSwitch } from "@/components/molecules/StatusSwitch";
import { useAppDispatch } from "@/stores/hooks";
import { setUserStatus } from "@/stores/slices/usersSlice";
import { addActivityLog } from "@/stores/slices/activityLogsSlice";
import type { User } from "@/types/user";

export function UserStatusSwitch({ user }: { user: User }) {
  const dispatch = useAppDispatch();

  const toggle = (active: boolean) => {
    dispatch(setUserStatus({ id: user.id, status: active ? "active" : "inactive" }));
    dispatch(
      addActivityLog({
        userId: "usr_admin",
        userName: "Admin",
        action: active ? "User Activated" : "User Deactivated",
        module: "Security",
        reference: user.username,
      }),
    );
  };

  return <StatusSwitch active={user.status === "active"} name={user.username} onChange={toggle} />;
}
