import { createSlice, createAsyncThunk, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../api/axios';
import { getModuleIdByName } from '../../../utils/getModuleIdByName';
import type { RootState } from '../store';
import toast from '../../../utils/toast';

export interface UserRecord {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string | number;
  module_id?: string | number;
  password?: string;
  is_active?: boolean;
  is_archive?: boolean;
  is_verified?: boolean;
  phone?: string;
  gender?: string;
  profile_photo_url?: string;
  dob?: string; // Format: YYYY-MM-DD
  [key: string]: unknown;
}

interface UsersState {
  activeUsers: UserRecord[];
  archivedUsers: UserRecord[];
  loading: boolean;
  error: string | null;
}

interface FetchUsersResponse {
  active: UserRecord[];
  archived: UserRecord[];
}

interface AddUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_active: boolean;
  is_archive: boolean;
  is_verified: boolean;
  phone: string;
  gender: string;
  profile_photo_url: string;
  dob: string; // Format: YYYY-MM-DD
  role_id: string;
}

interface ToggleArchivePayload extends Partial<UserRecord> {
  id: string | number;
  is_archive: boolean;
  role_id: string | number;
}

const initialState: UsersState = {
  activeUsers: [],
  archivedUsers: [],
  loading: false,
  error: null,
};

const buildErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

// Async thunk to fetch all users
export const fetchUsers = createAsyncThunk<
  FetchUsersResponse,
  void,
  { rejectValue: string }
>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // Resolve module ID at runtime; fallback to /modules if not present in JWT
      let usersModuleId = getModuleIdByName('User Management');
      if (!usersModuleId) {
        try {
          const modResp = await api.get('/modules');
          const raw = Array.isArray(modResp.data)
            ? modResp.data
            : Array.isArray(modResp.data?.data)
              ? modResp.data.data
              : modResp.data?.modules || [];
          const norm = (s: unknown) => String(s ?? '').toLowerCase().replace(/[\s_-]+/g, '');
          const target = norm('User Management');
          const match = (raw as any[]).find((m) => norm(m?.name ?? m?.module_name) === target);
          usersModuleId = match?.id ?? null;
          try { localStorage.setItem('modules', JSON.stringify(raw)); } catch {}
        } catch (e) {
          // ignore; will reject below
        }
      }
      if (!usersModuleId) return rejectWithValue('Module ID for User Management not found');

      const response = await api.get('/me');
      const user = response.data.user as UserRecord;

      // The /me endpoint returns only the current user.
      // We will place this single user into the active list.
      // To get a full list of all users, a different API endpoint is needed.
      const active = user && !user.is_archive ? [user] : [];
      const archived = user && user.is_archive ? [user] : [];

      return { active, archived };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? buildErrorMessage(error, 'Failed to fetch users');
      return rejectWithValue(message);
    }
  }
);

// Add a new user
export const addUser = createAsyncThunk<
  UserRecord,
  Partial<AddUserPayload>,
  { rejectValue: string }
>(
  'users/addUser',
  async (userData, { rejectWithValue }) => {
    try {
      const payload = {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        password: userData.password || '',
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        is_archive: userData.is_archive !== undefined ? userData.is_archive : false,
        is_verified: userData.is_verified !== undefined ? userData.is_verified : false,
        phone: userData.phone || '',
        gender: userData.gender || '',
        profile_photo_url: userData.profile_photo_url || '',
        dob: userData.dob || '',
        role_id: userData.role_id || '',
      };

      const response = await api.post<{ data: UserRecord } | UserRecord>('/create-user', payload);
      const createdUser = (response.data && 'data' in response.data ? response.data.data : response.data) as UserRecord;
      toast.success('User created successfully');
      return createdUser;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to add user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update user (including archive/unarchive and other updates)
export const toggleArchiveUser = createAsyncThunk<
  { user: UserRecord; is_archive: boolean },
  ToggleArchivePayload,
  { rejectValue: string }
>(
  'users/toggleArchive',
  async (userData, { rejectWithValue }) => {
    try {
      // Resolve module ID at runtime; fallback to /modules if not present in JWT
      let usersModuleId = getModuleIdByName('User Management');
      if (!usersModuleId) {
        try {
          const modResp = await api.get('/modules');
          const raw = Array.isArray(modResp.data)
            ? modResp.data
            : Array.isArray(modResp.data?.data)
              ? modResp.data.data
              : modResp.data?.modules || [];
          const norm = (s: unknown) => String(s ?? '').toLowerCase().replace(/[\s_-]+/g, '');
          const target = norm('User Management');
          const match = (raw as any[]).find((m) => norm(m?.name ?? m?.module_name) === target);
          usersModuleId = match?.id ?? null;
          try { localStorage.setItem('modules', JSON.stringify(raw)); } catch {}
        } catch (e) {
          // ignore; will reject below
        }
      }
      if (!usersModuleId) return rejectWithValue('Module ID for User Management not found');

      const payload = {
        id: userData.id,
        module_id: usersModuleId,
        password: userData.password,
        is_archive: userData.is_archive,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role_id: userData.role_id,
      };

      const response = await api.post<{ data: UserRecord } | UserRecord>('/update-user', payload);
      const updatedUser = (response.data && 'data' in response.data ? response.data.data : response.data) as UserRecord;
      return { user: updatedUser, is_archive: Boolean(userData.is_archive) };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to update user';
      return rejectWithValue(message);
    }
  }
);

export const assignRole = createAsyncThunk<
  UserRecord,
  { userId: string | number; roleId: string | number },
  { rejectValue: string }
>(
  'users/assignRole',
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      const response = await api.post<{ data: UserRecord } | UserRecord>('/assign-role', {
        user_id: userId,
        role_id: roleId,
      });
      const updatedUser = (response.data && 'data' in response.data ? response.data.data : response.data) as UserRecord;
      toast.success('Role assigned successfully');
      return updatedUser;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to assign role';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUsers: (state, action: PayloadAction<FetchUsersResponse>) => {
      state.activeUsers = action.payload.active;
      state.archivedUsers = action.payload.archived;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.activeUsers = action.payload.active ?? [];
        state.archivedUsers = action.payload.archived ?? [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch users';
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.activeUsers.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to add user';
      })
      .addCase(toggleArchiveUser.fulfilled, (state, action) => {
        const { user, is_archive } = action.payload;

        if (is_archive) {
          state.activeUsers = state.activeUsers.filter((u) => u.id !== user.id);
          state.archivedUsers = state.archivedUsers.filter((u) => u.id !== user.id);
          state.archivedUsers.push(user);
        } else {
          state.archivedUsers = state.archivedUsers.filter((u) => u.id !== user.id);
          state.activeUsers = state.activeUsers.filter((u) => u.id !== user.id);
          state.activeUsers.push(user);
        }
      })
      .addCase(toggleArchiveUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update user';
      })
      .addCase(assignRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const updateUser = (users: UserRecord[]) =>
          users.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user));

        state.activeUsers = updateUser(state.activeUsers);
        state.archivedUsers = updateUser(state.archivedUsers);
      })
      .addCase(assignRole.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to assign role';
      });
  },
});

export const { clearError, setUsers } = userSlice.actions;

export const selectActiveUsers = (state: RootState) => state.users.activeUsers;
export const selectArchivedUsers = (state: RootState) => state.users.archivedUsers;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;

export const selectAllUsers = createSelector(
  [selectActiveUsers, selectArchivedUsers],
  (active, archived) => [...active, ...archived]
);

export const selectUsersByModule = createSelector(
  [selectAllUsers, (_: RootState, moduleIdParam: string | number | undefined) => moduleIdParam],
  (allUsers, moduleIdParam) =>
    moduleIdParam != null ? allUsers.filter((user) => user.module_id === moduleIdParam) : allUsers
);

export default userSlice.reducer;