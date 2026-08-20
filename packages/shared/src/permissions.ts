import { Role, Permission } from "./enums.js";

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [Role.ADMIN]: [
    Permission.USER_MANAGE,
    Permission.ROLE_MANAGE,
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
    Permission.CUSTOMER_DELETE,
    Permission.FOLLOWUP_CREATE,
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.STOCK_VIEW,
    Permission.STOCK_CREATE,
    Permission.CHALLAN_VIEW,
    Permission.CHALLAN_CREATE,
    Permission.CHALLAN_UPDATE,
    Permission.CHALLAN_CONFIRM,
    Permission.CHALLAN_CANCEL,
    Permission.INVOICE_VIEW,
    Permission.INVOICE_CREATE,
    Permission.INVOICE_UPDATE,
    Permission.REPORT_VIEW,
    Permission.DASHBOARD_VIEW,
    Permission.AUDIT_VIEW
  ],

  [Role.SALES]: [
    Permission.CUSTOMER_VIEW,
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
    Permission.FOLLOWUP_CREATE,
    Permission.PRODUCT_VIEW,
    Permission.STOCK_VIEW,
    Permission.CHALLAN_VIEW,
    Permission.CHALLAN_CREATE,
    Permission.CHALLAN_UPDATE,
    Permission.CHALLAN_CONFIRM,
    Permission.INVOICE_VIEW,
    Permission.REPORT_VIEW,
    Permission.DASHBOARD_VIEW
  ],

  [Role.WAREHOUSE]: [
    Permission.CUSTOMER_VIEW,
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.STOCK_VIEW,
    Permission.STOCK_CREATE,
    Permission.CHALLAN_VIEW,
    Permission.REPORT_VIEW,
    Permission.DASHBOARD_VIEW
  ],

  [Role.ACCOUNTS]: [
    Permission.CUSTOMER_VIEW,
    Permission.FOLLOWUP_CREATE,
    Permission.PRODUCT_VIEW,
    Permission.STOCK_VIEW,
    Permission.CHALLAN_VIEW,
    Permission.INVOICE_VIEW,
    Permission.INVOICE_CREATE,
    Permission.INVOICE_UPDATE,
    Permission.REPORT_VIEW,
    Permission.DASHBOARD_VIEW
  ],

  // Guest: Read-only access across standard business views. Zero mutation authority.
  [Role.GUEST]: [
    Permission.CUSTOMER_VIEW,
    Permission.PRODUCT_VIEW,
    Permission.STOCK_VIEW,
    Permission.CHALLAN_VIEW,
    Permission.INVOICE_VIEW,
    Permission.REPORT_VIEW,
    Permission.DASHBOARD_VIEW
  ]
};

export const hasPermission = (role: Role | undefined | null, permission: Permission): boolean => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
};

export const hasAllPermissions = (
  role: Role | undefined | null,
  permissions: Permission[]
): boolean => {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
};

export const hasAnyPermission = (
  role: Role | undefined | null,
  permissions: Permission[]
): boolean => {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
};

export const getPermissionsForRole = (role: Role | undefined | null): readonly Permission[] => {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
};
