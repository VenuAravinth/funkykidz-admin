import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { customers, customerGroups } from "@/lib/dummy-data/customers";
import type { Customer, CustomerGroup, CustomerStatus } from "@/types/customer";
import type { CustomerInput, CustomerGroupInput } from "@/features/customers/schema";

export interface CustomersState {
  customers: Customer[];
  groups: CustomerGroup[];
}

const initialState: CustomersState = {
  customers,
  groups: customerGroups,
};

function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    addCustomer: {
      prepare: (input: CustomerInput) => ({ payload: { id: nextId("cus"), input } }),
      reducer: (state, action: PayloadAction<{ id: string; input: CustomerInput }>) => {
        const { id, input } = action.payload;
        state.customers.push({ id, createdDate: new Date().toISOString().slice(0, 10), ...input });
      },
    },
    updateCustomer: (state, action: PayloadAction<{ id: string; input: CustomerInput }>) => {
      const { id, input } = action.payload;
      const customer = state.customers.find((c) => c.id === id);
      if (customer) Object.assign(customer, input);
    },
    setCustomerStatus: (state, action: PayloadAction<{ id: string; status: CustomerStatus }>) => {
      const customer = state.customers.find((c) => c.id === action.payload.id);
      if (customer) customer.status = action.payload.status;
    },

    addCustomerGroup: {
      prepare: (input: CustomerGroupInput) => ({ payload: { id: nextId("grp"), input } }),
      reducer: (state, action: PayloadAction<{ id: string; input: CustomerGroupInput }>) => {
        const { id, input } = action.payload;
        state.groups.push({ id, ...input });
      },
    },
    updateCustomerGroup: (state, action: PayloadAction<{ id: string; input: CustomerGroupInput }>) => {
      const { id, input } = action.payload;
      const group = state.groups.find((g) => g.id === id);
      if (group) Object.assign(group, input);
    },
    deleteCustomerGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
    },
  },
});

export const {
  addCustomer,
  updateCustomer,
  setCustomerStatus,
  addCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
} = customersSlice.actions;

interface RootStateWithCustomers {
  customers: CustomersState;
}

export const selectCustomers = (state: RootStateWithCustomers) => state.customers.customers;
export const selectCustomerGroups = (state: RootStateWithCustomers) => state.customers.groups;
export const selectCustomerByName = (state: RootStateWithCustomers, name: string) =>
  state.customers.customers.find((c) => c.name === name);
export const selectCustomerGroupById = (state: RootStateWithCustomers, id: string) =>
  state.customers.groups.find((g) => g.id === id);

export default customersSlice.reducer;
