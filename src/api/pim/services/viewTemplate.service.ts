/**
 * View Template Service
 * Handles view template operations using GraphQL (queries) and REST API (mutations)
 */

import axios from 'axios';
import { graphqlClient } from '../utils';
import { buildGetViewTemplatesQuery, buildGetViewTemplateByIdQuery } from '../queries';
import type {
  ViewTemplate,
  CreateViewTemplateInput,
  UpdateViewTemplateInput,
  DuplicateViewTemplateInput,
} from '../types';

// REST API client for mutations
const restApi = axios.create({
  baseURL: 'http://172.16.14.16:8080',
  headers: { 'Content-Type': 'application/json' },
});

interface GetTemplatesOptions {
  fields?: string[];
  orgId: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Helper function to normalize field types from API
const normalizeFieldType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'TEXT': 'Text',
    'NUMBER': 'Number',
    'BOOLEAN': 'Boolean',
    'DATE': 'Date',
    'LONG TEXT': 'Long Text',
    'LONGTEXT': 'Long Text',
    'RICH TEXT': 'Rich Text',
    'RICHTEXT': 'Rich Text',
    'DROPDOWN': 'Dropdown',
    'PICKLIST': 'Dropdown',
    'STRING': 'Text',
  }
  
  const upperType = type.toUpperCase()
  return typeMap[upperType] || type
}

// Normalize view template data from API
const normalizeViewTemplate = (template: any): ViewTemplate => {
  return {
    ...template,
    sections: template.sections?.map((section: any) => ({
      ...section,
      attributes: section.attributes?.map((attr: any) => ({
        ...attr,
        type: normalizeFieldType(attr.type)
      }))
    }))
  }
}

class ViewTemplateService {
  /**
   * Get all view templates (GraphQL)
   */
  async getAll(options: GetTemplatesOptions): Promise<ViewTemplate[]> {
    const query = buildGetViewTemplatesQuery(options.fields);
    const data = await graphqlClient.request<{ getProductviewtemplates: ViewTemplate[] }>({
      query,
      variables: {},
    });
    return data.getProductviewtemplates.map(normalizeViewTemplate);
  }

  /**
   * Get view template by ID (GraphQL)
   */
  async getById(id: string, orgId: string, fields?: string[]): Promise<ViewTemplate | null> {
    const query = buildGetViewTemplateByIdQuery(fields);
    const data = await graphqlClient.request<{ getProductviewtemplates: ViewTemplate[] }>({
      query,
      variables: { id, orgId },
    });
    const template = data.getProductviewtemplates[0] || null;
    return template ? normalizeViewTemplate(template) : null;
  }

  /**
   * Create view template (REST API)
   * Endpoint: POST /api/v1/pim/views
   */
  async create(input: CreateViewTemplateInput, fields?: string[]): Promise<ViewTemplate> {
    const { data } = await restApi.post<ApiResponse<{ template_id: string }>>(
      '/api/v1/pim/views',
      { name: input.name, sections: input.sections }
    );

    // Map input to ViewTemplate (backend only returns ID)
    return {
      id: data.data.template_id,
      name: input.name,
      sections: input.sections.map((section, idx) => ({
        id: `temp-section-${idx}`,
        title: section.title,
        order: section.order,
        attributes: section.attributes.map((attr, attrIdx) => ({
          id: `temp-attr-${attrIdx}`,
          name: attr.name,
          type: attr.type,
          required: attr.required,
          order: attr.order,
          options: attr.options,
        })),
      })),
    };
  }

  /**
   * Update view template (REST API)
   * Endpoint: POST /api/v1/pim/views/update
   */
  async update(input: UpdateViewTemplateInput, fields?: string[]): Promise<ViewTemplate> {
    const { data } = await restApi.post<ApiResponse<ViewTemplate>>(
      '/api/v1/pim/views/update',
      {
        template_id: input.template_id,
        delete_full: input.delete_full || false,
        update_data: input.update_data,
        delete_data: input.delete_data,
      }
    );
    return normalizeViewTemplate(data.data);
  }

  /**
   * Delete view template (REST API)
   * Uses update endpoint with delete_full flag
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await restApi.post<ApiResponse<unknown>>(
      '/api/v1/pim/views/update',
      { template_id: id, delete_full: true }
    );
    return {
      success: data.status === 'success',
      message: data.message,
    };
  }

  /**
   * Duplicate view template (REST API)
   * Endpoint: POST /api/v1/pim/views/duplicate/{id}
   */
  async duplicate(id: string, input: DuplicateViewTemplateInput): Promise<ViewTemplate> {
    const { data } = await restApi.post<ApiResponse<ViewTemplate>>(
      `/api/v1/pim/views/duplicate/${id}`,
      { name: input.name }
    );
    return normalizeViewTemplate(data.data);
  }
}

export const viewTemplateService = new ViewTemplateService();
