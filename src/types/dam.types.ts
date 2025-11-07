// types/dam.types.ts - COMPLETE & CLEAN
export interface DigitalAsset {
  id: number;
  name: string;
  type: "image" | "video" | "document" | "audio" | "archive";
  size: string; // Display size like "2.5 MB"
  sizeInBytes: number; // Actual bytes
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

export interface Collection {
  id: number;
  name: string;
  parentId: number | null; // For hierarchical folders
  children?: number[]; // Asset IDs in this folder
  assetCount?: number;
  createdDate: string;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface ProductCategory {
  id: number;
  name: string;
  products: Product[];
  isExpanded?: boolean;
}

export interface FileMetadata {
  name: string;
  description: string;
  tags: string[];
  uploadedBy: string;
}

export interface FileWithMetadata extends FileMetadata {
  file: File;
  status: "pending" | "editing" | "complete" | "uploading" | "error";
  progress: number;
  id: string;
}

export interface UploadState {
  files: FileWithMetadata[];
  selectedIdx: number | null;
  isLoading: boolean;
  error: string | null;
}
