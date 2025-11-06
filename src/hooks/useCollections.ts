// hooks/useCollections.ts
import { useState, useCallback, useMemo } from "react";
import { Collection, CollectionsState } from "../types/collections.types";

export const useCollections = (initialCollections: Collection[]) => {
  const [state, setState] = useState<CollectionsState>({
    collections: initialCollections,
    activeCollectionId: null,
    expandedIds: new Set(),
    breadcrumb: [],
  });

  // Build collection tree
  const collectionTree = useMemo(() => {
    const buildTree = (parentId: number | null, level = 0): Collection[] => {
      return state.collections
        .filter((c) => c.parentId === parentId)
        .map((collection) => ({
          ...collection,
          level,
          subCollections: buildTree(collection.id, level + 1),
        }));
    };
    return buildTree(null);
  }, [state.collections]);

  // Get breadcrumb path
  const getBreadcrumb = useCallback(
    (collectionId: number | null): Collection[] => {
      if (!collectionId) return [];
      const path: Collection[] = [];
      let current = state.collections.find((c) => c.id === collectionId);

      while (current) {
        path.unshift(current);
        current = state.collections.find((c) => c.id === current!.parentId);
      }
      return path;
    },
    [state.collections]
  );

  const setActiveCollection = useCallback((id: number | null) => {
    setState((prev) => ({
      ...prev,
      activeCollectionId: id,
      breadcrumb: id ? getBreadcrumb(id).map((c) => c.id) : [],
    }));
  }, [getBreadcrumb]);

  const toggleExpanded = useCallback((id: number) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expandedIds);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { ...prev, expandedIds: newExpanded };
    });
  }, []);

  const expandAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expandedIds: new Set(prev.collections.map((c) => c.id)),
    }));
  }, []);

  const collapseAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expandedIds: new Set(),
    }));
  }, []);

  return {
    state,
    collectionTree,
    breadcrumb: getBreadcrumb(state.activeCollectionId),
    setActiveCollection,
    toggleExpanded,
    expandAll,
    collapseAll,
  };
};
