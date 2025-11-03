import { GridHandle } from "@progress/kendo-react-grid";

export interface Column {
  field: string;
  title: string;
  visible: boolean;
  required?: boolean;
}

export interface GridFilter {
  logic: "and" | "or";
  filters: any[];
}

export interface ChannelStatus {
  name: string;
  status: "synced" | "pending" | "failed";
  reason: string;
  lastSync: string;
}

export interface ProductData {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  subcategory: string;
  completeness: number;
  channels: ChannelStatus[];
  lastModified: string;
}