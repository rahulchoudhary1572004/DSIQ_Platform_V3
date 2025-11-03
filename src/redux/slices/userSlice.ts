import { createSlice, createAsyncThunk, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../api/axios';
import { getModuleIdByName } from '../../../utils/getModuleIdByName';
import type { RootState } from '../store';

const moduleId = getModuleIdByName('User Management');

export interface UserRecord {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string | number;
  module_id?: string | number;
  password?: string;
  is_archive?: boolean;
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
  email: string;
  first_name: string;
  last_name: string;
  role_id: string | number;
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
      const usersModuleId = moduleId;
      if (!usersModuleId) {
        return rejectWithValue('Module ID for User Management not found');
      }

      const [activeUsersResponse, archivedUsersResponse] = await Promise.all([
        api
          .get(`/get-users?module_id=${usersModuleId}&archived=false`)
          .catch(() => ({ data: { data: [] } })),
        api
          .get(`/get-users?module_id=${usersModuleId}&archived=true`)
          .catch(() => ({ data: { data: [] } })),
      ]);

      return {
        active: (activeUsersResponse.data?.data ?? []) as UserRecord[],
        archived: (archivedUsersResponse.data?.data ?? []) as UserRecord[],
      };
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
  AddUserPayload,
  { rejectValue: string }
>(
  'users/addUser',
  async (userData, { rejectWithValue }) => {
    try {
      if (!moduleId) {
        return rejectWithValue('Module ID for User Management not found');
      }

      const payload = {
        email: userData.email,
        password: '12345',
        first_name: userData.first_name,
        last_name: userData.last_name,
        role_id: userData.role_id,
        module_id: moduleId,
      };

      const response = await api.post<{ data: UserRecord } | UserRecord>('/create-user', payload);
      const createdUser = (response.data && 'data' in response.data ? response.data.data : response.data) as UserRecord;
      return createdUser;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to add user';
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
      if (!moduleId) {
        return rejectWithValue('Module ID for User Management not found');
      }

      const payload = {
        id: userData.id,
        module_id: moduleId,
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