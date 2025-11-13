/**
 * View Template Types
 * Updated to match new backend API structure
 */

export interface ViewTemplate {
  id: string;
  name: string;
  orgId?: string;
  sections?: ViewSection[];
}

export interface ViewSection {
  id: string;
  title: string;
  order: number;
  attributes: ViewAttribute[];
}

export interface ViewAttribute {
  id: string;
  name: string;
  type: string; // "Text", "Number", "Dropdown", "Date", "Boolean", "Rich Text"
  required: boolean;
  order: number;
  options?: string[]; // For dropdown type attributes
}

// Input types for create operations (no IDs required - backend generates them)
export interface CreateViewAttributeInput {
  name: string;
  type: string;
  required: boolean;
  order: number;
  options?: string[];
}

export interface CreateViewSectionInput {
  title: string; // Note: API uses 'title' for sections, not 'name'
  order: number;
  attributes: CreateViewAttributeInput[];
}

export interface CreateViewTemplateInput {
  name: string;
  sections: CreateViewSectionInput[];
}

export interface UpdateViewTemplateInput {
  template_id: string;
  delete_full?: boolean;
  update_data?: {
    name?: string;
    sections?: Array<{
      id?: string;
      title: string;
      order: number;
      attributes: Array<{
        id?: string;
        name: string;
        type: string;
        required: boolean;
        order: number;
        options?: string[];
      }>;
    }>;
  };
  delete_data?: {
    section_ids?: string[];
    attributes?: Array<{
      id: string;
      section_id: string;
    }>;
  };
}

export interface DuplicateViewTemplateInput {
  name: string;
}
