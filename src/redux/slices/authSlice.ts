import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import axios from "../../api/axios";
import showToast from "../../../utils/toast";
import type { RootState } from "../store";

export interface AuthUser {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  organization_id: string | null;
  role: string | null;
}

export interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  user: AuthUser;
  accessToken: string | null;
  refreshToken: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginSuccessPayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface RegisterAdminPayload {
  first_name: string;
  last_name: string;
  name: string; // organization name
  email: string;
  phone: string;
  password: string;
  country_id?: number | string;
  role_id?: number | string;
  // Optional user fields
  is_active?: boolean;
  is_archive?: boolean;
  is_verified?: boolean;
  gender?: string;
  profile_photo_url?: string;
  dob?: string;
  // Optional organization fields
  organization_email?: string;
  organization_description?: string;
  organization_type?: string;
  organization_is_active?: boolean;
  organization_is_verified?: boolean;
  organization_logo?: string;
}

interface RegisterAdminResponse {
  user: AuthUser;
  accessToken?: string | null;
  refreshToken?: string | null;
  [key: string]: unknown;
}

interface ForgotPasswordResponse {
  message: string;
  otp?: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  message?: string;
  [key: string]: unknown;
}

interface ResetPasswordPayload {
  email: string;
  new_password: string;
}

interface TokenPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  organization_id?: string;
  role?: string;
  [key: string]: unknown;
}

interface CurrentUserResponse extends AuthUser {
  id: string;
  // other fields from /me can be added here if needed
}

type AuthError = string;

const toastMessages = {
  auth: {
    loginSuccess: "Login successful! Welcome back.",
    loginFailed: "Login failed. Please try again.",
    signupSuccess: "Account created successfully! Welcome to DSIQ.",
    signupFailed: "Registration failed. Please try again.",
    logoutSuccess: "You have been logged out successfully.",
    resetLinkFailed: "Failed to send reset link. Please try again.",
    passwordResetFailed: "Password reset failed. Please try again.",
  },
} as const;

const initialUser: AuthUser = {
  first_name: null,
  last_name: null,
  email: null,
  organization_id: null,
  role: null,
};

let userFromToken: AuthUser = { ...initialUser };
const token = localStorage.getItem("authToken");
if (token) {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    userFromToken = {
      first_name: decoded.first_name ?? null,
      last_name: decoded.last_name ?? null,
      email: decoded.email ?? null,
      organization_id: decoded.organization_id ?? null,
      role: decoded.role ?? null,
    };
  } catch (error) {
    console.error("Failed to decode token on initial load:", error);
    // Token might be invalid, clear it
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
  }
}

const initialState: AuthState = {
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true" && !!token,
  loading: false,
  error: null,
  user: userFromToken,
  accessToken: token,
  refreshToken: localStorage.getItem("refreshToken") || null,
};

// Async Thunks
export const loginUser = createAsyncThunk<
  LoginSuccessPayload,
  LoginCredentials,
  { rejectValue: AuthError }
>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      if (email === "a@a.com" && password === "1234") {
        await new Promise((res) => setTimeout(res, 500));
        const dummyData = {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          user: {
            email,
            first_name: "Dev",
            last_name: "User",
            organization_id: "mock-org-id",
            role: "admin",
          },
        };
        localStorage.setItem("authToken", dummyData.accessToken);
        localStorage.setItem("refreshToken", dummyData.refreshToken);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("hasWorkspace", "true");
        return dummyData;
      }

      const response = await axios.post("/login", { email, password });
      const data = response.data;

      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      localStorage.setItem("isLoggedIn", "true");

      const decodedToken = jwtDecode<TokenPayload>(data.access_token);

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: {
          first_name: decodedToken.first_name ?? null,
          last_name: decodedToken.last_name ?? null,
          email: decodedToken.email ?? null,
          organization_id: decodedToken.organization_id ?? null,
          role: decodedToken.role ?? null,
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? toastMessages.auth.loginFailed;
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<
  AuthState["user"],
  { showLoginToast?: boolean } | void,
  { rejectValue: string }
>(
  "auth/fetchCurrentUser",
  async (params, { rejectWithValue, getState }) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      // Decode the JWT token to get user information
      const decodedToken = jwtDecode<TokenPayload>(token);
      
      console.log('Decoded JWT token:', decodedToken);

      // Return user data from the token
      return {
        first_name: decodedToken.first_name ?? null,
        last_name: decodedToken.last_name ?? null,
        email: decodedToken.email ?? null,
        organization_id: decodedToken.organization_id ?? null,
        role: decodedToken.role ?? null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch user details.";
      return rejectWithValue(message);
    }
  }
);

export const registerAdmin = createAsyncThunk<
  RegisterAdminResponse,
  RegisterAdminPayload,
  { rejectValue: AuthError }
>(
  "auth/registerAdmin",
  async (
    { 
      first_name, 
      last_name, 
      name, 
      email, 
      phone, 
      password, 
      country_id,
      role_id,
      is_active = true,
      is_archive = false,
      is_verified = false,
      gender,
      profile_photo_url,
      dob,
      organization_email,
      organization_description,
      organization_type,
      organization_is_active = true,
      organization_is_verified = false,
      organization_logo
    },
    { rejectWithValue }
  ) => {
    try {
      // Development mock
      if (email == "a@a.com") {
        const dummyData = {
          user: {
            email,
            first_name,
            last_name,
            organization_id: "mock-org-id",
            role: "admin",
          },
        };
        localStorage.setItem("isLoggedIn", "true");
        return dummyData;
      }

      // Real API call - matching /register endpoint specification
      const payload = {
        user: {
          first_name,
          last_name,
          email,
          password,
          is_active,
          is_archive,
          is_verified,
          phone: phone || "",
          gender: gender || "",
          profile_photo_url: profile_photo_url || "",
          dob: dob || null,
        },
        organization: {
          name,
          email: organization_email || email,
          description: organization_description || "",
          type: organization_type || "",
          is_active: organization_is_active,
          is_verified: organization_is_verified,
          logo: organization_logo || "",
        }
      };

      const response = await axios.post("/register", payload);

      const data = response.data as RegisterAdminResponse;
 
       return data;
     } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? toastMessages.auth.signupFailed;
      return rejectWithValue(message);
    }
  }
);export const forgotPassword = createAsyncThunk<
  ForgotPasswordResponse,
  string,
  { rejectValue: AuthError }
>(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      // For mock/dev purposes only
      if (email === "a@a.com") {
        await new Promise((res) => setTimeout(res, 1000));
        return { message: "Mock reset link sent" };
      }

      const response = await axios.post(
        `/forgot-password`,
        null,
        {
          params: { email }
        }
      );
      
      // Backend returns { message: "OTP sent to email", otp: "885262" }
      if (typeof response.data === 'string') {
        return { message: response.data };
      }
      
      return {
        message: response.data?.message || "OTP sent successfully",
        otp: response.data?.otp
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? toastMessages.auth.resetLinkFailed;
      return rejectWithValue(message);
    }
  }
);

export const verifyOtp = createAsyncThunk<
  VerifyOtpResponse,
  VerifyOtpPayload,
  { rejectValue: AuthError }
>(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      // For mock/dev purposes only
      if (email === "a@a.com" && otp === "123456") {
        await new Promise((res) => setTimeout(res, 1000));
        return { message: "Mock OTP verified successfully" };
      }

      // API call with email and otp as query parameters
      const response = await axios.post(
        `/verify-otp`,
        null,
        {
          params: { email, otp }
        }
      );
      
      const message = typeof response.data === 'string'
        ? response.data
        : response.data?.message || "OTP verified successfully";
      
      return { message };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? "OTP verification failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk<
  ForgotPasswordResponse,
  ResetPasswordPayload,
  { rejectValue: AuthError }
>(
  "auth/resetPassword",
  async ({ email, new_password }, { rejectWithValue }) => {
    try {
      // For mock/dev purposes only
      if (email === "a@a.com") {
        await new Promise((res) => setTimeout(res, 1000));
        return { message: "Mock password reset successful" };
      }

      // API call with email and new_password as query parameters
      const response = await axios.post(
        `/reset-password`,
        null,
        {
          params: { email, new_password }
        }
      );
      
      const message = typeof response.data === 'string'
        ? response.data
        : response.data?.message || "Password reset successful";
      
      return { message };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? toastMessages.auth.passwordResetFailed;
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk<
  string,
  void,
  { rejectValue: AuthError }
>(
  "auth/logoutUser",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const refreshToken = state.auth.refreshToken || localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // If no refresh token, just clear local state
        return "Logged out successfully";
      }

      // Call logout API with refresh token - skip Authorization header to avoid 401
      const response = await axios.post("/logout", null, {
        headers: {
          "refresh-token": refreshToken,
          // Remove Authorization header for logout
          "Authorization": ""
        },
        // Add flag to prevent retry on 401
        _retry: true
      } as any);

      return response.data ?? "Logged out successfully";
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? "Logout failed";
      // Even if API fails, we still want to clear local state
      return rejectWithValue(message);
    }
  }
);

export const revokeToken = createAsyncThunk<
  string,
  void,
  { rejectValue: AuthError }
>(
  "auth/revokeToken",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken || localStorage.getItem("authToken");

      if (!accessToken) {
        return "No token to revoke";
      }

      // Call revoke_token API with access token in Authorization header
      const response = await axios.post("/revoke_token", null, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data ?? "Token revoked successfully";
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? "Token revocation failed";
      return rejectWithValue(message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.user = { ...initialUser };
      state.error = null;
      state.accessToken = null;
      state.refreshToken = null;

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.setItem("hasWorkspace", "false");
      showToast.info(toastMessages.auth.logoutSuccess);
    },
    setUserDetails(state, action: PayloadAction<Partial<AuthUser>>) {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = {
          ...state.user,
          ...action.payload.user,
        };
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        // Do not show toast here, wait for fetchCurrentUser
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? toastMessages.auth.loginFailed;
        showToast.error(state.error);
      })

      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload,
        };
        // Only show login success toast if explicitly requested (during login flow)
        const showLoginToast = (action.meta.arg as { showLoginToast?: boolean })?.showLoginToast;
        if (showLoginToast) {
          showToast.success(toastMessages.auth.loginSuccess);
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch user profile.";
        
        // Token is invalid or missing, log the user out
        console.error('Failed to fetch user from token:', state.error);
        showToast.error('Session expired. Please log in again.');
        
        state.isLoggedIn = false;
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
      })

      // Signup
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        if (action.payload?.user) {
          state.user = {
            ...state.user,
            ...action.payload.user,
          };
        }
        state.accessToken = action.payload?.accessToken ?? state.accessToken;
        state.refreshToken = action.payload?.refreshToken ?? state.refreshToken;
        showToast.success(toastMessages.auth.signupSuccess);
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? toastMessages.auth.signupFailed;
        showToast.error(state.error);
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = { ...initialUser };
        state.error = null;
        state.accessToken = null;
        state.refreshToken = null;

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("hasWorkspace", "false");
        showToast.success(toastMessages.auth.logoutSuccess);
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        // Even on error, clear the auth state
        state.isLoggedIn = false;
        state.user = { ...initialUser };
        state.error = null;
        state.accessToken = null;
        state.refreshToken = null;

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.setItem("hasWorkspace", "false");
        showToast.info(toastMessages.auth.logoutSuccess);
      })

      // Revoke Token
      .addCase(revokeToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(revokeToken.fulfilled, (state) => {
        state.loading = false;
        // Token revoked successfully - optionally show toast
        showToast.info("Token revoked successfully");
      })
      .addCase(revokeToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Token revocation failed";
        showToast.warning(state.error);
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        showToast.success(action.payload.message || "OTP verified successfully");
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "OTP verification failed";
        showToast.error(state.error);
      });
  },
});

export const { logout, setUserDetails } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthState = (state: RootState) => state.auth;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
