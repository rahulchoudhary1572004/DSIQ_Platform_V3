import { createSlice, createAsyncThunk, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import axios from '../../api/axios';
import { getModuleIdByName } from '../../../utils/getModuleIdByName';
import type { RootState } from '../store';

const moduleId = getModuleIdByName('Workspace');

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface WorkspaceRecord {
  id: string | number;
  name?: string;
  is_archive?: boolean;
  [key: string]: unknown;
}

export interface WorkspaceProduct {
  id: string | number;
  [key: string]: unknown;
}

interface FetchWorkspacesResponse {
  active: WorkspaceRecord[];
  archived: WorkspaceRecord[];
}

interface WorkspaceViewState {
  activeWorkspaces: WorkspaceRecord[];
  archivedWorkspaces: WorkspaceRecord[];
  currentWorkspace: WorkspaceRecord | null;
  status: AsyncStatus;
  error: string | null;
  workspaceDetail: WorkspaceRecord | null;
  detailStatus: AsyncStatus;
  detailError: string | null;
  updateStatus: AsyncStatus;
  updateError: string | null;
  archiveStatus: AsyncStatus;
  archiveError: string | null;
  products: WorkspaceProduct[];
  productsStatus: AsyncStatus;
  productsError: string | null;
}

const initialState: WorkspaceViewState = {
  activeWorkspaces: [],
  archivedWorkspaces: [],
  currentWorkspace: null,
  status: 'idle',
  error: null,
  workspaceDetail: null,
  detailStatus: 'idle',
  detailError: null,
  updateStatus: 'idle',
  updateError: null,
  archiveStatus: 'idle',
  archiveError: null,
  products: [],
  productsStatus: 'idle',
  productsError: null,
};

const buildWorkspaceError = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? fallback;
};

export const fetchWorkspaces = createAsyncThunk<
  FetchWorkspacesResponse,
  void,
  { rejectValue: string }
>(
  'workspaceView/fetchWorkspaces',
  async (_, { rejectWithValue }) => {
    if (!moduleId) {
      return rejectWithValue('Workspace module ID not found.');
    }
    try {
      const [activeWorkspacesResponse, archivedWorkspacesResponse] = await Promise.all([
        axios
          .get(`/get-all-workspace?archived=false&module_id=${moduleId}`)
          .catch(() => ({ data: { data: [] } })),
        axios
          .get(`/get-all-workspace?archived=true&module_id=${moduleId}`)
          .catch(() => ({ data: { data: [] } })),
      ]);

      return {
        active: (activeWorkspacesResponse.data?.data ?? []) as WorkspaceRecord[],
        archived: (archivedWorkspacesResponse.data?.data ?? []) as WorkspaceRecord[],
      };
    } catch (error) {
      return rejectWithValue(buildWorkspaceError(error, 'Failed to fetch workspaces'));
    }
  }
);

export const fetchWorkspaceDetail = createAsyncThunk<
  WorkspaceRecord,
  string | number,
  { rejectValue: string }
>(
  'workspaceView/fetchWorkspaceDetail',
  async (id, { rejectWithValue }) => {
    if (!moduleId) {
      return rejectWithValue('Workspace module ID not found.');
    }
    try {
      const response = await axios.get<{ data: WorkspaceRecord }>(
        `/get-workspace-details?module_id=${moduleId}&id=${id}`
      );
      if (!response.data?.data) {
        return rejectWithValue('Workspace details not found');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(buildWorkspaceError(error, 'Failed to fetch workspace details'));
    }
  }
);

export const fetchWorkspaceProducts = createAsyncThunk<
  WorkspaceProduct[],
  string | number,
  { rejectValue: string }
>(
  'workspaceView/fetchWorkspaceProducts',
  async (workspaceId, { rejectWithValue }) => {
    if (!moduleId) {
      return rejectWithValue('Workspace module ID not found.');
    }
    try {
      const response = await axios.get<{ data: WorkspaceProduct[] }>(
        `/get-workspace-products?module_id=${moduleId}&workspace_id=${workspaceId}`
      );
      return response.data?.data ?? [];
    } catch (error) {
      return rejectWithValue(buildWorkspaceError(error, 'Failed to fetch workspace products'));
    }
  }
);

export const updateWorkspaceDetails = createAsyncThunk<
  WorkspaceRecord,
  Partial<WorkspaceRecord> & { id: string | number },
  { rejectValue: string }
>(
  'workspaceView/updateWorkspaceDetails',
  async (payload, { rejectWithValue }) => {
    if (!moduleId) {
      return rejectWithValue('Workspace module ID not found.');
    }
    try {
      const response = await axios.post<{ data: WorkspaceRecord }>(`/update-workspace`, {
        ...payload,
        module_id: moduleId,
      });
      if (!response.data?.data) {
        return rejectWithValue('Workspace update response was empty');
      }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(buildWorkspaceError(error, 'Failed to update workspace details'));
    }
  }
);

export const toggleWorkspaceArchive = createAsyncThunk<
  { workspace: WorkspaceRecord; is_archive: boolean; id: string | number },
  { id: string | number; is_archive: boolean },
  { rejectValue: string }
>(
  'workspaceView/toggleWorkspaceArchive',
  async ({ id, is_archive }, { rejectWithValue }) => {
    if (!moduleId) {
      return rejectWithValue('Workspace module ID not found.');
    }
    try {
      const response = await axios.post<{ data: WorkspaceRecord }>(`/update-workspace`, {
        id,
        is_archive,
        module_id: moduleId,
      });
      if (!response.data?.data) {
        return rejectWithValue('No workspace data returned');
      }
      return {
        workspace: response.data.data,
        is_archive,
        id,
      };
    } catch (error) {
      return rejectWithValue(buildWorkspaceError(error, 'Failed to toggle workspace archive status'));
    }
  }
);

const workspaceViewSlice = createSlice({
  name: 'workspaceView',
  initialState,
  reducers: {
    updateWorkspace: (state, action: PayloadAction<WorkspaceRecord>) => {
      const { id } = action.payload;
      const activeIndex = state.activeWorkspaces.findIndex((workspace) => workspace.id === id);
      const archivedIndex = state.archivedWorkspaces.findIndex((workspace) => workspace.id === id);
      if (activeIndex !== -1) {
        state.activeWorkspaces[activeIndex] = {
          ...state.activeWorkspaces[activeIndex],
          ...action.payload,
        };
      } else if (archivedIndex !== -1) {
        state.archivedWorkspaces[archivedIndex] = {
          ...state.archivedWorkspaces[archivedIndex],
          ...action.payload,
        };
      }
    },
    setCurrentWorkspace: (state, action: PayloadAction<WorkspaceRecord | null>) => {
      state.currentWorkspace = action.payload;
      localStorage.setItem('currentWorkspace', JSON.stringify(action.payload));
    },
    resetWorkspaceDetail: (state) => {
      state.workspaceDetail = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle';
      state.updateError = null;
    },
    resetArchiveStatus: (state) => {
      state.archiveStatus = 'idle';
      state.archiveError = null;
    },
    resetProductsStatus: (state) => {
      state.productsStatus = 'idle';
      state.productsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.activeWorkspaces = action.payload.active;
        state.archivedWorkspaces = action.payload.archived;
        state.error = null;

        if (!state.currentWorkspace) {
          const storedWorkspace = localStorage.getItem('currentWorkspace');
          if (storedWorkspace) {
            try {
              state.currentWorkspace = JSON.parse(storedWorkspace) as WorkspaceRecord;
            } catch {
              const allWorkspaces = [...action.payload.active, ...action.payload.archived];
              state.currentWorkspace = allWorkspaces[0] ?? null;
              localStorage.setItem('currentWorkspace', JSON.stringify(state.currentWorkspace));
            }
          } else {
            const allWorkspaces = [...action.payload.active, ...action.payload.archived];
            state.currentWorkspace = allWorkspaces[0] ?? null;
            localStorage.setItem('currentWorkspace', JSON.stringify(state.currentWorkspace));
          }
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch workspaces';
      })
      .addCase(fetchWorkspaceDetail.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchWorkspaceDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.workspaceDetail = action.payload;
        state.detailError = null;
      })
      .addCase(fetchWorkspaceDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload ?? 'Failed to fetch workspace details';
      })
      .addCase(fetchWorkspaceProducts.pending, (state) => {
        state.productsStatus = 'loading';
        state.productsError = null;
      })
      .addCase(fetchWorkspaceProducts.fulfilled, (state, action) => {
        state.productsStatus = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchWorkspaceProducts.rejected, (state, action) => {
        state.productsStatus = 'failed';
        state.productsError = action.payload ?? 'Failed to fetch workspace products';
      })
      .addCase(updateWorkspaceDetails.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateWorkspaceDetails.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const workspace = action.payload;
        const activeIndex = state.activeWorkspaces.findIndex((w) => w.id === workspace.id);
        const archivedIndex = state.archivedWorkspaces.findIndex((w) => w.id === workspace.id);
        if (activeIndex !== -1) {
          state.activeWorkspaces[activeIndex] = workspace;
        } else if (archivedIndex !== -1) {
          state.archivedWorkspaces[archivedIndex] = workspace;
        }
        if (state.workspaceDetail?.id === workspace.id) {
          state.workspaceDetail = workspace;
        }
        if (state.currentWorkspace?.id === workspace.id) {
          state.currentWorkspace = workspace;
          localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
        }
        state.updateError = null;
      })
      .addCase(updateWorkspaceDetails.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload ?? 'Failed to update workspace details';
      })
      .addCase(toggleWorkspaceArchive.pending, (state) => {
        state.archiveStatus = 'loading';
      })
      .addCase(toggleWorkspaceArchive.fulfilled, (state, action) => {
        state.archiveStatus = 'succeeded';
        const { workspace, is_archive } = action.payload;
        if (is_archive) {
          state.activeWorkspaces = state.activeWorkspaces.filter((w) => w.id !== workspace.id);
          state.archivedWorkspaces = state.archivedWorkspaces.filter((w) => w.id !== workspace.id);
          state.archivedWorkspaces.push(workspace);
        } else {
          state.archivedWorkspaces = state.archivedWorkspaces.filter((w) => w.id !== workspace.id);
          state.activeWorkspaces = state.activeWorkspaces.filter((w) => w.id !== workspace.id);
          state.activeWorkspaces.push(workspace);
        }
        if (state.workspaceDetail?.id === workspace.id) {
          state.workspaceDetail = { ...state.workspaceDetail, is_archive } as WorkspaceRecord;
        }
        if (state.currentWorkspace?.id === workspace.id) {
          state.currentWorkspace = workspace;
          localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
        }
        state.archiveError = null;
      })
      .addCase(toggleWorkspaceArchive.rejected, (state, action) => {
        state.archiveStatus = 'failed';
        state.archiveError = action.payload ?? 'Failed to toggle workspace archive status';
      });
  },
});

export const {
  updateWorkspace,
  setCurrentWorkspace,
  resetWorkspaceDetail,
  resetUpdateStatus,
  resetArchiveStatus,
  resetProductsStatus,
} = workspaceViewSlice.actions;

export const selectActiveWorkspaces = (state: RootState) => state.workspaceView.activeWorkspaces;
export const selectArchivedWorkspaces = (state: RootState) => state.workspaceView.archivedWorkspaces;
export const selectCurrentWorkspace = (state: RootState) => state.workspaceView.currentWorkspace;
export const selectAllWorkspaces = createSelector(
  [selectActiveWorkspaces, selectArchivedWorkspaces],
  (active, archived) => [...active, ...archived]
);
export const selectWorkspaceViewStatus = (state: RootState) => state.workspaceView.status;
export const selectWorkspaceViewError = (state: RootState) => state.workspaceView.error;
export const selectWorkspaceDetail = (state: RootState) => state.workspaceView.workspaceDetail;
export const selectDetailStatus = (state: RootState) => state.workspaceView.detailStatus;
export const selectDetailError = (state: RootState) => state.workspaceView.detailError;
export const selectUpdateStatus = (state: RootState) => state.workspaceView.updateStatus;
export const selectUpdateError = (state: RootState) => state.workspaceView.updateError;
export const selectArchiveStatus = (state: RootState) => state.workspaceView.archiveStatus;
export const selectArchiveError = (state: RootState) => state.workspaceView.archiveError;
export const selectWorkspaceProducts = (state: RootState) => state.workspaceView.products;
export const selectProductsStatus = (state: RootState) => state.workspaceView.productsStatus;
export const selectProductsError = (state: RootState) => state.workspaceView.productsError;

export default workspaceViewSlice.reducer;