export type PermissionModuleKey = "sales" | "inventory" | "purchase" | "finance";

export interface PermissionItem {
  key: string;
  label: string;
}

export interface PermissionGroup {
  key: PermissionModuleKey;
  label: string;
  items: PermissionItem[];
}

export type RoleStatus = "active" | "inactive";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissionKeys: string[];
  status: RoleStatus;
  createdDate: string;
}
