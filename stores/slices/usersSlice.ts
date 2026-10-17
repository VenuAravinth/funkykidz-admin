import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  changeUserRole,
  createUser,
  fetchUsers,
  resetUserPassword,
  setUserStatus,
  signOutUser,
  updateUser,
} from "@/features/users/api";
import type { AsyncStatus } from "@/stores/slices/authSlice";
import type { User } from "@/types/user";

export interface UsersState {
  users: User[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: UsersState = { users: [], status: "idle", error: null };

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Couldn't load users.";
      })
      .addMatcher(
        isAnyOf(
          createUser.fulfilled,
          updateUser.fulfilled,
          setUserStatus.fulfilled,
          changeUserRole.fulfilled,
          resetUserPassword.fulfilled,
          signOutUser.fulfilled,
        ),
        (state, action) => {
          const index = state.users.findIndex((u) => u.id === action.payload.id);
          if (index === -1) state.users.push(action.payload);
          else state.users[index] = action.payload;
        },
      );
  },
});

interface RootStateWithUsers {
  users: UsersState;
}

export const selectUsers = (state: RootStateWithUsers) => state.users.users;
export const selectUsersStatus = (state: RootStateWithUsers) => state.users.status;
export const selectUsersError = (state: RootStateWithUsers) => state.users.error;
export const selectUserById = (state: RootStateWithUsers, id: string) => state.users.users.find((u) => u.id === id);

export default usersSlice.reducer;
