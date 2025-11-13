/**
 * Common Types
 * Shared types used across the PIM API
 */

// GraphQL Response wrapper
export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, any>;
}

// Pagination
export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Filter and Search
export interface FilterInput {
  orgId: string;
  isActive?: boolean;
  isDefault?: boolean;
  [key: string]: any;
}

export interface SearchInput {
  search: string;
  page?: number;
  limit?: number;
}

// API Response
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
