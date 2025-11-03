import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../api/axios';
import type { RootState } from '../store';

export interface ModuleSummary {
  id: number | string;
  name: string;
}

export interface ModulesState {
  list: ModuleSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: ModulesState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchModules = createAsyncThunk<
  ModuleSummary[],
  void,
  { rejectValue: string }
>(
  'modules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/modules');
      const rawModules = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

      return rawModules.map((module: { id: number | string; name: string }) => ({
        id: module.id,
        name: module.name,
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to fetch modules';
      return rejectWithValue(message);
    }
  }
);

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    resetModules: (state) => {
      state.list = [];
      state.error = null;
    },
    setModules: (state, action: PayloadAction<ModuleSummary[]>) => {
      state.list = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch modules';
      });
  },
});

export const { resetModules, setModules } = moduleSlice.actions;
export const selectModules = (state: RootState) => state.modules.list;
export const selectModulesLoading = (state: RootState) => state.modules.loading;
export const selectModulesError = (state: RootState) => state.modules.error;
export default moduleSlice.reducer;