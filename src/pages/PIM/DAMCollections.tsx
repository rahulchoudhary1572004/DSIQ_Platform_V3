import { FC, useState, useMemo, ChangeEvent, JSX, useCallback } from "react";
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Search,
  X,
  Copy,
  Calendar,
  User,
  Image,
  Play,
  Download,
  Eye,
  Grid3x3,
} from "lucide-react";
import { Collection, DigitalAsset } from "../../types/dam.types";

interface DAMCollectionsProps {
  collections: Collection[];
  allAssets?: DigitalAsset[];
  onCreateCollection?: (name: string, parentId?: number, description?: string) => void;
  onDeleteCollection?: (collectionId: number) => void;
  onRenameCollection?: (collectionId: number, newName: string) => void;
}

const DAMCollections: FC<DAMCollectionsProps> = ({
  collections,
  allAssets = [],
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
}) => {
  // ==================== STATE ====================
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set([0]));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [showNewCollectionInput, setShowNewCollectionInput] = useState<boolean>(false);
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  
  // Modal state
  const [showAssetModal, setShowAssetModal] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date" | "assets">("name");

  // ==================== GET COLLECTION ASSETS ====================
  const getCollectionAssets = useCallback(
    (collectionId: number) => {
      // In real app, you'd query based on collectionId
      // For now, returning sample assets - you need to map assets to collections
      return allAssets.slice(0, 8); // Example: return first 8 assets
    },
    [allAssets]
  );

  // ==================== FILTER & SORT ====================
  const filteredCollections = useMemo(() => {
    if (!searchTerm) return collections;
    return collections.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [collections, searchTerm]);

  const sortedCollections = useMemo(() => {
    const sorted = [...filteredCollections];
    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        sorted.sort(
          (a, b) =>
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        break;
      case "assets":
        sorted.sort((a, b) => b.assetCount - a.assetCount);
        break;
    }
    return sorted;
  }, [filteredCollections, sortBy]);

  // Get assets for modal
  const modalAssets = useMemo(() => {
    if (!selectedCollectionId) return [];
    return getCollectionAssets(selectedCollectionId);
  }, [selectedCollectionId, getCollectionAssets]);

  // Get selected collection
  const selectedCollection = useMemo(() => {
    const findCollection = (cols: Collection[]): Collection | undefined => {
      for (const col of cols) {
        if (col.id === selectedCollectionId) return col;
        if (col.children) {
          const found = findCollection(col.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findCollection(collections);
  }, [selectedCollectionId, collections]);

  // ==================== HANDLERS ====================
  const toggleCollection = useCallback((collectionId: number) => {
    setExpandedCollections((prev) => {
      const newSet = new Set(prev);
      newSet.has(collectionId) ? newSet.delete(collectionId) : newSet.add(collectionId);
      return newSet;
    });
  }, []);

  const handleSelectCollection = useCallback((collection: Collection) => {
    setSelectedCollectionId(collection.id);
    setShowAssetModal(true);
  }, []);

  const handleCreateCollection = useCallback(() => {
    if (!newCollectionName.trim()) {
      alert("Please enter a collection name");
      return;
    }
    onCreateCollection?.(newCollectionName, selectedParentId);
    setNewCollectionName("");
    setShowNewCollectionInput(false);
    setSelectedParentId(undefined);
  }, [newCollectionName, selectedParentId, onCreateCollection]);

  const handleRenameCollection = useCallback(
    (collectionId: number) => {
      if (!editingName.trim()) {
        alert("Please enter a collection name");
        return;
      }
      onRenameCollection?.(collectionId, editingName);
      setEditingId(null);
      setEditingName("");
    },
    [editingName, onRenameCollection]
  );

  const totalAssets = collections.reduce((sum, c) => sum + c.assetCount, 0);

  // ==================== RENDER COLLECTION ITEM ====================
  const renderCollection = (collection: Collection, level: number = 0): JSX.Element => {
    const isExpanded = expandedCollections.has(collection.id);
    const hasChildren = collection.children && collection.children.length > 0;
    const isEditing = editingId === collection.id;
    const isHovered = hoveredId === collection.id;
    const isSelected = selectedCollectionId === collection.id;

    const stats = (() => {
      let total = collection.assetCount;
      let nested = 0;
      const traverse = (col: Collection) => {
        if (col.children && col.children.length > 0) {
          nested += col.children.length;
          col.children.forEach((child) => {
            total += child.assetCount;
            traverse(child);
          });
        }
      };
      traverse(collection);
      return { total, nested };
    })();

    return (
      <div
        key={collection.id}
        className={`${level > 0 ? "ml-4" : ""}`}
        onMouseEnter={() => setHoveredId(collection.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <div
          onClick={() => handleSelectCollection(collection)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
            isSelected
              ? "bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-blue-600 shadow-lg"
              : isHovered
              ? "bg-gray-100 hover:bg-gray-150"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          {/* Expand Button */}
          <div className="w-6 flex justify-center">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollection(collection.id);
                }}
                className="p-0.5 hover:bg-gray-300 rounded transition-colors"
              >
                <ChevronRight
                  size={18}
                  className={`transition-transform duration-300 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            ) : (
              <div className="w-4" />
            )}
          </div>

          {/* Folder Icon */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <FolderOpen size={20} className="text-blue-600" />
            ) : (
              <Folder size={20} className="text-gray-500" />
            )}
          </div>

          {/* Collection Info */}
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              autoFocus
              onBlur={() => handleRenameCollection(collection.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameCollection(collection.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1 border-2 border-blue-500 rounded-lg text-sm font-semibold"
            />
          ) : (
            <div className="flex-1">
              <h3
                className={`font-semibold text-sm truncate ${
                  isSelected ? "text-blue-700" : "text-gray-900"
                }`}
              >
                {collection.name}
              </h3>
              <p className="text-xs text-gray-500">
                {new Date(collection.createdDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Stats Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-500">items</div>
            </div>
            {hasChildren && (
              <div className="text-right border-l border-gray-300 pl-2">
                <div className="text-sm font-bold text-purple-600">{stats.nested}</div>
                <div className="text-xs text-gray-500">nested</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center gap-1 ${isHovered ? "opacity-100" : "opacity-0"}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(collection.id);
                setEditingName(collection.name);
              }}
              className="p-1.5 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
              title="Rename"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedParentId(collection.id);
                setShowNewCollectionInput(true);
              }}
              className="p-1.5 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
              title="Add subcollection"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${collection.name}"?`)) {
                  onDeleteCollection?.(collection.id);
                  setSelectedCollectionId(null);
                }
              }}
              className="p-1.5 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Nested Collections */}
        {isExpanded && hasChildren && (
          <div className="ml-2 border-l border-gray-300 pl-2 my-1">
            {collection.children!.map((child) => renderCollection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
              <p className="text-gray-600 text-sm mt-1">
                Click a collection to view its assets
              </p>
            </div>
            <button
              onClick={() => {
                setShowNewCollectionInput(true);
                setSelectedParentId(undefined);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <Plus className="h-4 w-4" />
              New Collection
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Folder className="h-4 w-4 text-blue-600" />
              <span>
                <span className="font-bold text-blue-600">
                  {collections.length}
                </span>{" "}
                collections
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
              <Grid3x3 className="h-4 w-4 text-purple-600" />
              <span>
                <span className="font-bold text-purple-600">{totalAssets}</span>{" "}
                total assets
              </span>
            </div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="assets">Sort by Assets</option>
          </select>
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-2">
        {sortedCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <Folder className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">No collections</p>
            <p className="text-gray-600 text-sm">Create your first collection</p>
          </div>
        ) : (
          sortedCollections.map((collection) => renderCollection(collection))
        )}
      </div>

      {/* ==================== ASSET MODAL POPUP ==================== */}
      {showAssetModal && selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <Grid3x3 className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedCollection.name}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {modalAssets.length}{" "}
                    {modalAssets.length === 1 ? "asset" : "assets"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAssetModal(false);
                  setSelectedCollectionId(null);
                  setSelectedAsset(null);
                }}
                className="p-2 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto px-6 py-6">
              {modalAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Image className="h-16 w-16 text-gray-300 mb-3" />
                  <p className="text-gray-600 font-medium">
                    No assets in this collection
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {modalAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`group bg-white rounded-xl overflow-hidden border-2 transition-all cursor-pointer hover:shadow-lg ${
                        selectedAsset?.id === asset.id
                          ? "border-blue-500 shadow-lg"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {asset.thumbnail ? (
                          <img
                            src={asset.thumbnail}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">
                            {asset.type === "video" ? "🎬" : "📁"}
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="p-2 bg-white text-green-600 rounded-full hover:bg-green-50 transition-colors">
                            <Download className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-white/90 rounded-lg text-xs font-bold text-gray-900">
                            {asset.type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Asset Info */}
                      <div className="p-3 space-y-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {asset.name}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="font-medium">{asset.format}</span>
                          <span className="font-bold">{asset.size}</span>
                        </div>
                        {asset.dimensions && (
                          <p className="text-xs text-gray-500">
                            📐 {asset.dimensions}
                          </p>
                        )}
                        {asset.duration && (
                          <p className="text-xs text-gray-500">
                            ⏱️ {asset.duration}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t border-gray-200">
                          <User className="h-3 w-3" />
                          <span>{asset.uploadedBy}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssetModal(false);
                  setSelectedCollectionId(null);
                  setSelectedAsset(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
              {selectedAsset && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== NEW COLLECTION MODAL ==================== */}
      {showNewCollectionInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full sm:max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedParentId ? "New Subcollection" : "New Collection"}
              </h2>
              <button
                onClick={() => {
                  setShowNewCollectionInput(false);
                  setNewCollectionName("");
                  setSelectedParentId(undefined);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateCollection();
                  }}
                  placeholder="e.g., Campaign Assets"
                  autoFocus
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowNewCollectionInput(false);
                  setNewCollectionName("");
                  setSelectedParentId(undefined);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DAMCollections;
