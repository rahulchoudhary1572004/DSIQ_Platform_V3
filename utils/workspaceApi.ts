import axios, { type AxiosResponse } from "axios";
import api from "../src/api/axios";
import { getRequest } from "../src/api/apiHelper/getHelper";

interface ApiErrorPayload {
  message?: string;
  [key: string]: unknown;
}

interface WorkspaceNameResponse {
  message: string;
  [key: string]: unknown;
}

interface RetailerApiRecord {
  id: number | string;
  retailer_name: string;
  country_name?: string | null;
  country_iso3?: string | null;
  [key: string]: unknown;
}

interface RetailerListResponse {
  data: RetailerApiRecord[];
  message?: string;
}

export interface RetailerRecord {
  id: number | string;
  name: string;
  country: string;
  country_iso3: string;
}

interface CategoryApiRecord {
  id: number | string;
  name: string;
  breadcrumb: string;
  level: number;
  retailer_id: number | string;
  [key: string]: unknown;
}

interface CategoryResponse {
  data?: CategoryApiRecord[];
  message?: string;
}

export interface CategoryDetails {
  id: number | string;
  name: string;
  breadcrumb: string;
  level: number;
  breadcrumbParts: string[];
}

export interface CategoryTreeNode {
  children: Record<string, CategoryTreeNode>;
  data: CategoryDetails | null;
}

export interface CategoryCollection {
  flat: CategoryDetails[];
  hierarchy: Record<string, CategoryTreeNode>;
}

type CategoriesByRetailer = Record<string | number, CategoryCollection>;

interface BrandApiRecord {
  category_id: number | string;
  name: string;
  [key: string]: unknown;
}

interface BrandResponse {
  data?: BrandApiRecord[];
  message?: string;
}

interface WorkspaceCreationResponse {
  data?: unknown;
  message?: string;
}

interface WorkspaceResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface WorkspaceAvailabilityResult extends WorkspaceResult<never> {
  available?: boolean;
}

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

// Check workspace name availability
export const checkWorkspaceName = async (name: string): Promise<WorkspaceAvailabilityResult> => {
  try {
    const response: AxiosResponse<WorkspaceNameResponse> = await api.post("/check-workspace-name", { name });
    const availabilityMessage = response.data.message;
    return {
      success: true,
      available: availabilityMessage === "Workspace name is available",
      message: availabilityMessage,
    };
  } catch (error) {
    const message = resolveErrorMessage(error, "Failed to check workspace name");
    return {
      success: false,
      available: false,
      message,
    };
  }
};

// Fetch all retailers
export const fetchRetailers = async (): Promise<WorkspaceResult<RetailerRecord[]>> => {
  try {
    const response = await getRequest<RetailerListResponse>("/get-retailer");
    const retailers: RetailerRecord[] = (response?.data ?? []).map((retailer) => ({
      id: retailer.id,
      name: retailer.retailer_name,
      country: retailer.country_name ?? "Unknown",
      country_iso3: retailer.country_iso3 ?? "UNK",
    }));
    return { success: true, data: retailers };
  } catch (error) {
    const message = resolveErrorMessage(error, "Failed to fetch retailers");
    return {
      success: false,
      message,
    };
  }
};

// Fetch categories by retailer IDs
export const fetchCategoriesByRetailers = async (
  retailerIds: Array<number | string>
): Promise<WorkspaceResult<CategoriesByRetailer>> => {
  try {
    const response: AxiosResponse<CategoryResponse> = await api.post("/get-category-by-retailer", {
      retailers: retailerIds,
    });

    const filteredCategories: CategoriesByRetailer = {};
    const categories = response.data?.data ?? [];

    categories.forEach((category) => {
      const retailerId = category.retailer_id;
      if (!filteredCategories[retailerId]) {
        filteredCategories[retailerId] = { flat: [], hierarchy: {} };
      }

      const breadcrumb = typeof category.breadcrumb === "string" ? category.breadcrumb : "";
      const breadcrumbParts = breadcrumb.split(" > ").map((part) => part.trim());
      const level = category.level ?? 0;
      const categoryData: CategoryDetails = {
        id: category.id,
        name: category.name,
        breadcrumb,
        level,
        breadcrumbParts,
      };

      filteredCategories[retailerId].flat.push(categoryData);

      let currentLevel: Record<string, CategoryTreeNode> = filteredCategories[retailerId].hierarchy;
      for (let i = 0; i <= level; i += 1) {
        const partName = breadcrumbParts[i] ?? "";
        if (!currentLevel[partName]) {
          currentLevel[partName] = { children: {}, data: null };
        }
        if (i === level) {
          currentLevel[partName].data = categoryData;
        }
        currentLevel = currentLevel[partName].children;
      }
    });

    return { success: true, data: filteredCategories };
  } catch (error) {
    const message = resolveErrorMessage(error, "Failed to fetch categories");
    return {
      success: false,
      message,
    };
  }
};

// Fetch brands by category IDs
export const fetchBrandsByCategories = async (
  categoryIds: Array<number | string>
): Promise<WorkspaceResult<Record<string | number, string[]>>> => {
  try {
    const response: AxiosResponse<BrandResponse> = await api.post("/get-brands-by-category", {
      categories: categoryIds,
    });

    const brandsByCategory = (response.data?.data ?? []).reduce<Record<string | number, string[]>>(
      (acc, brand) => {
        const categoryId = brand.category_id;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(brand.name);
        return acc;
      },
      {}
    );

    return { success: true, data: brandsByCategory };
  } catch (error) {
    const message = resolveErrorMessage(error, "Failed to fetch brands");
    return {
      success: false,
      message,
    };
  }
};

// Create a new workspace
export const createWorkspace = async (
  workspaceData: Record<string, unknown>
): Promise<WorkspaceResult<unknown>> => {
  try {
    const response: AxiosResponse<WorkspaceCreationResponse> = await api.post("/create-workspace", workspaceData);
    return { success: true, data: response.data?.data, message: response.data?.message };
  } catch (error) {
    const message = resolveErrorMessage(error, "Failed to create workspace");
    return {
      success: false,
      message,
    };
  }
};