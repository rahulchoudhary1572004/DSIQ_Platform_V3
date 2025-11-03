import { jwtDecode } from 'jwt-decode';

export interface JwtPermission {
  id: number | string;
  module_name: string;
  permission: string;
  [key: string]: unknown;
}

export interface DecodedJWT {
  first_name?: string;
  last_name?: string;
  email?: string;
  organization_id?: string;
  role?: string;
  permissions?: JwtPermission[];
  [key: string]: unknown;
}

/**
 * Decodes a JWT token and returns the payload.
 * Falls back to null if the token is missing or invalid.
 */
export function decodeJWT<T = DecodedJWT>(token: string | null | undefined): T | null {
  try {
    if (!token) return null;
    return jwtDecode<T>(token);
  } catch (error) {
    console.error('Invalid JWT Token:', error);
    return null;
  }
}
