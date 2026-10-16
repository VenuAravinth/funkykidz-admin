import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { staff } from "@/lib/dummy-data/staff";
import type { Staff } from "@/types/staff";
import type { StaffInput } from "@/features/staff/schema";

export interface StaffState {
  staff: Staff[];
}

const initialState: StaffState = { staff };

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    addStaff: {
      prepare: (input: StaffInput) => ({ payload: { id: nextId("stf"), input } }),
      reducer: (state, action: PayloadAction<{ id: string; input: StaffInput }>) => {
        const { id, input } = action.payload;
        state.staff.push({
          id,
          employeeId: input.employeeId,
          firstName: input.firstName,
          lastName: input.lastName || undefined,
          phone: input.phone,
          email: input.email || undefined,
          department: input.department || undefined,
          designation: input.designation || undefined,
          joiningDate: input.joiningDate || undefined,
          salary: input.salary || undefined,
          employmentStatus: input.employmentStatus,
          address: input.address || undefined,
          emergencyContact: input.emergencyContact || undefined,
          hasLogin: false,
        });
      },
    },
    updateStaff: (state, action: PayloadAction<{ id: string; input: StaffInput }>) => {
      const { id, input } = action.payload;
      const record = state.staff.find((s) => s.id === id);
      if (record) {
        record.employeeId = input.employeeId;
        record.firstName = input.firstName;
        record.lastName = input.lastName || undefined;
        record.phone = input.phone;
        record.email = input.email || undefined;
        record.department = input.department || undefined;
        record.designation = input.designation || undefined;
        record.joiningDate = input.joiningDate || undefined;
        record.salary = input.salary || undefined;
        record.employmentStatus = input.employmentStatus;
        record.address = input.address || undefined;
        record.emergencyContact = input.emergencyContact || undefined;
      }
    },
    setStaffHasLogin: (state, action: PayloadAction<{ id: string; hasLogin: boolean }>) => {
      const record = state.staff.find((s) => s.id === action.payload.id);
      if (record) record.hasLogin = action.payload.hasLogin;
    },
  },
});

export const { addStaff, updateStaff, setStaffHasLogin } = staffSlice.actions;

interface RootStateWithStaff {
  staff: StaffState;
}

export const selectStaff = (state: RootStateWithStaff) => state.staff.staff;
export const selectStaffById = (state: RootStateWithStaff, id: string) => state.staff.staff.find((s) => s.id === id);

export default staffSlice.reducer;
