import type { AxiosResponse } from 'axios';
import axios from '../src/api/axios';
import { getModuleIdByName } from './getModuleIdByName';
import { decodeJWT, type DecodedJWT } from './jwtHelper';

interface RoleApiRecord {
  id: number | string;
  name: string;
  is_archive?: boolean;
  [key: string]: unknown;
}

interface GetRolesResponse {
  data?: RoleApiRecord[];
  [key: string]: unknown;
}

export interface RoleSummary {
  id: number | string;
  name: string;
}

// Helper function to get all active role names and IDs for a given module
export const getRoles = async (): Promise<RoleSummary[]> => {
  try {
    const moduleId = getModuleIdByName('User Management');
    let effectiveModuleId = moduleId;
    if (!effectiveModuleId) {
      // Module ID not found in JWT – fallback: query /modules and map by name
      const debug = typeof window !== 'undefined' && localStorage.getItem('debugApi') === 'true';
      if (debug) {
        console.warn('Module ID for "User Management" not found in JWT token. Attempting fallback via /modules ...');
      }
      try {
        const modulesResp = await axios.get('/modules');
        const raw = Array.isArray(modulesResp.data)
          ? modulesResp.data
          : Array.isArray(modulesResp.data?.data)
            ? modulesResp.data.data
            : modulesResp.data?.modules || [];
        const norm = (s: unknown) => String(s ?? '').toLowerCase().replace(/[\s_-]+/g, '');
        const target = norm('User Management');
        const match = (raw as any[]).find((m) => norm(m?.name ?? m?.module_name) === target);
        if (match) {
          effectiveModuleId = match.id;
          // Cache for later quick lookup
          try { localStorage.setItem('modules', JSON.stringify(raw)); } catch {}
        }
      } catch (e) {
        console.error('Fallback /modules request failed:', e);
      }
    }

    if (!effectiveModuleId) return [];

    // Backend exposes /roles (org-scoped). Filter client-side by archive and use elsewhere
    const response: AxiosResponse<GetRolesResponse | RoleApiRecord[]> = await axios.get('/roles');
    const roleData = Array.isArray(response.data)
      ? (response.data as RoleApiRecord[])
      : Array.isArray((response.data as GetRolesResponse)?.data)
        ? ((response.data as GetRolesResponse).data as RoleApiRecord[])
        : [];

    return roleData
      .filter((role) => role.is_archive === false)
      .map((role) => ({
        id: role.id,
        name: role.name,
      }));
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};
