import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { roles } from "@/lib/dummy-data/roles";
import type { Role, RoleStatus } from "@/types/role";
import type { RoleInput } from "@/features/roles/schema";

export interface RolesState {
  roles: Role[];
}

const initialState: RolesState = { roles };

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    addRole: {
      prepare: (input: RoleInput) => ({ payload: { id: nextId("role"), input } }),
      reducer: (state, action: PayloadAction<{ id: string; input: RoleInput }>) => {
        const { id, input } = action.payload;
        state.roles.push({
          id,
          name: input.name,
          description: input.description || undefined,
          permissionKeys: [],
          status: "active",
          createdDate: new Date().toISOString().slice(0, 10),
        });
      },
    },
    updateRole: (state, action: PayloadAction<{ id: string; input: RoleInput }>) => {
      const { id, input } = action.payload;
      const role = state.roles.find((r) => r.id === id);
      if (role) {
        role.name = input.name;
        role.description = input.description || undefined;
      }
    },
    updateRolePermissions: (state, action: PayloadAction<{ id: string; permissionKeys: string[] }>) => {
      const role = state.roles.find((r) => r.id === action.payload.id);
      if (role) role.permissionKeys = action.payload.permissionKeys;
    },
    setRoleStatus: (state, action: PayloadAction<{ id: string; status: RoleStatus }>) => {
      const role = state.roles.find((r) => r.id === action.payload.id);
      if (role) role.status = action.payload.status;
    },
    deleteRole: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter((r) => r.id !== action.payload);
    },
  },
});

export const { addRole, updateRole, updateRolePermissions, setRoleStatus, deleteRole } = rolesSlice.actions;

interface RootStateWithRoles {
  roles: RolesState;
}

export const selectRoles = (state: RootStateWithRoles) => state.roles.roles;
export const selectRoleById = (state: RootStateWithRoles, id: string) => state.roles.roles.find((r) => r.id === id);

export default rolesSlice.reducer;
