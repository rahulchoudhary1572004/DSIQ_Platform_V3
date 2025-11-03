import { useState, useEffect, useMemo, useCallback } from "react";
import type { ChangeEvent, FC } from "react";
import { Shield, Pencil, Check, AlertTriangle, ArchiveRestore, Loader2, Search } from "lucide-react";
import { MdArchive } from "react-icons/md";
import { Card, CardTitle, CardBody, CardSubtitle } from "@progress/kendo-react-layout";
import { useDebounce } from "use-debounce";
import { useSelector, useDispatch } from "react-redux";
import {
  updateRole,
  setArchiveFilter,
  fetchRoles,
  type Role,
  type RolePermissionsMap,
  type PermissionFlags,
  type UpdateRolePermissionPayload,
} from "../../redux/slices/rolesSlice";
import type { RootState, AppDispatch } from "../../redux/store";
import Pagination from "../Pagination";
import FloatingAddButton from "../../helper_Functions/FloatingAddButton";
import api from "../../api/axios";
import { getModuleIdByName } from "../../../utils/getModuleIdByName";
import { getRequest } from "../../api/apiHelper/getHelper";
import showToast from "../../../utils/toast";

interface RolesManagementProps {
  onCreateRole: () => void;
}

interface ModuleInfo {
  id: string | number;
  module_name: string;
}

type NameAvailability = boolean | null;
type PermissionAction = keyof PermissionFlags;
type EditableRole = Role;

const ITEMS_PER_PAGE = 3 as const;

const cloneRolePermissions = (permissions: RolePermissionsMap): RolePermissionsMap =>
  Object.fromEntries(
    Object.entries(permissions).map(([moduleName, perms]) => [moduleName, { ...perms }])
  ) as RolePermissionsMap;

const RolesManagement: FC<RolesManagementProps> = ({ onCreateRole }) => {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector<RootState, Role[]>((state) => state.roles.roles);
  const loading = useSelector<RootState, boolean>((state) => state.roles.loading);
  const rolesError = useSelector<RootState, string | null>((state) => state.roles.error);
  const archiveFilter = useSelector<RootState, "active" | "archived" | "all">(
    (state) => state.roles.archiveFilter
  );

  const [hoveredRoleId, setHoveredRoleId] = useState<Role["id"] | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<Role["id"] | null>(null);
  const [editedRole, setEditedRole] = useState<EditableRole | null>(null);
  const [nameError, setNameError] = useState<string>("");
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const [nameAvailability, setNameAvailability] = useState<NameAvailability>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [moduleMap, setModuleMap] = useState<Record<string, ModuleInfo["id"]>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [debouncedName] = useDebounce<string>(editedRole?.name ?? "", 500);
  const [debouncedSearchQuery] = useDebounce<string>(searchQuery, 300);

  const isProtectedRole = useCallback((roleName: string) => {
    const protectedRoles = ["admin", "standard_user"];
    return protectedRoles.includes(roleName.toLowerCase());
  }, []);

  const filteredRoles = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    return roles.filter((role) => {
      const matchesQuery = role.name.toLowerCase().includes(query);
      const matchesArchive =
        archiveFilter === "all" ||
        (archiveFilter === "active" ? !role.isArchived : role.isArchived);
      return matchesQuery && matchesArchive;
    });
  }, [roles, debouncedSearchQuery, archiveFilter]);

  const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRoles = useMemo(
    () => filteredRoles.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [filteredRoles, startIndex]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, archiveFilter]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modules = await getRequest<ModuleInfo[]>("/get-modules");
        const moduleMapping = modules.reduce<Record<string, ModuleInfo["id"]>>((map, module) => {
          map[module.module_name] = module.id;
          return map;
        }, {});
        setModuleMap(moduleMapping);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load modules. Using fallback module IDs.";
        setNameError(message);
      }
    };

    fetchModules().catch((error) => {
      console.error("Error fetching modules:", error);
    });
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const checkRoleNameAvailability = async () => {
      if (!debouncedName || editingRoleId === null) {
        return;
      }

      if (debouncedName.trim() === "") {
        setNameAvailability(null);
        setNameError("Role name cannot be empty");
        return;
      }

      if (debouncedName.length < 3) {
        setNameAvailability(false);
        setNameError("Role name must be at least 3 characters long");
        return;
      }

      const originalRole = roles.find((role) => role.id === editingRoleId);
      if (originalRole && debouncedName === originalRole.name) {
        setNameAvailability(true);
        setNameError("");
        return;
      }

      setIsCheckingName(true);
      try {
        const payload = { name: debouncedName.trim() };
        const response = await api.post<{ message?: string }>("/check-role", payload);
        const isAvailable = response.data.message !== "Role name already exists";
        setNameAvailability(isAvailable);
        setNameError(isAvailable ? "" : "This role name is already taken");
      } catch (error) {
        console.error("Error checking role name:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to check role name availability";
        setNameAvailability(false);
        setNameError(message);
      } finally {
        setIsCheckingName(false);
      }
    };

    void checkRoleNameAvailability();
  }, [debouncedName, editingRoleId, roles]);

  const startEditing = (roleId: Role["id"]) => {
    const roleToEdit = roles.find((role) => role.id === roleId);
    if (!roleToEdit) {
      return;
    }

    setEditedRole({
      ...roleToEdit,
      permissions: cloneRolePermissions(roleToEdit.permissions),
    });
    setEditingRoleId(roleId);
    setNameError("");
    setNameAvailability(true);
  };

  const handleRoleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;

    setEditedRole((prev) => (prev ? { ...prev, name: newName } : prev));

    if (!newName.trim()) {
      setNameAvailability(null);
      setNameError("Role name cannot be empty");
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = event.target.value;
    setEditedRole((prev) => (prev ? { ...prev, description: newDescription } : prev));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const transformPermissionsToBackend = useCallback(
    (permissions: RolePermissionsMap): UpdateRolePermissionPayload[] => {
      return Object.entries(permissions).map(([moduleName, perms]) => {
        const moduleId = moduleMap[moduleName] ?? getModuleIdByName(moduleName);
        return {
          module_id: moduleId ?? moduleName,
          permission: `${perms.create ? "T" : "F"}${perms.read ? "T" : "F"}${
            perms.update ? "T" : "F"
          }${perms.archived ? "T" : "F"}`,
        };
      });
    },
    [moduleMap]
  );

  const saveEditedRole = async () => {
    if (!editedRole || editingRoleId === null) {
      return;
    }

    if (!editedRole.name.trim()) {
      setNameError("Role name cannot be empty");
      return;
    }

    if (!nameAvailability) {
      setNameError("This role name is invalid or already taken");
      return;
    }

    const moduleId = moduleMap["User Management"] ?? getModuleIdByName("User Management");
    if (moduleId === null) {
      setNameError("User Management module ID not found");
      return;
    }

    try {
      await dispatch(
        updateRole({
          id: editingRoleId,
          module_id: moduleId,
          name: editedRole.name.trim(),
          description: editedRole.description || "",
          permissions: transformPermissionsToBackend(editedRole.permissions),
          is_archive: editedRole.isArchived,
        })
      ).unwrap();

      setEditingRoleId(null);
      setEditedRole(null);
      setNameError("");
      setNameAvailability(null);

      await dispatch(fetchRoles(archiveFilter === "archived")).unwrap();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update role";
      setNameError(message);
    }
  };

  const cancelEditing = () => {
    setEditingRoleId(null);
    setEditedRole(null);
    setNameError("");
    setNameAvailability(null);
    setIsCheckingName(false);
  };

  const togglePermission = useCallback(
    (category: keyof RolePermissionsMap, action: PermissionAction) => {
      setEditedRole((prev) => {
        if (!prev) {
          return prev;
        }

        const categoryPermissions = prev.permissions[category];
        if (!categoryPermissions) {
          return prev;
        }

        return {
          ...prev,
          permissions: {
            ...prev.permissions,
            [category]: {
              ...categoryPermissions,
              [action]: !categoryPermissions[action],
            },
          },
        };
      });
    },
    []
  );

  const toggleArchiveRole = async (roleId: Role["id"]) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) {
      return;
    }

    const newArchiveStatus = !role.isArchived;
    const moduleId = moduleMap["User Management"] ?? getModuleIdByName("User Management");

    if (moduleId === null) {
      showToast.error("User Management module ID not found", { autoClose: 5000 });
      return;
    }

    try {
      await dispatch(
        updateRole({
          id: roleId,
          module_id: moduleId,
          name: role.name,
          description: role.description || "",
          permissions: transformPermissionsToBackend(role.permissions),
          is_archive: newArchiveStatus,
        })
      ).unwrap();

      showToast.success(
        `Role "${role.name}" has been ${newArchiveStatus ? "archived" : "restored"} successfully.`,
        { autoClose: 5000 }
      );

      await dispatch(fetchRoles(archiveFilter === "archived")).unwrap();
      dispatch(setArchiveFilter(newArchiveStatus ? "archived" : "active"));
      setCurrentPage(1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to ${newArchiveStatus ? "archive" : "restore"} role "${role.name}"`;
      showToast.error(message, { autoClose: 5000 });
    }
  };

  const renderPermissionLetters = (permissions: RolePermissionsMap) => {
    return Object.entries(permissions).map(([category, actions]) => (
      <div key={category} className="mb-1 last:mb-0">
        <h4 className="text-sm font-medium mb-1 text-gray-600">{category}</h4>
        <div className="flex space-x-1">
          {Object.entries(actions).map(([action, enabled]) => (
            <span
              key={`${category}-${action}`}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                enabled ? "bg-green-100 text-green-800" : "bg-red-50 text-red-400"
              }`}
              title={`${action.toUpperCase()} permission ${enabled ? "enabled" : "disabled"}`}
            >
              {action.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    ));
  };

  const renderEditablePermissions = (permissions: RolePermissionsMap) => {
    const actions: PermissionAction[] = ["create", "read", "update", "archived"];

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Module</th>
              {actions.map((action) => (
                <th key={action} className="px-4 py-2 text-center text-sm font-medium text-gray-600 capitalize">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissions).map(([category, perms]) => (
              <tr key={category}>
                <td className="px-4 py-2 text-sm text-gray-700">{category}</td>
                {actions.map((action) => (
                  <td key={`${category}-${action}`} className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={perms[action]}
                      onChange={() => togglePermission(category, action)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="relative punion p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Roles Management</h2>
      <p className="text-gray-600 mb-6">
        Review existing roles and their assigned permissions. Create new roles or modify existing ones.
      </p>

      {loading && <div className="text-gray-600">Loading roles...</div>}
      {rolesError && <div className="text-red-600">{rolesError}</div>}

      {!loading && !rolesError && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="relative w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search role name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange text-sm"
                aria-label="Search roles"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => {
                  dispatch(setArchiveFilter("active"));
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  archiveFilter === "active"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Active Roles
              </button>
              <button
                onClick={() => {
                  dispatch(setArchiveFilter("archived"));
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium ${
                  archiveFilter === "archived"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Archived Roles
              </button>
            </div>
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-gray-600 text-center py-4">
              No {archiveFilter === "active" ? "active" : "archived"} roles found matching your search.
            </div>
          )}

          <div className="space-y-4 mb-16">
            {paginatedRoles.map((role) => (
              <div
                key={role.id}
                onMouseEnter={() => setHoveredRoleId(role.id)}
                onMouseLeave={() => setHoveredRoleId(null)}
                className="relative"
              >
                <Card className={`w-full ${role.isArchived ? "opacity-70" : ""}`}>
                  <div
                    className={`k-card-header border-b ${
                      role.isArchived ? "bg-gray-100" : "bg-gray-50"
                    } flex justify-between items-center p-4 relative`}
                  >
                    {editingRoleId === role.id ? (
                      <div className="w-full space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={editedRole?.name || ""}
                            onChange={handleRoleNameChange}
                            className={`w-full text-xl font-medium text-gray-800 mb-2 p-1 border rounded ${
                              nameError ? "border-red-500" : "border-gray-300"
                            }`}
                            aria-describedby="name-validation"
                            placeholder="Role name"
                          />
                          {isCheckingName && (
                            <div className="absolute right-3 top-2.5">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            </div>
                          )}
                          {nameError && (
                            <div className="absolute right-0 top-0 flex items-center h-full pr-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                        </div>
                        <div id="name-validation" className="mt-1">
                          {nameError && <p className="text-xs text-red-500">{nameError}</p>}
                          {editedRole?.name.trim() &&
                            nameAvailability === true &&
                            !nameError && (
                              <p className="text-xs text-green-600">Name is available</p>
                            )}
                        </div>
                        <textarea
                          value={editedRole?.description || ""}
                          onChange={handleDescriptionChange}
                          className="w-full text-sm text-gray-600 p-1 border border-gray-300 rounded"
                          placeholder="Role description"
                          rows={3}
                        />
                      </div>
                    ) : (
                      <div>
                        <CardTitle className="!text-xl font-medium text-gray-800 mb-1">
                          {role.name}
                          {role.isArchived && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                              Archived
                            </span>
                          )}
                        </CardTitle>
                        <CardSubtitle className="!text-sm text-gray-600">
                          {role.description || "No description provided"}
                        </CardSubtitle>
                      </div>
                    )}
                    <Shield
                      className={`h-6 w-6 ${role.isArchived ? "text-gray-400" : "text-gray-500"}`}
                    />
                    {hoveredRoleId === role.id && editingRoleId !== role.id && !isProtectedRole(role.name) && (
                      <div
                        className="absolute top-5 right-14 flex space-x-2 z-10"
                        style={{ pointerEvents: "auto" }}
                      >
                        {!role.isArchived && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              startEditing(role.id);
                            }}
                            className="p-1 bg-white rounded-full shadow-md text-blue-600 hover:text-blue-800 transition-colors"
                            aria-label={`Edit role ${role.name}`}
                            title="Edit role"
                          >
                            <Pencil size={20} />
                          </button>
                        )}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            void toggleArchiveRole(role.id);
                          }}
                          className="p-1 bg-white rounded-full shadow-md text-red-600 hover:text-red-800 transition-colors"
                          aria-label={
                            role.isArchived
                              ? `Restore role ${role.name}`
                              : `Archive role ${role.name}`
                          }
                          title={role.isArchived ? "Restore role" : "Archive role"}
                        >
                          {role.isArchived ? <ArchiveRestore size={18} /> : <MdArchive size={20} />}
                        </button>
                      </div>
                    )}
                  </div>
                  <CardBody>
                    <h4 className="text-sm font-medium k-mb-1 mb-3 text-gray-900">Permissions</h4>
                    {editingRoleId === role.id ? (
                      <div className="space-y-4">
                        {editedRole && renderEditablePermissions(editedRole.permissions)}
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEditedRole}
                            className={`px-3 py-1 text-sm text-white rounded flex items-center ${
                              nameAvailability === false || nameError
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            disabled={nameAvailability === false || !!nameError}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="k-d-flex k-gap-5 !k-flex-wrap">
                        {renderPermissionLetters(role.permissions)}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </>
      )}
      <FloatingAddButton onClick={onCreateRole} label="Create Role" icon={Shield} />
    </div>
  );
};

export default RolesManagement;
