// components/DAM/DAMCollections.tsx - Figma Design + Samsung Animations + Apple Minimal
import { FC, FormEvent, useMemo, useState } from "react";
import { Folder, Plus, ChevronLeft, Trash2, Grid3x3 } from "lucide-react";
import { Collection, DigitalAsset } from "../../types/dam.types";

interface DAMCollectionsProps {
  collections: Collection[];
  assets?: DigitalAsset[];
  allAssets?: DigitalAsset[];
  onCreateCollection: (name: string, parentId?: number) => void;
  onDeleteCollection: (collectionId: number) => void;
  onRenameCollection: (collectionId: number, newName: string) => void;
  onUpdateCollectionChildren: (collectionId: number, newChildren: number[]) => void;
}

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
  const [viewingCollectionId, setViewingCollectionId] = useState<number | null>(null);

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

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;
    onCreateCollection(name);
    setNewCollectionName("");
    setShowCreateModal(false);
  };

  const openCollection = (collection: Collection) => setViewingCollectionId(collection.id);
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

  return (
    <div className="flex-1 overflow-auto bg-white p-10">
      {/* HEADER */}
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            {viewingCollectionId ? collectionToShow?.name ?? "Collection" : "Collections"}
          </h1>
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">
            {viewingCollectionId ? `${currentCollectionAssets.length} items` : `${collections.length} collections`}
          </p>
        </div>

        {viewingCollectionId ? (
          <button
            onClick={closeCollectionView}
            className="flex items-center gap-1.5 px-4 py-2 text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-all duration-300 font-medium text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-semibold text-sm shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Collection
          </button>
        )}
      </header>

      {/* COLLECTION LIST */}
      {!viewingCollectionId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {collections.length === 0 && (
            <div className="col-span-full text-center py-20">
              <Grid3x3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-light">No collections created yet.</p>
            </div>
          )}

          {collections.map((collection, idx) => (
            <button
              key={collection.id}
              onClick={() => openCollection(collection)}
              className="group bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-500 text-left cursor-pointer overflow-hidden"
              style={{
                animation: `slideUp 0.6s ease-out ${idx * 0.08}s both`
              }}
            >
              <style>{`
                @keyframes slideUp {
                  from {
                    opacity: 0;
                    transform: translateY(16px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
              
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <Folder className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              
              <h3 className="text-base font-medium text-gray-900 mb-1">{collection.name}</h3>
              <p className="text-xs text-gray-600 font-light">
                {collection.assetCount ?? collection.children?.length ?? 0} items
              </p>
            </button>
          ))}
        </div>
      )}

      {/* COLLECTION DETAIL VIEW */}
      {viewingCollectionId && collectionToShow && (
        <div className="space-y-6">
          {/* ASSETS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentCollectionAssets.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
                <Grid3x3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-light">No assets in this collection.</p>
              </div>
            ) : (
              currentCollectionAssets.map((asset, idx) => (
                <div
                  key={asset.id}
                  className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-500 aspect-[4/3] cursor-pointer transform"
                  style={{
                    animation: `fadeInScale 0.5s ease-out ${idx * 0.05}s both`
                  }}
                >
                  <style>{`
                    @keyframes fadeInScale {
                      from {
                        opacity: 0;
                        transform: scale(0.92);
                      }
                      to {
                        opacity: 1;
                        transform: scale(1);
                      }
                    }
                  `}</style>
                  
                  <img
                    src={asset.thumbnail || asset.url || "https://placehold.co/400x300/F3F4F6/999?text=No+Image"}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                    onError={(e) =>
                      (e.currentTarget.src = "https://placehold.co/400x300/F3F4F6/999?text=Image+Error")
                    }
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAsset(asset.id);
                    }}
                    title="Remove from collection"
                    className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-400 flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <Trash2 className="h-5 w-5 text-white transition-all duration-300" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE COLLECTION MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-400"
          onClick={() => setShowCreateModal(false)}
          style={{
            animation: `fadeIn 0.4s ease-out`
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          
          <div
            className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl transition-all duration-500 transform"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: `slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)`
            }}
          >
            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-24px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            
            <h3 className="text-lg font-light text-gray-900 mb-6">Create New Collection</h3>
            <form onSubmit={handleCreate}>
              <label htmlFor="collectionName" className="text-sm font-medium text-gray-700 mb-2 block">
                Collection Name
              </label>
              <input
                type="text"
                id="collectionName"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-100 transition-all duration-300 text-sm font-light"
                autoFocus
                placeholder="Collection name..."
              />
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300 font-light text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium text-sm shadow-sm"
                >
                  Create
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
