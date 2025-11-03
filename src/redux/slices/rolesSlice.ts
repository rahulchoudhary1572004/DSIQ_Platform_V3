import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../api/axios';
import { getRequest } from '../../api/apiHelper/getHelper';
import { getModuleIdByName } from '../../../utils/getModuleIdByName';
import type { RootState } from '../store';

type ArchiveFilter = 'active' | 'archived' | 'all';

type RawPermission = {
  module_name: string;
  permission: string;
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
  loading: false,
  error: null,
  archiveFilter: 'active',
};

const transformPermissions = (
  apiPermissions: Array<RawPermission | UpdateRolePermissionPayload> = []
): RolePermissionsMap => {
  return apiPermissions.reduce<RolePermissionsMap>((acc, perm) => {
    const moduleName =
      'module_name' in perm && perm.module_name
        ? perm.module_name
        : String(('module_id' in perm ? perm.module_id : undefined) ?? 'Unknown Module');

    const [create, read, update, archived] = perm.permission
      .split('')
      .map((char) => char === 'T');

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
      const moduleId = getModuleIdByName('User Management');
      if (!moduleId) {
        return rejectWithValue('Module ID for User Management not found');
      }

      const response = await getRequest(
        `/get-roles-with-permissions?module_id=${moduleId}&archived=${archived}`
      );

      const rolesData = normaliseRolesResponse(response);

      return rolesData.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description ?? 'No description provided',
        isArchived: role.is_archive ?? false,
        permissions: transformPermissions(role.permissions),
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load roles. Please try again later.';
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

export default rolesSlice.reducer;