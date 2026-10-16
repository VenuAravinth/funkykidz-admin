import type { Location } from "@/types/location";

export const MAIN_STORE_ID = "loc_1";
export const BRANCH_2_ID = "loc_2";
export const BRANCH_3_ID = "loc_3";
export const WAREHOUSE_ID = "loc_4";

export const locations: Location[] = [
  { id: MAIN_STORE_ID, name: "Main Store", type: "store", city: "Coimbatore" },
  { id: BRANCH_2_ID, name: "Branch 2", type: "store", city: "Chennai" },
  { id: BRANCH_3_ID, name: "Branch 3", type: "store", city: "Bengaluru" },
  { id: WAREHOUSE_ID, name: "Central Warehouse", type: "warehouse", city: "Coimbatore" },
];
