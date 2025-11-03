import axios, { type AxiosResponse } from 'axios';
import { toast, type ToastContent, type ToastOptions, type TypeOptions } from 'react-toastify';

// Default configuration for all toasts
const defaultConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light', // "light", "dark", "colored"
};

type ToastConfig = Partial<ToastOptions>;
type ToastHandler = (message: ToastContent, customConfig?: ToastConfig) => void;

interface ApiResponseBody {
  message?: string;
  msg?: string;
  [key: string]: unknown;
}

interface ApiErrorBody {
  message?: string;
  msg?: string;
  [key: string]: unknown;
}

const mergeConfig = (customConfig?: ToastConfig): ToastOptions => ({
  ...defaultConfig,
  ...(customConfig ?? {}),
});

interface ToastApi {
  success: ToastHandler;
  error: ToastHandler;
  warning: ToastHandler;
  info: ToastHandler;
  handleApiResponse: <T extends ApiResponseBody>(response: AxiosResponse<T>, customConfig?: ToastConfig) => void;
  handleApiError: (error: unknown, customConfig?: ToastConfig) => void;
  setDefaultConfig: (newConfig: ToastConfig) => void;
  getDefaultConfig: () => ToastOptions;
  custom: (message: ToastContent, type?: TypeOptions, customConfig?: ToastConfig) => void;
}

// Toast utility object with different methods
const showToast: ToastApi = {
  success: (message, customConfig) => {
    toast.success(message, mergeConfig(customConfig));
  },

  error: (message, customConfig) => {
    toast.error(message, mergeConfig(customConfig));
  },

  warning: (message, customConfig) => {
    toast.warning(message, mergeConfig(customConfig));
  },

  info: (message, customConfig) => {
    toast.info(message, mergeConfig(customConfig));
  },

  // Method to handle API responses automatically
  handleApiResponse: (response, customConfig) => {
    const { data, status } = response;
    const message = data?.message || data?.msg || 'Operation completed';

    if (status >= 200 && status < 300) {
      showToast.success(message, customConfig);
    } else if (status >= 400 && status < 500) {
      showToast.warning(message, customConfig);
    } else if (status >= 500) {
      showToast.error(message, customConfig);
    }
  },

  // Method to handle API errors (for catch blocks)
  handleApiError: (error, customConfig) => {
    let message = 'Something went wrong';

    if (axios.isAxiosError<ApiErrorBody>(error)) {
      const response = error.response;
      message =
        response?.data?.message ||
        response?.data?.msg ||
        error.message ||
        message;
    } else if (error instanceof Error) {
      message = error.message || message;
    }

    showToast.error(message, customConfig);
  },

  // Method to update default configuration
  setDefaultConfig: (newConfig) => {
    Object.assign(defaultConfig, newConfig);
  },

  // Method to get current default configuration
  getDefaultConfig: () => ({ ...defaultConfig }),

  // Custom toast with full control
  custom: (message, type = 'default', customConfig) => {
    toast(message, { ...mergeConfig(customConfig), type });
  }
};

export default showToast;