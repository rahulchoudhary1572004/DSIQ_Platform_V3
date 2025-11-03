import { decodeJWT, type JwtPermission } from "./jwtHelper";

/**
 * Returns the module ID for the given module name from the JWT token.
 */
export const getModuleIdByName = (moduleName: string): string | number | null => {
  const token = localStorage.getItem("authToken");
  if (!token || !moduleName) return null;

  try {
    const decoded = decodeJWT<{ permissions?: JwtPermission[] }>(token);
    const modulePermission = decoded?.permissions?.find(
      (perm) => perm.module_name === moduleName
    );
    return modulePermission?.id ?? null;
  } catch (error) {
    console.error(`Failed to decode token or find module "${moduleName}":`, error);
    return null;
  }
};
