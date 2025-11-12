import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import axios from '../../api/axios';
import type { RootState } from '../store';
import toast from '../../../utils/toast';

interface ChannelAmpState {
  lwaLoginUrl: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  profiles: string | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ChannelAmpState = {
  lwaLoginUrl: null,
  accessToken: null,
  refreshToken: null,
  profiles: null,
  isConnected: false,
  loading: false,
  error: null,
};

// Get Amazon Ads OAuth login URL
export const getLwaLoginUrl = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>(
  'channelAmp/getLwaLoginUrl',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/lwa_login');
      
      // Handle different response formats
      let loginUrl: string;
      if (typeof response.data === 'string') {
        loginUrl = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Backend returns { login_url: "..." } (snake_case)
        loginUrl = response.data.login_url || response.data.loginUrl || response.data.url || response.data.data || JSON.stringify(response.data);
      } else {
        loginUrl = String(response.data);
      }
      
      // Validate it's a proper URL
      if (!loginUrl.startsWith('http')) {
        throw new Error(`Invalid URL format: ${loginUrl}`);
      }
      
      return loginUrl;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? error.message ?? 'Failed to generate Amazon Ads login URL';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Exchange authorization code for access token
export const getLwaAccessToken = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'channelAmp/getLwaAccessToken',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.post('/lwa-access-token', null, {
        params: { code }
      });
      
      // Handle different response formats
      let accessToken: string;
      if (typeof response.data === 'string') {
        accessToken = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Backend might return { access_token: "...", token: "...", etc. }
        accessToken = response.data.access_token || response.data.token || response.data.accessToken || JSON.stringify(response.data);
      } else {
        accessToken = String(response.data);
      }
      
      toast.success('Successfully connected to Amazon Ads');
      return accessToken;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? 'Failed to exchange authorization code';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Refresh LwA access token using refresh token
export const refreshLwaToken = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'channelAmp/refreshLwaToken',
  async (refresh_token, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/lwa-refresh-token',
        { refresh_token },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle different response formats
      let accessToken: string;
      if (typeof response.data === 'string') {
        accessToken = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Backend might return { access_token: "...", token: "...", etc. }
        accessToken = response.data.access_token || response.data.token || response.data.accessToken || JSON.stringify(response.data);
      } else {
        accessToken = String(response.data);
      }
      
      toast.success('Access token refreshed successfully');
      return accessToken;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? 'Failed to refresh access token';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch Amazon Ads profiles using stored access token
export const fetchLwaProfiles = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>(
  'channelAmp/fetchLwaProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/lwa-fetch-profiles');
      
      // Handle different response formats
      let profiles: string;
      if (typeof response.data === 'string') {
        profiles = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Backend might return { profiles: [...], message: "...", etc. }
        profiles = response.data.profiles || response.data.data || JSON.stringify(response.data);
      } else {
        profiles = String(response.data);
      }
      
      toast.success('Amazon Ads profiles fetched successfully');
      return profiles;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? 'Failed to fetch Amazon Ads profiles';
      // Don't show error toast here - let the calling component handle it
      return rejectWithValue(errorMessage);
    }
  }
);

// Get stored Amazon Ads profiles for authenticated user
export const getLwaProfiles = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>(
  'channelAmp/getLwaProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/lwa-profiles');
      
      // Handle different response formats
      let profiles: string;
      if (typeof response.data === 'string') {
        profiles = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Backend might return { profiles: [...], message: "...", etc. }
        profiles = response.data.profiles || response.data.data || JSON.stringify(response.data);
      } else {
        profiles = String(response.data);
      }
      
      // Don't show success toast for getting profiles - it's a background operation
      return profiles;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? 'Failed to retrieve stored profiles';
      // Don't show error toast - let components handle it silently
      return rejectWithValue(errorMessage);
    }
  }
);

// Update Amazon Ads profile authorization status
export const updateLwaProfileStatus = createAsyncThunk<
  string,
  { profile_id: string; is_authorized: boolean },
  { rejectValue: string }
>(
  'channelAmp/updateLwaProfileStatus',
  async ({ profile_id, is_authorized }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/lwa-profile-status',
        null,
        {
          params: {
            profile_id,
            is_authorized
          }
        }
      );
      
      // Handle different response formats
      let result: string;
      if (typeof response.data === 'string') {
        result = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Backend might return { message: "...", status: "...", etc. }
        result = response.data.message || response.data.status || JSON.stringify(response.data);
      } else {
        result = String(response.data);
      }
      
      toast.success(`Profile ${is_authorized ? 'authorized' : 'unauthorized'} successfully`);
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? 'Failed to update profile status';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const channelAmpSlice = createSlice({
  name: 'channelAmp',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    resetChannelAmpState: (state) => {
      state.lwaLoginUrl = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.profiles = null;
      state.isConnected = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get LWA Login URL
      .addCase(getLwaLoginUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLwaLoginUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.lwaLoginUrl = action.payload;
        state.error = null;
      })
      .addCase(getLwaLoginUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to generate login URL';
      })
      // Exchange Authorization Code for Access Token
      .addCase(getLwaAccessToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLwaAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
        state.isConnected = true;
        state.error = null;
      })
      .addCase(getLwaAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to exchange authorization code';
        state.isConnected = false;
      })
      // Refresh LwA Access Token
      .addCase(refreshLwaToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshLwaToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(refreshLwaToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to refresh access token';
      })
      // Fetch Amazon Ads Profiles
      .addCase(fetchLwaProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLwaProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
        state.error = null;
      })
      .addCase(fetchLwaProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch profiles';
      })
      // Get Stored Amazon Ads Profiles
      .addCase(getLwaProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLwaProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
        state.error = null;
      })
      .addCase(getLwaProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to retrieve stored profiles';
      })
      // Update Profile Authorization Status
      .addCase(updateLwaProfileStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLwaProfileStatus.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateLwaProfileStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update profile status';
      });
  },
});

export const { clearError, setConnectionStatus, resetChannelAmpState } = channelAmpSlice.actions;

// Selectors
export const selectLwaLoginUrl = (state: RootState) => state.channelAmp.lwaLoginUrl;
export const selectAccessToken = (state: RootState) => state.channelAmp.accessToken;
export const selectRefreshToken = (state: RootState) => state.channelAmp.refreshToken;
export const selectProfiles = (state: RootState) => state.channelAmp.profiles;
export const selectIsConnected = (state: RootState) => state.channelAmp.isConnected;
export const selectChannelAmpLoading = (state: RootState) => state.channelAmp.loading;
export const selectChannelAmpError = (state: RootState) => state.channelAmp.error;

export default channelAmpSlice.reducer;
