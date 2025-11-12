import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import api from '../../api/axios';
import showToast from '../../../utils/toast';
import type { RootState } from '../store';

export interface ModuleSummary {
  id: number | string;
  name: string;
}

export interface CreateModulePayload {
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  created_by_id?: string;
  updated_by?: string;
  updated_by_id?: string;
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
      
      // Handle different response structures
      let rawModules: any[] = [];
      
      if (Array.isArray(response.data)) {
        rawModules = response.data;
      } else if (Array.isArray(response.data?.data)) {
        rawModules = response.data.data;
      } else if (response.data?.modules && Array.isArray(response.data.modules)) {
        rawModules = response.data.modules;
      } else {
        console.error('Unexpected modules response structure:', response.data);
        return rejectWithValue('Invalid response format from /modules endpoint');
      }

      // Map to consistent format, handling both 'name' and 'module_name' fields
      return rawModules.map((module: any) => ({
        id: module.id,
        name: module.name || module.module_name || 'Unknown Module',
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to fetch modules';
      console.error('Error fetching modules:', message, axiosError);
      return rejectWithValue(message);
    }
  }
);

export const createModule = createAsyncThunk<
  string,
  CreateModulePayload,
  { rejectValue: string }
>(
  'modules/create',
  async (moduleData, { rejectWithValue }) => {
    try {
      // Only send the name field as it's the only required field
      // Backend will auto-generate timestamps and user info
      const payload = {
        name: moduleData.name,
        ...(moduleData.created_at && { created_at: moduleData.created_at }),
        ...(moduleData.updated_at && { updated_at: moduleData.updated_at }),
        ...(moduleData.created_by && { created_by: moduleData.created_by }),
        ...(moduleData.created_by_id && { created_by_id: moduleData.created_by_id }),
        ...(moduleData.updated_by && { updated_by: moduleData.updated_by }),
        ...(moduleData.updated_by_id && { updated_by_id: moduleData.updated_by_id }),
      };
      
      const response = await api.post('/create-module', payload);
      
      // API returns a string response
      const message = typeof response.data === 'string' 
        ? response.data 
        : response.data?.message || 'Module created successfully';
      
      return message;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Failed to create module';
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
      })
      
      // Create Module
      .addCase(createModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action) => {
        state.loading = false;
        showToast.success(action.payload || 'Module created successfully');
      })
      .addCase(createModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create module';
        showToast.error(state.error);
      });
  },
});

export const { resetModules, setModules } = moduleSlice.actions;
export const selectModules = (state: RootState) => state.modules.list;
export const selectModulesLoading = (state: RootState) => state.modules.loading;
export const selectModulesError = (state: RootState) => state.modules.error;
export default moduleSlice.reducer;