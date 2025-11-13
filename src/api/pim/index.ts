/**
 * PIM API
 * Main entry point for PIM API module
 * 
 * Clean, organized API structure following DRY and KISS principles:
 * - Dynamic query building (no hardcoded queries)
 * - Reusable GraphQL client
 * - Type-safe operations
 * - Simple service layer
 * - React hooks for state management
 */

// Configuration
export * from './config';

// Types
export * from './types';

// Utils
export * from './utils';

// Queries (for custom use)
export * from './queries';

// Services
export * from './services';

// Hooks
export * from './hooks';
