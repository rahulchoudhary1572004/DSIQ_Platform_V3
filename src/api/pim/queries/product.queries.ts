/**
 * Product Queries
 * Dynamic GraphQL query generation for products
 */

import { buildFields, buildFilterArgs, buildPaginationArgs } from '../utils/queryBuilder';

/**
 * Base product fields (can be customized)
 */
export const DEFAULT_PRODUCT_FIELDS = [
  'id',
  'title',
  'description',
  'sku',
  'price',
  'status',
  'category.id',
  'category.name',
  'brand.id',
  'brand.name',
  'images',
  'tags',
  'createdAt',
  'updatedAt',
];

/**
 * Build GET products query dynamically
 */
export const buildGetProductsQuery = (
  fields: string[] = DEFAULT_PRODUCT_FIELDS,
  filters?: Record<string, any>
) => {
  const fieldString = buildFields(fields);
  const filterArgs = filters ? buildFilterArgs(filters) : '';

  return `
    query GetProducts${filterArgs ? `($filter: ProductFilterInput)` : ''} {
      getProducts${filterArgs ? `(filter: $filter)` : ''} {
        ${fieldString}
      }
    }
  `;
};

/**
 * Build GET products with pagination query dynamically
 */
export const buildGetProductsPaginatedQuery = (
  fields: string[] = DEFAULT_PRODUCT_FIELDS,
  page?: number,
  limit?: number
) => {
  const fieldString = buildFields(fields);
  const paginationArgs = buildPaginationArgs(page, limit);

  return `
    query GetProductsPaginated${paginationArgs ? `($page: Int, $limit: Int)` : ''} {
      getProducts${paginationArgs ? `(${paginationArgs})` : ''} {
        products {
          ${fieldString}
        }
        pagination {
          currentPage
          totalPages
          totalItems
          itemsPerPage
        }
      }
    }
  `;
};

/**
 * Build GET product by ID query
 */
export const buildGetProductByIdQuery = (
  fields: string[] = DEFAULT_PRODUCT_FIELDS
) => {
  const fieldString = buildFields(fields);

  return `
    query GetProductById($id: ID!) {
      getProduct(id: $id) {
        ${fieldString}
      }
    }
  `;
};

/**
 * Build SEARCH products query
 */
export const buildSearchProductsQuery = (
  fields: string[] = DEFAULT_PRODUCT_FIELDS
) => {
  const fieldString = buildFields(fields);

  return `
    query SearchProducts($search: String!, $page: Int, $limit: Int) {
      searchProducts(search: $search, page: $page, limit: $limit) {
        products {
          ${fieldString}
        }
        pagination {
          currentPage
          totalPages
          totalItems
          itemsPerPage
        }
      }
    }
  `;
};

/**
 * Build CREATE product mutation
 */
export const buildCreateProductMutation = (
  fields: string[] = DEFAULT_PRODUCT_FIELDS
) => {
  const fieldString = buildFields(fields);

  return `
    mutation CreateProduct($input: CreateProductInput!) {
      createProduct(input: $input) {
        ${fieldString}
      }
    }
  `;
};

/**
 * Build UPDATE product mutation
 */
export const buildUpdateProductMutation = (
  fields: string[] = DEFAULT_PRODUCT_FIELDS
) => {
  const fieldString = buildFields(fields);

  return `
    mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
      updateProduct(id: $id, input: $input) {
        ${fieldString}
      }
    }
  `;
};

/**
 * Build DELETE product mutation
 */
export const buildDeleteProductMutation = () => {
  return `
    mutation DeleteProduct($id: ID!) {
      deleteProduct(id: $id) {
        success
        message
      }
    }
  `;
};
