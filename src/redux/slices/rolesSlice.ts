import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../api/axios';
import { getRequest } from '../../api/apiHelper/getHelper';
import { getModuleIdByName } from '../../../utils/getModuleIdByName';
import showToast from '../../../utils/toast';
import type { RootState } from '../store';

type ArchiveFilter = 'active' | 'archived' | 'all';

type RawPermission = {
  module_name?: string;
  module_id?: string | number;
  // legacy compact string e.g., 'TFTF'
  permission?: string;
  // new explicit flags
  can_create?: boolean;
  can_read?: boolean;
  can_update?: boolean;
  can_archive?: boolean;
};

export type UpdateRolePermissionPayload = {
  module_id: string | number | null;
  permission: string;
};

type RoleApiResponse = {
  id: string | number;
  name: string;
  description?: string | null;
  is_archive?: boolean;
  permissions: RawPermission[];
};

export interface PermissionFlags {
  create: boolean;
  read: boolean;
  update: boolean;
  archived: boolean;
}

export type RolePermissionsMap = Record<string, PermissionFlags>;

export interface Role {
  id: string | number;
  name: string;
  description: string;
  isArchived: boolean;
  permissions: RolePermissionsMap;
}

interface RolesState {
  roles: Role[];
  selectedRolePermissions: RolePermissionsMap | null;
  loading: boolean;
  error: string | null;
  archiveFilter: ArchiveFilter;
}

interface CreateRolePermissionPayload extends RawPermission {}

interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: CreateRolePermissionPayload[];
}

interface CreateRoleWithPermissionsPayload {
  role: {
    name: string;
    organization_id: string;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    created_by_id?: string;
    updated_by?: string;
    updated_by_id?: string;
  };
  permissions: Array<{
    module_id: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_archive: boolean;
    created_by?: string;
    created_by_id?: string;
    updated_by?: string;
    updated_by_id?: string;
  }>;
}

interface CreateRoleResponse {
  message?: string;
  role?: { id: string | number };
  data?: RoleApiResponse;
}

interface UpdateRolePayload {
  id: string | number;
  module_id: string | number;
  name: string;
  description?: string;
  permissions: UpdateRolePermissionPayload[];
  is_archive: boolean;
}

interface UpdateRoleResponse {
  message?: string;
  data?: RoleApiResponse;
}

const initialState: RolesState = {
  roles: [],
  selectedRolePermissions: null,
  loading: false,
  error: null,
  archiveFilter: 'active',
};

const transformPermissions = (
  apiPermissions: Array<RawPermission | UpdateRolePermissionPayload> = []
): RolePermissionsMap => {
  const norm = (s: unknown) => String(s ?? '').replace(/_/g, ' ');
  return apiPermissions.reduce<RolePermissionsMap>((acc, perm) => {
    const moduleNameRaw = (perm as any).module_name ?? (perm as any).module ?? (perm as any).name ?? (perm as any).module_id ?? 'Unknown Module';
    const moduleName = norm(moduleNameRaw as string);

    let create = false,
      read = false,
      update = false,
      archived = false;

    if ((perm as any).permission) {
      const bits = String((perm as any).permission).split('');
      [create, read, update, archived] = bits.map((c) => c === 'T') as [boolean, boolean, boolean, boolean];
    } else {
      create = Boolean((perm as any).can_create);
      read = Boolean((perm as any).can_read);
      update = Boolean((perm as any).can_update);
      archived = Boolean((perm as any).can_archive);
    }

    acc[moduleName] = { create, read, update, archived };
    return acc;
  }, {});
};

const normaliseRolesResponse = (response: unknown): RoleApiResponse[] => {
  if (Array.isArray(response)) {
    return response as RoleApiResponse[];
  }

  if (response && typeof response === 'object') {
    const typedResponse = response as {
      roles?: RoleApiResponse[];
      data?: RoleApiResponse[];
      message?: string;
    };

    if (Array.isArray(typedResponse.roles)) {
      return typedResponse.roles;
    }

    if (Array.isArray(typedResponse.data)) {
      return typedResponse.data;
    }

    if (typedResponse.message) {
      throw new Error(typedResponse.message);
    }

    if (Object.keys(typedResponse).length === 0) {
      return [];
    }
  }

  throw new Error('Unexpected response format while fetching roles');
};

export const fetchRoles = createAsyncThunk<
  Role[],
  boolean,
  { rejectValue: string }
>(
  'roles/fetchRoles',
  async (archived, { rejectWithValue }) => {
    try {
      // Use /roles (org-level) then enrich each with /role-permissions/{role_id}
      const rolesResp = await api.get('/roles');

      const rolesData = normaliseRolesResponse(rolesResp.data);

      const filtered = rolesData.filter((r) => (r.is_archive ?? false) === archived);

      // Fetch permissions per role in parallel
      const withPerms = await Promise.all(
        filtered.map(async (r) => {
          try {
            const permResp = await api.get(`/role-permissions/${r.id}`);
            const perms = permResp.data?.role?.permissions ||
                        (Array.isArray(permResp.data)
                          ? permResp.data
                          : Array.isArray(permResp.data?.data)
                            ? permResp.data.data
                            : permResp.data?.permissions || []);
            return {
              id: r.id,
              name: r.name,
              description: r.description ?? 'No description provided',
              isArchived: r.is_archive ?? false,
              permissions: transformPermissions(perms),
            } as Role;
          } catch {
            // If permissions endpoint not ready, still return role with empty perms
            return {
              id: r.id,
              name: r.name,
              description: r.description ?? 'No description provided',
              isArchived: r.is_archive ?? false,
              permissions: transformPermissions([]),
            } as Role;
          }
        })
      );

      return withPerms;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to load roles. Please try again later.';
      return rejectWithValue(message);
    }
  }
);

export const fetchRolesByOrganization = createAsyncThunk<
  Role[],
  void,
  { rejectValue: string }
>(
  'roles/fetchRolesByOrganization',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/roles');

      const rolesData = normaliseRolesResponse(response.data);

      return rolesData.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description ?? 'No description provided',
        isArchived: role.is_archive ?? false,
        permissions: transformPermissions(role.permissions),
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Failed to load roles by organization. Please try again later.';
      return rejectWithValue(message);
    }
  }
);

export const fetchPermissionsByRole = createAsyncThunk<
  RolePermissionsMap,
  string | number,
  { rejectValue: string }
>(
  'roles/fetchPermissionsByRole',
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/role-permissions/${roleId}`);
      
      // Handle response - could be array of permissions or nested data
      const permissions = response.data?.role?.permissions || 
                        (Array.isArray(response.data)
                          ? response.data
                          : Array.isArray(response.data?.data)
                            ? response.data.data
                            : response.data?.permissions || []);

      return transformPermissions(permissions);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Failed to load permissions for role. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const createRole = createAsyncThunk<
  Role,
  CreateRolePayload,
  { rejectValue: string }
>(
  'roles/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await api.post<CreateRoleResponse>('/create-role', roleData);
      if (response.data.message === 'Role created successfully') {
        return {
          id: response.data.role?.id ?? Date.now().toString(),
          name: roleData.name,
          description: roleData.description ?? 'No description provided',
          isArchived: false,
          permissions: transformPermissions(roleData.permissions),
        };
      }

      return rejectWithValue(response.data.message ?? 'Failed to create role');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Failed to create role. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const createRoleWithPermissions = createAsyncThunk<
  string,
  CreateRoleWithPermissionsPayload,
  { rejectValue: string }
>(
  'roles/createRoleWithPermissions',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/create-role-with-permissions', payload);
      return response.data ?? 'Role with permissions created successfully';
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Failed to create role with permissions. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const updateRole = createAsyncThunk<
  Role,
  UpdateRolePayload,
  { rejectValue: string }
>(
  'roles/updateRole',
  async ({ id, module_id, name, description, permissions, is_archive }, { rejectWithValue }) => {
    try {
      const payload: UpdateRolePayload = {
        id,
        module_id,
        name,
        description,
        permissions,
        is_archive,
      };

      const response = await api.post<UpdateRoleResponse>('/update-role', payload);
      if (response.data.message === 'Role updated successfully') {
        const roleData = response.data.data ?? {
          id,
          name,
          description,
          is_archive,
          permissions,
        };

        return {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description ?? 'No description provided',
          isArchived: roleData.is_archive ?? is_archive,
          permissions: transformPermissions(roleData.permissions ?? []),
        };
      }

      return rejectWithValue(response.data.message ?? 'Failed to update role');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? 'Failed to update role. Please try again.';
      return rejectWithValue(message);
    }
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setArchiveFilter: (state, action: PayloadAction<ArchiveFilter>) => {
      state.archiveFilter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
        localStorage.setItem('roles', JSON.stringify(action.payload));
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load roles. Please try again later.';
        state.roles = [];
      })
      
      // Fetch Roles by Organization
      .addCase(fetchRolesByOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolesByOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
        localStorage.setItem('roles', JSON.stringify(action.payload));
      })
      .addCase(fetchRolesByOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load roles by organization. Please try again later.';
        state.roles = [];
      })
      
      // Fetch Permissions by Role
      .addCase(fetchPermissionsByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissionsByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRolePermissions = action.payload;
      })
      .addCase(fetchPermissionsByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load permissions for role. Please try again.';
        state.selectedRolePermissions = null;
      })
      
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload);
        localStorage.setItem('roles', JSON.stringify(state.roles));
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create role. Please try again.';
      })
      
      // Create Role with Permissions
      .addCase(createRoleWithPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoleWithPermissions.fulfilled, (state, action) => {
        state.loading = false;
        showToast.success(action.payload || 'Role with permissions created successfully');
      })
      .addCase(createRoleWithPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create role with permissions. Please try again.';
        showToast.error(state.error);
      })
      
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.map((role) =>
          role.id === action.payload.id ? action.payload : role
        );
        localStorage.setItem('roles', JSON.stringify(state.roles));
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update role. Please try again.';
      });
  },
});

export const { setArchiveFilter, clearError } = rolesSlice.actions;

export const selectRoles = (state: RootState) => state.roles.roles;
export const selectRolesLoading = (state: RootState) => state.roles.loading;
export const selectRolesError = (state: RootState) => state.roles.error;
export const selectRolesArchiveFilter = (state: RootState) => state.roles.archiveFilter;
export const selectSelectedRolePermissions = (state: RootState) => state.roles.selectedRolePermissions;

export default rolesSlice.reducer;