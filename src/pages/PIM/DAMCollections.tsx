import { FC, FormEvent, useState } from "react";
import { Folder, MoreVertical, Plus } from "lucide-react";
import { Collection } from "../../types/dam.types";

interface DAMCollectionsProps {
  collections: Collection[];
  onCreateCollection: (name: string, parentId?: number) => void;
  onDeleteCollection: (collectionId: number) => void;
  onRenameCollection: (collectionId: number, newName: string) => void;
  onSelectCollection: (collection: Collection) => void;
}

const DAMCollections: FC<DAMCollectionsProps> = ({
  collections,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
  onSelectCollection,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim());
      setNewCollectionName("");
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Collections</h1>
          <p className="text-slate-600 text-sm">Organize your assets into groups.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Collection
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {collections.map((collection) => (
          <div key={collection.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col">
            <div className="p-5 flex-1 cursor-pointer" onClick={() => onSelectCollection(collection)}>
              <div className="flex items-start justify-between mb-4">
                <Folder className="h-8 w-8 text-blue-500" />
                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1 truncate" title={collection.name}>
                {collection.name}
              </h3>
              <span className="text-sm text-slate-500">{collection.assetCount} items</span>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
              Created: {collection.createdDate}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
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
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
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
