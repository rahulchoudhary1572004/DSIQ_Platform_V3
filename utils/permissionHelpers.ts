export interface ModulePermission {
  module_name: string;
  permission: string | null;
  [key: string]: unknown;
}

// Check if user has access to a specific module
export const hasModuleAccess = (moduleName: string, permissions: ModulePermission[] = []): boolean => {
  if (!moduleName) return false;
  return permissions.some((perm) => perm.module_name === moduleName);
};

// Get all unique module names from permissions
export const getAllPermittedModules = (permissions: ModulePermission[] = []): string[] => {
  return [...new Set(permissions.map((perm) => perm.module_name))];
};

// Get permission string for a specific module
export const getModulePermission = (
  moduleName: string,
  permissions: ModulePermission[] = []
): string | null => {
  if (!moduleName) return null;
  const modulePerm = permissions.find((perm) => perm.module_name === moduleName);
  return modulePerm?.permission ?? null;
};