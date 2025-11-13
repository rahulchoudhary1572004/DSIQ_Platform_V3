import axios, { type AxiosRequestConfig } from 'axios';
import apiClient from '../../api/axios';

export interface ApiPutError extends Error {
  status?: number;
  data?: unknown;
}

export async function putRequest<T = unknown, P = unknown>(
  url: string,
  data: P,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await apiClient.put<T>(url, data, config);
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
        // Something happened in setting up the request
        errorMessage = error.message;
      }
    } else if (error instanceof Error && error.message) {
      // Not an axios error
      errorMessage = error.message;
    }

    // Create a consistent error object
    const processedError: ApiPutError = Object.assign(new Error(errorMessage), {
      status: statusCode,
      data: errorData,
    });

    throw processedError;
  }
}
