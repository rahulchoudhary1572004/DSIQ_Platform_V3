/**
 * Product Types
 */

import type { PaginationMeta } from './common.types';

export interface Product {
  id: string;
  title: string;
  description?: string;
  sku?: string;
  price?: number;
  status?: 'draft' | 'active' | 'inactive';
  category?: {
    id?: string;
    name: string;
  };
  brand?: {
    id?: string;
    name: string;
  };
  attributes?: Record<string, any>;
  images?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  sku?: string;
  price?: number;
  status?: 'draft' | 'active' | 'inactive';
  categoryId?: string;
  brandId?: string;
  attributes?: Record<string, any>;
  images?: string[];
  tags?: string[];
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  sku?: string;
  price?: number;
  status?: 'draft' | 'active' | 'inactive';
  categoryId?: string;
  brandId?: string;
  attributes?: Record<string, any>;
  images?: string[];
  tags?: string[];
}
