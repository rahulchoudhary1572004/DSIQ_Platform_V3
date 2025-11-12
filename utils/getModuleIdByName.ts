import { decodeJWT, type JwtPermission, type DecodedJWT } from "./jwtHelper";

/**
 * Returns the module ID for the given module name from the JWT token.
 * Adds defensive fallbacks because backend JWT structure may differ.
 * Acceptable permission collection keys: permissions | modules | module_permissions
 * Acceptable module name keys inside each permission object: module_name | name | module | moduleName
 */
export const getModuleIdByName = (moduleName: string): string | number | null => {
  const token = localStorage.getItem("authToken");
  if (!token || !moduleName) return null;

  try {
    const decoded = decodeJWT<DecodedJWT & { modules?: JwtPermission[]; module_permissions?: JwtPermission[] }>(token);
    if (!decoded) {
      console.warn("JWT decode returned null – invalid or empty token");
      return null;
    }

    // Resolve permissions array under multiple possible keys
    const permissionArray: unknown = decoded.permissions || decoded.modules || decoded.module_permissions;
    if (!Array.isArray(permissionArray)) {
      console.warn("No permissions/modules array found in JWT payload", decoded);
      return null;
    }

    // Normalize entries to inspect
    const normalized: Array<JwtPermission & Record<string, unknown>> = permissionArray as any[];

    const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[\s_-]+/g, "");
    const target = norm(moduleName);

    // First pass: normalized match across common name keys
    let match = normalized.find((perm) => {
      const candidates = [
        (perm as any).module_name,
        (perm as any).name,
        (perm as any).module,
        (perm as any).moduleName,
      ];
      return candidates.some((n) => norm(n) === target);
    });

    if (!match) {
      // Gate diagnostics behind debug flag to avoid noise in production
      const debug = typeof window !== 'undefined' && localStorage.getItem('debugApi') === 'true';
      if (debug && !(window as any).__printedModuleDiagnostic) {
        (window as any).__printedModuleDiagnostic = true;
        console.groupCollapsed("[Module Diagnostic] JWT permissions inspection");
        console.table(
          normalized.map((perm) => ({
            id: perm.id,
            module_name: (perm as any).module_name,
            name: (perm as any).name,
            module: (perm as any).module,
            moduleName: (perm as any).moduleName,
            permission: (perm as any).permission
          }))
        );
        console.groupEnd();
        console.warn(`Module '${moduleName}' not found in JWT permissions array. Using normalized comparison without spaces/underscores/dashes.`);
      }
      return null;
    }

    return (match as any).id ?? null;
  } catch (error) {
    console.error(`Failed to decode token or find module '${moduleName}':`, error);
    return null;
  }
};
