// redux/slices/profileSlice.js
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import axios from '../../api/axios';
import type { RootState } from '../store';

export interface ProfileData {
  id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  country_id: number | null;
  country_name: string | null;
  marriage_anniversary: string | null;
  other_anniversaries: string | null;
  profile_photo_url: string | null;
  role_id: number | null;
  role_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_archive: boolean;
  bio?: string | null;
}

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ProfileState {
  data: ProfileData;
  status: AsyncStatus;
  error: string | null;
  updateStatus: AsyncStatus;
  updateError: string | null;
}

const initialState: ProfileState = {
  data: {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: null,
    dob: null,
    gender: null,
    country_id: null,
    country_name: null,
    marriage_anniversary: null,
    other_anniversaries: null,
    profile_photo_url: null,
    role_id: null,
    role_name: '',
    is_active: false,
    is_verified: false,
    is_archive: false,
    bio: null,
  },
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null,
};

// ✅ Async Thunk to Fetch Profile Data
export const fetchProfile = createAsyncThunk<
  ProfileData,
  void,
  { rejectValue: string }
>(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ data: ProfileData }>('/get-profile');
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message ?? 'Failed to fetch profile'
      );
    }
  }
);

// ✅ Async Thunk to Update Profile Data
export const updateProfile = createAsyncThunk<
  ProfileData,
  Partial<ProfileData>,
  { rejectValue: string }
>(
  'profile/updateProfile',
  async (updatedData: Partial<ProfileData>, { rejectWithValue }) => {
    try {
      const response = await axios.put<{ data?: ProfileData; message?: string }>(
        '/user/profile',
        updatedData
      );
      return response.data.data ?? (response.data as ProfileData);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message ?? 'Failed to update profile'
      );
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
    },
    // Reset profile state
    resetProfile: (state) => {
      state.data = { ...initialState.data };
      state.status = 'idle';
      state.error = null;
      state.updateStatus = 'idle';
      state.updateError = null;
    },
    // Update specific profile fields locally (optimistic updates)
    updateProfileField: (
      state,
      action: PayloadAction<{ field: keyof ProfileData; value: ProfileData[keyof ProfileData] }>
    ) => {
      const { field, value } = action.payload;
      if (field in state.data) {
        state.data = {
          ...state.data,
          [field]: value,
        } as ProfileData;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile Cases
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = {
          ...state.data,
          ...action.payload
        };
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch profile';
      })
      // Update Profile Cases
      .addCase(updateProfile.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        state.data = {
          ...state.data,
          ...action.payload
        };
        state.updateError = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload ?? 'Failed to update profile';
      });
  },
});

// Export actions
export const { clearErrors, resetProfile, updateProfileField } = profileSlice.actions;

// Selectors
export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileStatus = (state: RootState) => state.profile.status;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectUpdateStatus = (state: RootState) => state.profile.updateStatus;
export const selectUpdateError = (state: RootState) => state.profile.updateError;
export const selectIsProfileLoading = (state: RootState) => state.profile.status === 'loading';
export const selectIsUpdateLoading = (state: RootState) => state.profile.updateStatus === 'loading';

export default profileSlice.reducer;