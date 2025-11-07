// components/DAM/DAMCollections.tsx - Advanced Windows-like Collections
import { FC, FormEvent, useMemo, useState, useRef, useEffect } from "react";
import { 
  Folder, 
  Plus, 
  ChevronLeft, 
  Trash2, 
  Grid3x3, 
  MoreVertical,
  Edit2,
  Star,
  Pin,
  Archive,
  Clock,
  TrendingUp,
  Search,
  SortAsc,
  LayoutGrid,
  List,
  X,
  Check,
  FolderOpen,
  Lock,
  Unlock,
  Copy
} from "lucide-react";
import { Collection, DigitalAsset } from "../../types/dam.types";

type SortOption = "name" | "date" | "size" | "recent";
type ViewMode = "grid" | "list";
type CollectionColor = "blue" | "green" | "purple" | "orange" | "pink" | "gray";

interface ExtendedCollection extends Collection {
  color?: CollectionColor;
  isPinned?: boolean;
  isStarred?: boolean;
  isLocked?: boolean;
  icon?: string;
  description?: string;
}

interface DAMCollectionsProps {
  collections: Collection[];
  assets?: DigitalAsset[];
  allAssets?: DigitalAsset[];
  onCreateCollection: (name: string, parentId?: number) => void;
  onDeleteCollection: (collectionId: number) => void;
  onRenameCollection: (collectionId: number, newName: string) => void;
  onUpdateCollectionChildren: (collectionId: number, newChildren: number[]) => void;
}

const COLLECTION_COLORS: Record<CollectionColor, { bg: string; border: string; text: string; icon: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "bg-blue-100" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "bg-green-100" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "bg-purple-100" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "bg-orange-100" },
  pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", icon: "bg-pink-100" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: "bg-gray-100" },
};

const DAMCollections: FC<DAMCollectionsProps> = ({
  collections,
  assets,
  allAssets,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
  onUpdateCollectionChildren,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState<CollectionColor>("blue");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [viewingCollectionId, setViewingCollectionId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<Set<number>>(new Set());
  const [contextMenuCollection, setContextMenuCollection] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [extendedCollections, setExtendedCollections] = useState<Map<number, Partial<ExtendedCollection>>>(new Map());
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuCollection(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const assetsSource = useMemo<DigitalAsset[]>(() => {
    return assets ?? allAssets ?? [];
  }, [assets, allAssets]);

  const assetsById = useMemo(() => {
    const map = new Map<number, DigitalAsset>();
    for (const a of assetsSource || []) {
      const key = typeof a.id === "number" ? a.id : Number(a.id);
      if (!Number.isNaN(key)) map.set(key, a);
    }
    return map;
  }, [assetsSource]);

  // Get extended collection data
  const getExtendedCollection = (id: number): ExtendedCollection => {
    const base = collections.find(c => c.id === id);
    const extended = extendedCollections.get(id) || {};
    return { ...base, ...extended } as ExtendedCollection;
  };

  // Toggle collection property
  const toggleCollectionProperty = (id: number, property: keyof ExtendedCollection) => {
    setExtendedCollections(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(id) || {};
      newMap.set(id, { ...current, [property]: !current[property] });
      return newMap;
    });
    setContextMenuCollection(null);
  };

  // Update collection color
  const updateCollectionColor = (id: number, color: CollectionColor) => {
    setExtendedCollections(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(id) || {};
      newMap.set(id, { ...current, color });
      return newMap;
    });
  };

  // Filter and sort collections
  const filteredAndSortedCollections = useMemo(() => {
    let filtered = collections.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add extended data
    const extended = filtered.map(c => getExtendedCollection(c.id));

    // Sort pinned first
    extended.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    // Apply sorting
    switch (sortBy) {
      case "name":
        extended.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            return a.name.localeCompare(b.name);
          }
          return 0;
        });
        break;
      case "date":
        extended.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          }
          return 0;
        });
        break;
      case "size":
        extended.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            const sizeA = a.assetCount ?? a.children?.length ?? 0;
            const sizeB = b.assetCount ?? b.children?.length ?? 0;
            return sizeB - sizeA;
          }
          return 0;
        });
        break;
    }

    return extended;
  }, [collections, searchQuery, sortBy, extendedCollections]);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;
    onCreateCollection(name);
    
    // Store extended data for new collection
    const newId = Math.max(...collections.map(c => c.id), 0) + 1;
    setExtendedCollections(prev => {
      const newMap = new Map(prev);
      newMap.set(newId, {
        color: newCollectionColor,
        description: newCollectionDescription,
      });
      return newMap;
    });
    
    setNewCollectionName("");
    setNewCollectionColor("blue");
    setNewCollectionDescription("");
    setShowCreateModal(false);
  };

  const handleRename = (id: number, newName: string) => {
    if (newName.trim()) {
      onRenameCollection(id, newName.trim());
    }
    setRenamingId(null);
  };

  const handleDelete = (id: number) => {
    const collection = getExtendedCollection(id);
    if (confirm(`Delete "${collection.name}"?`)) {
      onDeleteCollection(id);
      setExtendedCollections(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
    setContextMenuCollection(null);
  };

  const handleBulkDelete = () => {
    if (selectedCollections.size === 0) return;
    if (confirm(`Delete ${selectedCollections.size} collection(s)?`)) {
      selectedCollections.forEach(id => {
        onDeleteCollection(id);
      });
      setSelectedCollections(new Set());
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedCollections(new Set(filteredAndSortedCollections.map(c => c.id)));
  };

  const clearSelection = () => {
    setSelectedCollections(new Set());
  };

  const openCollection = (collection: ExtendedCollection) => setViewingCollectionId(collection.id);
  const closeCollectionView = () => setViewingCollectionId(null);

  const collectionToShow = collections.find((c) => c.id === viewingCollectionId) || null;

  const currentCollectionAssets = useMemo(() => {
    if (!viewingCollectionId) return [];
    const col = collections.find((c) => c.id === viewingCollectionId);
    if (!col?.children?.length) return [];
    return col.children
      .map((rawId) => {
        const id = typeof rawId === "number" ? rawId : Number(rawId);
        return !Number.isNaN(id) ? assetsById.get(id) : undefined;
      })
      .filter((a): a is DigitalAsset => a !== undefined);
  }, [viewingCollectionId, collections, assetsById]);

  const handleRemoveAsset = (assetId: number) => {
    if (!collectionToShow) return;
    if (confirm("Remove this asset from collection?")) {
      const updatedChildren = (collectionToShow.children ?? []).filter((raw) => {
        const numeric = typeof raw === "number" ? raw : Number(raw);
        return numeric !== assetId;
      });
      onUpdateCollectionChildren(collectionToShow.id, updatedChildren as number[]);
    }
  };

  const renderCollectionCard = (collection: ExtendedCollection, idx: number) => {
    const colors = collection.color ? COLLECTION_COLORS[collection.color] : COLLECTION_COLORS.blue;
    const isSelected = selectedCollections.has(collection.id);
    
    return (
      <div
        key={collection.id}
        className={`group relative ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        style={{
          animation: `slideUp 0.3s ease-out ${idx * 0.05}s both`
        }}
      >
        {/* Selection Checkbox */}
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelection(collection.id);
            }}
            className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer accent-blue-600 transition-all duration-150"
          />
        </div>

        {/* Pin Badge */}
        {collection.isPinned && (
          <div className="absolute top-3 right-12 z-10">
            <Pin className="h-4 w-4 text-blue-600 fill-blue-600" />
          </div>
        )}

        {/* Context Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setContextMenuCollection(contextMenuCollection === collection.id ? null : collection.id);
          }}
          className="absolute top-3 right-3 z-10 p-1 opacity-0 group-hover:opacity-100 hover:bg-white/80 rounded-md transition-all duration-150"
        >
          <MoreVertical className="h-4 w-4 text-gray-600" />
        </button>

        {/* Context Menu */}
        {contextMenuCollection === collection.id && (
          <div
            ref={contextMenuRef}
            className="absolute top-12 right-3 z-20 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] animate-fade-in"
          >
            <button
              onClick={() => toggleCollectionProperty(collection.id, 'isPinned')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Pin className="h-4 w-4" />
              {collection.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => toggleCollectionProperty(collection.id, 'isStarred')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              {collection.isStarred ? 'Unstar' : 'Star'}
            </button>
            <button
              onClick={() => setRenamingId(collection.id)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Rename
            </button>
            <button
              onClick={() => toggleCollectionProperty(collection.id, 'isLocked')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              {collection.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {collection.isLocked ? 'Unlock' : 'Lock'}
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={() => handleDelete(collection.id)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}

        {/* Card Content */}
        <div
          onClick={() => !collection.isLocked && openCollection(collection)}
          className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer ${
            collection.isLocked ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center shadow-sm`}>
              {collection.isLocked ? (
                <Lock className={`h-6 w-6 ${colors.text}`} />
              ) : collection.isStarred ? (
                <Star className={`h-6 w-6 ${colors.text} fill-current`} />
              ) : (
                <FolderOpen className={`h-6 w-6 ${colors.text}`} />
              )}
            </div>
          </div>
          
          {renamingId === collection.id ? (
            <input
              autoFocus
              type="text"
              defaultValue={collection.name}
              onBlur={(e) => handleRename(collection.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(collection.id, e.currentTarget.value);
                if (e.key === 'Escape') setRenamingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 border-2 border-blue-400 rounded-md text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          ) : (
            <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{collection.name}</h3>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{collection.assetCount ?? collection.children?.length ?? 0} items</span>
            {collection.createdAt && (
              <span className="text-gray-400">
                {new Date(collection.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {collection.description && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2">{collection.description}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>

      {/* TOOLBAR */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {viewingCollectionId && (
              <button
                onClick={closeCollectionView}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-150 font-medium text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            
            <h1 className="text-2xl font-semibold text-gray-900">
              {viewingCollectionId ? collectionToShow?.name ?? "Collection" : "Collections"}
            </h1>
            
            {viewingCollectionId && collectionToShow && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {currentCollectionAssets.length} items
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!viewingCollectionId && selectedCollections.size > 0 && (
              <div className="flex items-center gap-2 mr-2 animate-fade-in">
                <span className="text-sm text-gray-600 font-medium">
                  {selectedCollections.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-150"
                  title="Delete selected"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={clearSelection}
                  className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-all duration-150"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {!viewingCollectionId && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-150 font-medium text-sm shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Collection
              </button>
            )}
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        {!viewingCollectionId && (
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="date">Sort: Date</option>
              <option value="size">Sort: Size</option>
            </select>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-150 ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-150 ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="p-8">
        {!viewingCollectionId ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-3"}>
            {filteredAndSortedCollections.length === 0 && (
              <div className="col-span-full text-center py-20">
                <Grid3x3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium mb-2">No collections yet</p>
                <p className="text-gray-400 text-sm">Create your first collection to get started</p>
              </div>
            )}
            {filteredAndSortedCollections.map((collection, idx) => renderCollectionCard(collection, idx))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentCollectionAssets.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Grid3x3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-medium">No assets in this collection</p>
              </div>
            ) : (
              currentCollectionAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200 aspect-square"
                >
                  <img
                    src={asset.thumbnail || asset.url || "https://placehold.co/400x400/F3F4F6/999?text=No+Image"}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) =>
                      (e.currentTarget.src = "https://placehold.co/400x400/F3F4F6/999?text=Error")
                    }
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAsset(asset.id);
                    }}
                    className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New Collection</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150"
                  placeholder="e.g., Product Photos"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description (Optional)
                </label>
                <textarea
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 resize-none"
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Color Theme
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.entries(COLLECTION_COLORS).map(([color, styles]) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCollectionColor(color as CollectionColor)}
                      className={`w-10 h-10 rounded-lg ${styles.icon} border-2 ${
                        newCollectionColor === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-transparent'
                      } transition-all duration-150`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-150 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-150 font-medium shadow-sm"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DAMCollections;
