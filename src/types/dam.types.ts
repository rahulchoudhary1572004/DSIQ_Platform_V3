export interface DigitalAsset {
  id: number;
  name: string;
  type: "image" | "video" | "document" | "audio" | "archive";
  size: string;
  sizeInBytes: number;
  format: string;
  uploadDate: string;
  uploadedBy: string;
  url: string;
  thumbnail: string | null;
  duration?: string;
  dimensions?: string;
  pages?: number;
  files?: number;
  category?: string;
  tags?: string[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  status: "Active" | "Draft" | "Archived";
  assetCount: number;
  thumbnail: string;
}

export interface SearchFilters {
  searchTerm: string;
  assetType: "all" | "image" | "video" | "document" | "audio" | "archive";
  dateRange: {
    startDate: string;
    endDate: string;
  };
  uploader: string;
}

export interface Collection {
  children: any;
  children: boolean;
  id: number;
  name: string;
  assetCount: number;
  createdDate: string;
}
export interface Collection {
  id: number;
  name: string;
  assetCount: number;
  createdDate: string;
  children?: number[]; // <-- add this
}
export interface ProductCategory {
  id: number;
  name: string;
  products: Product[];
  isExpanded?: boolean;
}