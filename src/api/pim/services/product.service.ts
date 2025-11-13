/**
 * Product Service
 * Clean, simple service layer for product operations
 * Follows DRY and KISS principles
 */

import { graphqlClient } from '../utils';
import {
  buildGetProductsQuery,
  buildGetProductsPaginatedQuery,
  buildGetProductByIdQuery,
  buildSearchProductsQuery,
  buildCreateProductMutation,
  buildUpdateProductMutation,
  buildDeleteProductMutation,
} from '../queries';
import type {
  Product,
  ProductsResponse,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

interface GetProductsOptions {
  fields?: string[];
  filters?: Record<string, any>;
}

interface GetProductsPaginatedOptions {
  fields?: string[];
  page?: number;
  limit?: number;
}

interface SearchProductsOptions {
  search: string;
  fields?: string[];
  page?: number;
  limit?: number;
}

/**
 * Product Service Class
 */
class ProductService {
  /**
   * Get all products
   */
  async getAll(options: GetProductsOptions = {}): Promise<Product[]> {
    const query = buildGetProductsQuery(options.fields, options.filters);
    const variables = options.filters ? { filter: options.filters } : undefined;

    const data = await graphqlClient.request<{ getProducts: Product[] }>({
      query,
      variables,
    });

    return data.getProducts;
  }

  /**
   * Get products with pagination
   */
  async getPaginated(
    options: GetProductsPaginatedOptions = {}
  ): Promise<ProductsResponse> {
    const query = buildGetProductsPaginatedQuery(
      options.fields,
      options.page,
      options.limit
    );

    const data = await graphqlClient.request<{ getProducts: ProductsResponse }>(
      {
        query,
        variables: {
          page: options.page,
          limit: options.limit,
        },
      }
    );

    return data.getProducts;
  }

  /**
   * Get product by ID
   */
  async getById(id: string, fields?: string[]): Promise<Product> {
    const query = buildGetProductByIdQuery(fields);

    const data = await graphqlClient.request<{ getProduct: Product }>({
      query,
      variables: { id },
    });

    return data.getProduct;
  }

  /**
   * Search products
   */
  async search(options: SearchProductsOptions): Promise<ProductsResponse> {
    const query = buildSearchProductsQuery(options.fields);

    const data = await graphqlClient.request<{
      searchProducts: ProductsResponse;
    }>({
      query,
      variables: {
        search: options.search,
        page: options.page,
        limit: options.limit,
      },
    });

    return data.searchProducts;
  }

  /**
   * Create product
   */
  async create(input: CreateProductInput, fields?: string[]): Promise<Product> {
    const query = buildCreateProductMutation(fields);

    const data = await graphqlClient.request<{ createProduct: Product }>({
      query,
      variables: { input },
    });

    return data.createProduct;
  }

  /**
   * Update product
   */
  async update(
    id: string,
    input: UpdateProductInput,
    fields?: string[]
  ): Promise<Product> {
    const query = buildUpdateProductMutation(fields);

    const data = await graphqlClient.request<{ updateProduct: Product }>({
      query,
      variables: { id, input },
    });

    return data.updateProduct;
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const query = buildDeleteProductMutation();

    const data = await graphqlClient.request<{
      deleteProduct: { success: boolean; message: string };
    }>({
      query,
      variables: { id },
    });

    return data.deleteProduct;
  }
}

// Export singleton instance
export const productService = new ProductService();
