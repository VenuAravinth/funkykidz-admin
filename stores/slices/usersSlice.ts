import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { users } from "@/lib/dummy-data/users";
import type { User, UserStatus } from "@/types/user";
import type { UserCreateInput, UserEditInput } from "@/features/users/schema";

export interface UsersState {
  users: User[];
}

const initialState: UsersState = { users };

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: {
      prepare: (input: UserCreateInput) => ({ payload: { id: nextId("usr"), input } }),
      reducer: (state, action: PayloadAction<{ id: string; input: UserCreateInput }>) => {
        const { id, input } = action.payload;
        state.users.push({
          id,
          username: input.username,
          email: input.email || undefined,
          staffId: input.staffId || undefined,
          roleId: input.roleId,
          status: input.status,
          isOnline: false,
          createdDate: new Date().toISOString().slice(0, 10),
        });
      },
    },
    updateUser: (state, action: PayloadAction<{ id: string; input: UserEditInput }>) => {
      const { id, input } = action.payload;
      const user = state.users.find((u) => u.id === id);
      if (user) {
        user.username = input.username;
        user.email = input.email || undefined;
        user.staffId = input.staffId || undefined;
        user.roleId = input.roleId;
        user.status = input.status;
      }
    },
    setUserStatus: (state, action: PayloadAction<{ id: string; status: UserStatus }>) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) user.status = action.payload.status;
    },
    changeUserRole: (state, action: PayloadAction<{ id: string; roleId: string }>) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) user.roleId = action.payload.roleId;
    },
    resetUserPassword: (state, action: PayloadAction<{ id: string }>) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) user.lastPasswordResetAt = new Date().toISOString();
    },
    forceLogoutUser: (state, action: PayloadAction<{ id: string }>) => {
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) user.isOnline = false;
    },
  },
});

export const { addUser, updateUser, setUserStatus, changeUserRole, resetUserPassword, forceLogoutUser } =
  usersSlice.actions;

interface RootStateWithUsers {
  users: UsersState;
}

export const selectUsers = (state: RootStateWithUsers) => state.users.users;
export const selectUserById = (state: RootStateWithUsers, id: string) => state.users.users.find((u) => u.id === id);

export default usersSlice.reducer;
