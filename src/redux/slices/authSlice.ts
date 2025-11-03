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
  name: string;
  email: string;
  phone: string;
  password: string;
  country_id: number | string;
  role_id: number | string;
}

interface RegisterAdminResponse {
  user: AuthUser;
  accessToken?: string | null;
  refreshToken?: string | null;
  [key: string]: unknown;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

interface TokenPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  organization_id?: string;
  role?: string;
  [key: string]: unknown;
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

const initialState: AuthState = {
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  loading: false,
  error: null,
  user: initialUser,
  accessToken: localStorage.getItem("authToken") || null,
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

export const registerAdmin = createAsyncThunk<
  RegisterAdminResponse,
  RegisterAdminPayload,
  { rejectValue: AuthError }
>(
  "auth/registerAdmin",
  async (
    { first_name, last_name, name, email, phone, password, country_id, role_id },
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

      // Real API call
      const response = await axios.post("/register", {
        name,
        first_name,
        last_name,
        email,
        phone,
        password,
        country_id,
        role_id,
      });

      const data = response.data as RegisterAdminResponse;

      return data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? toastMessages.auth.signupFailed;
      return rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk<
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

      const response = await axios.post<ForgotPasswordResponse>(
        "/forgot-password",
        { email }
      );
      return response.data ?? { message: "Reset link sent" };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? toastMessages.auth.resetLinkFailed;
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
  async ({ token, password }, { rejectWithValue }) => {
    try {
      // For mock/dev purposes only
      if (token === "mock-token") {
        await new Promise((res) => setTimeout(res, 1000));
        return { message: "Mock password reset successful" };
      }

      const response = await axios.post<ForgotPasswordResponse>(
        "/reset-password",
        { token, password }
      );
      return response.data ?? { message: "Password reset successful" };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? toastMessages.auth.passwordResetFailed;
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
        showToast.success(toastMessages.auth.loginSuccess);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? toastMessages.auth.loginFailed;
        showToast.error(state.error);
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
