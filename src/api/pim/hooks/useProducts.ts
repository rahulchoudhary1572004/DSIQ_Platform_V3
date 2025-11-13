/**
 * Product Hooks
 * React hooks for product operations with state management
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { productService } from '../services';
import type {
  Product,
  ProductsResponse,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

/**
 * Hook for managing products list
 */
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (options?: {
      fields?: string[];
      filters?: Record<string, any>;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getAll(options);
        setProducts(data);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch products';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    products,
    loading,
    error,
    fetchProducts,
    setProducts,
  };
};

/**
 * Hook for managing paginated products
 */
export const useProductsPaginated = () => {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (options?: {
      fields?: string[];
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await productService.getPaginated(options);
        setData(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch products';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    products: data?.products || [],
    pagination: data?.pagination,
    loading,
    error,
    fetchProducts,
  };
};

/**
 * Hook for product CRUD operations
 */
export const useProductOperations = () => {
  const [loading, setLoading] = useState(false);

  const getById = useCallback(async (id: string, fields?: string[]) => {
    setLoading(true);
    try {
      return await productService.getById(id, fields);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (input: CreateProductInput, fields?: string[]) => {
      setLoading(true);
      try {
        const product = await productService.create(input, fields);
        toast.success('Product created successfully');
        return product;
      } catch (err: any) {
        toast.error(err.message || 'Failed to create product');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const update = useCallback(
    async (id: string, input: UpdateProductInput, fields?: string[]) => {
      setLoading(true);
      try {
        const product = await productService.update(id, input, fields);
        toast.success('Product updated successfully');
        return product;
      } catch (err: any) {
        toast.error(err.message || 'Failed to update product');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const result = await productService.delete(id);
      toast.success(result.message || 'Product deleted successfully');
      return result;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(
    async (options: {
      search: string;
      fields?: string[];
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      try {
        return await productService.search(options);
      } catch (err: any) {
        toast.error(err.message || 'Failed to search products');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    getById,
    create,
    update,
    delete: deleteProduct,
    search,
  };
};
