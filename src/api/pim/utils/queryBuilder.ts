/**
 * GraphQL Query Builder
 * Dynamic query construction based on user requirements
 * Follows DRY principle - reusable query building logic
 */

/**
 * Build fields string from array of field names
 * Supports:
 * - Simple fields: 'id', 'name'
 * - Nested fields with subfields: 'sections { id title }'
 * - Dot notation: 'sections.id', 'sections.title'
 */
export const buildFields = (fields: string[]): string => {
  const processedFields: string[] = [];
  const nestedFields = new Map<string, Set<string>>();

  fields.forEach(field => {
    // If field contains curly braces, it's already formatted - use as is
    if (field.includes('{')) {
      processedFields.push(field);
    }
    // If field uses dot notation (e.g., 'sections.id')
    else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!nestedFields.has(parent)) {
        nestedFields.set(parent, new Set());
      }
      nestedFields.get(parent)!.add(child);
    }
    // Simple field
    else {
      processedFields.push(field);
    }
  });

  // Build nested fields from dot notation
  nestedFields.forEach((children, parent) => {
    if (children.size > 0) {
      processedFields.push(`${parent} { ${Array.from(children).join(' ')} }`);
    }
  });

  return processedFields.join('\n    ');
};

/**
 * Build filter arguments from object
 */
export const buildFilterArgs = (filter: Record<string, any>): string => {
  const args = Object.entries(filter)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}: "${value}"`;
      }
      if (typeof value === 'boolean' || typeof value === 'number') {
        return `${key}: ${value}`;
      }
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return '';
    })
    .filter(Boolean);

  return args.join(', ');
};

/**
 * Build pagination arguments
 */
export const buildPaginationArgs = (page?: number, limit?: number): string => {
  const args: string[] = [];
  if (page !== undefined) args.push(`page: ${page}`);
  if (limit !== undefined) args.push(`limit: ${limit}`);
  return args.join(', ');
};
