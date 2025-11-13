/**
 * View Template Hooks
 * React hooks for view template operations with state management
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { viewTemplateService } from '../services';
import type {
  ViewTemplate,
  CreateViewTemplateInput,
  UpdateViewTemplateInput,
  DuplicateViewTemplateInput,
} from '../types';

/**
 * Hook for fetching and managing view templates list
 */
export const useViewTemplates = (orgId: string) => {
  const [templates, setTemplates] = useState<ViewTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(
    async (options?: { fields?: string[] }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await viewTemplateService.getAll({ fields: options?.fields, orgId });
        setTemplates(data);
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch view templates';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [orgId]
  );

  return { templates, loading, error, fetchTemplates, setTemplates };
};

/**
 * Hook for view template CRUD operations
 */
export const useViewTemplateOperations = (orgId: string) => {
  const [loading, setLoading] = useState(false);

  const handleOperation = useCallback(
    async <T,>(operation: () => Promise<T>, successMessage: string, errorMessage: string): Promise<T> => {
      setLoading(true);
      try {
        const result = await operation();
        toast.success(successMessage);
        return result;
      } catch (err: any) {
        toast.error(err.message || errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getById = useCallback(
    (id: string, fields?: string[]) =>
      handleOperation(
        () => viewTemplateService.getById(id, orgId, fields),
        '',
        'Failed to fetch view template'
      ),
    [orgId, handleOperation]
  );

  const create = useCallback(
    (input: CreateViewTemplateInput, fields?: string[]) =>
      handleOperation(
        () => viewTemplateService.create(input, fields),
        'View template created successfully',
        'Failed to create view template'
      ),
    [handleOperation]
  );

  const update = useCallback(
    (input: UpdateViewTemplateInput, fields?: string[]) =>
      handleOperation(
        () => viewTemplateService.update(input, fields),
        'View template updated successfully',
        'Failed to update view template'
      ),
    [handleOperation]
  );

  const deleteTemplate = useCallback(
    (id: string) =>
      handleOperation(
        () => viewTemplateService.delete(id),
        'View template deleted successfully',
        'Failed to delete view template'
      ),
    [handleOperation]
  );

  const duplicate = useCallback(
    (id: string, input: DuplicateViewTemplateInput) =>
      handleOperation(
        () => viewTemplateService.duplicate(id, input),
        'View template duplicated successfully',
        'Failed to duplicate view template'
      ),
    [handleOperation]
  );

  return { loading, getById, create, update, delete: deleteTemplate, duplicate };
};
