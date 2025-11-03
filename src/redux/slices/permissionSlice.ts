import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { decodeJWT, type JwtPermission } from '../../../utils/jwtHelper';

export interface PermissionSummary {
  id: number | string;
  permission: string;
  module_name: string;
}

interface PermissionsState {
  list: PermissionSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  list: [],
  loading: false,
  error: null,
};

export const initializePermissions = createAsyncThunk<
  PermissionSummary[],
  void,
  { state: RootState; rejectValue: string }
>(
  'permissions/initialize',
  async (_, { getState, rejectWithValue }) => {
    const token = localStorage.getItem('authToken') ?? getState().auth.accessToken;
    if (!token) {
      return rejectWithValue('No access token found');
    }

    const decoded = decodeJWT<{ permissions?: JwtPermission[] }>(token);
    if (!decoded?.permissions) {
      return rejectWithValue('No permissions found in token');
    }

    return decoded.permissions.map((perm) => ({
      id: perm.id,
      permission: perm.permission,
      module_name: perm.module_name,
    }));
  }
);

const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    resetPermissions: (state) => {
      state.list = [];
      state.error = null;
    },
    setPermissions: (state, action: PayloadAction<PermissionSummary[]>) => {
      state.list = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializePermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(initializePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to initialise permissions';
      });
  },
});

export const { resetPermissions, setPermissions } = permissionSlice.actions;
export const selectPermissions = (state: RootState) => state.permissions.list;
export const selectPermissionsLoading = (state: RootState) => state.permissions.loading;
export const selectPermissionsError = (state: RootState) => state.permissions.error;
export default permissionSlice.reducer;