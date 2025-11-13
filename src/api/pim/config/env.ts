/**
 * Environment Configuration
 * Centralized access to environment variables
 */

export const ENV = {
  GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_BASE_URL || 'http://172.16.14.16:8080/graphql',
  ORG_ID: import.meta.env.VITE_ORG_ID || 'd620742a-8a42-475b-b5ec-c65788748454',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  API_RETRY_COUNT: Number(import.meta.env.VITE_API_RETRY_COUNT) || 3,
} as const;
