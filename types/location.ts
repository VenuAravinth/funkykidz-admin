export type LocationType = "store" | "warehouse";

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  city: string;
}
