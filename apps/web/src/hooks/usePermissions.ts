import { useAuth } from "../context/AuthContext";
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission } from "@vanta/shared";

export const usePermissions = () => {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    return hasPermission(user?.role, permission);
  };

  const canAll = (...permissions: Permission[]): boolean => {
    return hasAllPermissions(user?.role, permissions);
  };

  const canAny = (...permissions: Permission[]): boolean => {
    return hasAnyPermission(user?.role, permissions);
  };

  return {
    can,
    canAll,
    canAny,
    role: user?.role,
    isGuest: user?.role === "GUEST" || user?.isGuest === true,
    isAdmin: user?.role === "ADMIN"
  };
};
