import { FC, FormEvent, useMemo, useState } from "react";
import { Folder, Plus, ChevronLeft, Trash2 } from "lucide-react";
import { Collection, DigitalAsset } from "../../types/dam.types";

interface DAMCollectionsProps {
  collections: Collection[];
  // accept the prop under either name: `assets` (what DAMPage passes) or `allAssets`
  assets?: DigitalAsset[];
  allAssets?: DigitalAsset[]; // keep for compatibility if used elsewhere
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

  // use whichever prop is supplied; prefer `assets` (what DAMPage passes), fallback to `allAssets`
  const assetsSource = useMemo<DigitalAsset[]>(() => {
    return assets ?? allAssets ?? [];
  }, [assets, allAssets]);

  // Build a numeric-id -> asset map so numeric/string id mismatches don't hide assets
  const assetsById = useMemo(() => {
    const map = new Map<number, DigitalAsset>();
    for (const a of assetsSource || []) {
      const key = typeof a.id === "number" ? a.id : Number(a.id);
      if (!Number.isNaN(key)) {
        map.set(key, a);
      }
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

  // Map the collection children (which might be numbers or numeric-strings) to actual asset objects
  const currentCollectionAssets = useMemo(() => {
    if (!viewingCollectionId) return [];
    const col = collections.find((c) => c.id === viewingCollectionId);
    if (!col || !col.children || col.children.length === 0) return [];

    return col.children
      .map((rawId) => {
        const id = typeof rawId === "number" ? rawId : Number(rawId);
        if (Number.isNaN(id)) return undefined;
        return assetsById.get(id);
      })
      .filter((a): a is DigitalAsset => a !== undefined);
  }, [viewingCollectionId, collections, assetsById]);

  const handleRemoveAsset = (assetId: number) => {
    if (!collectionToShow) return;
    if (confirm("Remove this asset from collection?")) {
      // ensure we filter comparing numeric ids
      const updatedChildren = (collectionToShow.children ?? []).filter((raw) => {
        const numeric = typeof raw === "number" ? raw : Number(raw);
        return numeric !== assetId;
      });
      onUpdateCollectionChildren(collectionToShow.id, updatedChildren as number[]);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-8">
      {/* HEADER */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {viewingCollectionId ? collectionToShow?.name ?? "Collection" : "Collections"}
          </h1>
          <p className="text-slate-600 text-sm">
            {viewingCollectionId ? "Viewing assets in this collection" : "Organize your assets into groups."}
          </p>
        </div>

        {viewingCollectionId ? (
          <button
            onClick={closeCollectionView}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all"
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
            <div className="text-slate-500 text-center py-20 col-span-full">No collections created yet.</div>
          )}

          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => openCollection(collection)}
            >
              <div className="p-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Folder className="h-7 w-7 text-blue-600" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{collection.name}</h3>
                    <p className="text-sm text-slate-500">
                      {collection.assetCount ?? collection.children?.length ?? 0} items
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COLLECTION DETAIL VIEW */}
      {viewingCollectionId && collectionToShow && (
        <div className="space-y-6">
          {/* ASSETS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentCollectionAssets.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-lg shadow-sm p-10 text-center text-slate-500">
                No assets in this collection.
              </div>
            ) : (
              currentCollectionAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="relative bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-all"
                >
                  {/* Smaller thumbnail */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={asset.thumbnail || asset.url || "https://placehold.co/400x300/F0F0F0/CCC?text=No+Image"}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = "https://placehold.co/400x300/F0F0F0/CCC?text=Image+Error")
                      }
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <div className="text-xs font-medium text-slate-900 truncate">{asset.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1.5">
                      <span className="uppercase">{asset.format || "file"}</span>
                      <span>{asset.size || "--"}</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAsset(asset.id);
                    }}
                    title="Remove from collection"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CREATE COLLECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Create New Collection</h3>
            <form onSubmit={handleCreate}>
              <label htmlFor="collectionName" className="text-sm font-medium text-slate-700 mb-1 block">
                Collection Name
              </label>
              <input
                type="text"
                id="collectionName"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
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
