/**
 * View Template Queries
 * GraphQL query builders for view template read operations
 * Note: Mutations (CREATE, UPDATE, DELETE) use REST API endpoints
 */

import { buildFields } from '../utils/queryBuilder';

/**
 * Default fields for view template queries
 * Matches backend ProductViewTemplateReadType schema
 */
const DEFAULT_SECTION_FIELDS = 'sections { id title order attributes { id name type required order options } }';
const DEFAULT_SIMPLE_FIELDS = ['id', 'name'];

export const DEFAULT_TEMPLATE_FIELDS = [
  ...DEFAULT_SIMPLE_FIELDS,
  DEFAULT_SECTION_FIELDS,
];

/**
 * Expand shorthand field names to full nested queries
 * If user requests 'sections' alone, expand to full section structure
 */
const expandFields = (fields: string[]): string[] => {
  return fields.map(field => {
    // If requesting 'sections' without subfields, use default section structure
    if (field === 'sections') {
      return DEFAULT_SECTION_FIELDS;
    }
    // If requesting 'attributes' without parent, wrap in sections
    if (field === 'attributes') {
      return DEFAULT_SECTION_FIELDS;
    }
    return field;
  });
};

/**
 * Build query to get all view templates
 */
export const buildGetViewTemplatesQuery = (
  fields: string[] = DEFAULT_TEMPLATE_FIELDS
) => {
  const expandedFields = expandFields(fields);
  const fieldString = buildFields(expandedFields);

  return `
    query GetViewTemplates {
      getProductviewtemplates {
        ${fieldString}
      }
    }
  `;
};

/**
 * Build query to get view template by ID
 * Requires both id and orgId in filter
 */
export const buildGetViewTemplateByIdQuery = (
  fields: string[] = DEFAULT_TEMPLATE_FIELDS
) => {
  const expandedFields = expandFields(fields);
  const fieldString = buildFields(expandedFields);

  return `
    query GetViewTemplateById($id: String!, $orgId: String!) {
      getProductviewtemplates(filter: { id: $id, orgId: $orgId }) {
        ${fieldString}
      }
    }
  `;
};
