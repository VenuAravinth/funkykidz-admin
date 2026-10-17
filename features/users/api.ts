import { createAsyncThunk } from "@reduxjs/toolkit";
import { callApi, callApiGet } from "@/services/apiCaller";
import { USER_ENDPOINTS } from "@/services/endpoints";
import type { User, UserStatus } from "@/types/user";
import type { ChangeRoleInput, ResetPasswordInput, UserCreateInput, UserEditInput } from "./schema";

interface UsersStateSlice {
  users: { status: string };
}

const { folder, actions } = USER_ENDPOINTS;

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string; state: UsersStateSlice }>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { items } = await callApiGet<{ items: User[] }>(folder, actions.list, undefined, "Couldn't load users.");
      return items;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Couldn't load users."));
    }
  },
  { condition: (_, { getState }) => getState().users.status !== "loading" },
);

/** One thunk per user action; each resolves to the saved user. */
function userAction<TArg>(type: string, action: string, fallback: string, toPayload: (arg: TArg) => object) {
  return createAsyncThunk<User, TArg, { rejectValue: string }>(`users/${type}`, async (arg, { rejectWithValue }) => {
    try {
      const { item } = await callApi<{ item: User }>(folder, action, toPayload(arg), fallback);
      return item;
    } catch (err) {
      return rejectWithValue(errorMessage(err, fallback));
    }
  });
}

export const createUser = userAction<UserCreateInput>("createUser", actions.create, "Couldn't create the user.", (input) => ({ input }));

export const updateUser = userAction<{ id: string; input: UserEditInput }>("updateUser", actions.update, "Couldn't update the user.", (p) => p);

export const setUserStatus = userAction<{ id: string; status: UserStatus }>(
  "setUserStatus",
  actions.setStatus,
  "Couldn't change the status.",
  ({ id, status }) => ({ id, input: { status } }),
);

export const changeUserRole = userAction<{ id: string; input: ChangeRoleInput }>("changeUserRole", actions.changeRole, "Couldn't change the role.", (p) => p);

export const resetUserPassword = userAction<{ id: string; input: ResetPasswordInput }>(
  "resetUserPassword",
  actions.resetPassword,
  "Couldn't reset the password.",
  (p) => p,
);

export const signOutUser = userAction<{ id: string }>("signOutUser", actions.signOut, "Couldn't sign the user out.", (p) => p);
