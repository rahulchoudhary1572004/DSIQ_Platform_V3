import type { AxiosResponse } from 'axios';
import axios from '../src/api/axios';
import { getModuleIdByName } from './getModuleIdByName';

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
    if (!moduleId) {
      console.warn('Module ID for "User Management" not found.');
      return [];
    }

    const response: AxiosResponse<GetRolesResponse> = await axios.get('/get-roles', {
      params: { module_id: moduleId }
    });

    const roleData = response.data?.data;

    if (!Array.isArray(roleData)) {
      console.error('Unexpected response structure:', response.data);
      return [];
    }

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
