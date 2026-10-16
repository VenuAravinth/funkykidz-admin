export type ActivityLogModule = "Sales" | "Inventory" | "Purchase" | "Finance" | "Security";

export interface ActivityLogDetail {
  product?: string;
  before?: string;
  after?: string;
  difference?: string;
  reason?: string;
}

export interface ActivityLog {
  id: string;
  dateTime: string;
  userId: string;
  userName: string;
  action: string;
  module: ActivityLogModule;
  reference?: string;
  detail?: ActivityLogDetail;
  device?: string;
}
