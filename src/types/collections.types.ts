// types/collections.types.ts
export interface Collection {
  id: number;
  name: string;
  parentId: number | null;
  children?: number[]; // asset IDs
  subCollections?: Collection[]; // nested collections
  assetCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollectionTree extends Collection {
  level: number;
  path: number[]; // breadcrumb path
  isExpanded: boolean;
}

export interface CollectionsState {
  collections: Collection[];
  activeCollectionId: number | null;
  expandedIds: Set<number>;
  breadcrumb: number[];
}
