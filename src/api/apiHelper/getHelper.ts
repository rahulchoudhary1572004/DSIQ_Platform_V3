import axios, { type AxiosRequestConfig } from 'axios';
import apiClient from '../../api/axios';

export interface ApiRequestError extends Error {
  status?: number;
  data?: unknown;
}

export async function getRequest<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;
    let errorData: unknown = null;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status (4xx, 5xx)
        errorMessage = error.response.data?.message || error.response.statusText;
        statusCode = error.response.status;
        errorData = error.response.data;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response received from server';
      } else {
        // Something happened in setting up the request or other error
        errorMessage = error.message || 'An unexpected error occurred';
      }
    } else if (error instanceof Error && error.message) {
      errorMessage = error.message;
    }

    // Create a consistent error object
    const processedError: ApiRequestError = Object.assign(new Error(errorMessage), {
      status: statusCode,
      data: errorData,
    });

    throw processedError;
  }
}