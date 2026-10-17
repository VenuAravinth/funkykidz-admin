import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectUsers, selectUsersError, selectUsersStatus } from "@/stores/slices/usersSlice";
import { fetchUsers } from "./api";

/** ERP login accounts, loaded from the server whenever a page using them opens. */
export function useUsers() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return { users, status, error, isLoading: status === "idle" || status === "loading" };
}
