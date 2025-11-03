// Shared TypeScript type definitions for the application

import type { ReactNode } from 'react';

// ============================================================================
// Application Types
// ============================================================================

export interface App {
  id: number;
  name: string;
  logo: string;
  description: string;
}

// ============================================================================
// Workspace Types
// ============================================================================

export interface Workspace {
  id: string | number;
  name: string;
  is_archive?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ============================================================================
// View/Template Types
// ============================================================================

export interface ViewAttribute {
  id: string | number;
  name: string;
  type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Text' | 'Rich Text' | 'Picklist';
  required: boolean;
  options?: string[];
}

export interface ViewSection {
  id: string;
  title: string;
  order: number;
  attributes: ViewAttribute[];
}

export interface ViewTemplate {
  id: string;
  name: string;
  description?: string;
  sections: ViewSection[];
  lastModified: string;
  defaultFieldMapping?: {
    templateId: string;
    enabledRetailers: string[];
  };
}

export interface FieldMappingTemplate {
  id: string;
  name: string;
  description: string;
  retailers?: string[];
  mappings?: Record<string, Record<string, string>>;
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: string | number;
  name: string;
  sku?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  status?: 'active' | 'draft' | 'archived';
  [key: string]: unknown;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  selectedApp: App | null;
  setSelectedApp: (app: App) => void;
}

export interface ViewConfiguratorProps {
  viewTemplates: ViewTemplate[];
  setViewTemplates: (templates: ViewTemplate[] | ((prev: ViewTemplate[]) => ViewTemplate[])) => void;
  activeViewId: string;
  picklistOptions: Record<string, string[]>;
  setPicklistOptions: (options: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
  onSave: () => void;
  onBack: () => void;
  fieldMappingTemplates?: FieldMappingTemplate[];
}

export interface ProductDataContextType {
  viewTemplates: ViewTemplate[];
  setViewTemplates: (templates: ViewTemplate[] | ((prev: ViewTemplate[]) => ViewTemplate[])) => void;
  productData: Product[];
  setProductData: (data: Product[] | ((prev: Product[]) => Product[])) => void;
  picklistOptions: Record<string, string[]>;
  setPicklistOptions: (options: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
  fieldMappingTemplates: FieldMappingTemplate[];
  setFieldMappingTemplates: (templates: FieldMappingTemplate[] | ((prev: FieldMappingTemplate[]) => FieldMappingTemplate[])) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface AnimationProps {
  scale?: number;
  rotation?: number;
  yoyo?: boolean;
  repeat?: number;
}
