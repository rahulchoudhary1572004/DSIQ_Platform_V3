// components/DAM/DAM.tsx
import React, { useState, useMemo, FC } from "react";
import {
  HardDrive,
  X,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Folder as FolderIcon,
  List,
  LayoutGrid,
  Plus,
  Minus,
} from "lucide-react";

import DAMNavbar from "./DAMNavbar";
import DAMSidebar from "./DAMSidebar";
import DAMAssetCard from "./DAMAssetCard";
import DAMSearchFilters from "./DAMSearchFilters";
import DAMAssetDetail from "./DAMAssetDetail";
import DAMUpload from "./DAMUpload";
import DAMCollections from "./DAMCollections";

import { DigitalAsset, Product, SearchFilters, Collection } from "../../types/dam.types";
import { products, digitalAssets, mockCollections } from "./dam.data";

type ActiveTab = "library" | "upload" | "collections";
type ViewMode = "grid" | "list";

const formatCount = (n?: number | null) => (typeof n === "number" ? n : 0);

/* ===== AssetGrid ===== */
interface AssetGridProps {
  assets: DigitalAsset[];
  selectedAssets: Set<number>;
  viewMode: ViewMode;
  cardSize: number;
  onSelectAsset: (assetId: number) => void;
  onPreviewAsset: (asset: DigitalAsset) => void;
  onDownloadAsset: (assetId: number) => void;
  onDeleteAsset: (assetId: number) => void;
  onAddToCollection?: (asset: DigitalAsset) => void;
  currentCollectionId?: number | null;
  onRemoveFromCollection?: (collectionId: number, assetId: number) => void;
  isDetailModalOpen?: boolean;
}

const AssetGrid: FC<AssetGridProps> = ({
  assets,
  selectedAssets,
  viewMode,
  cardSize,
  onSelectAsset,
  onPreviewAsset,
  onDownloadAsset,
  onDeleteAsset,
  onAddToCollection,
  currentCollectionId = null,
  onRemoveFromCollection,
  isDetailModalOpen = false,
}) => {
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize * 30}px, 1fr))`,
  };

  if (viewMode === "list") {
    return (
      <div className={`space-y-3 pb-12 transition-all duration-300 ${isDetailModalOpen ? "opacity-50 pointer-events-none" : ""}`}>
        {/* LIST HEADER - LARGER */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white border border-slate-200/60 rounded-lg sticky top-0 text-sm font-semibold text-slate-700 mb-2">
          <div className="col-span-1">Select</div>
          <div className="col-span-1">Thumbnail</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Format</div>
          <div className="col-span-2">Upload Date</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* LIST ROWS - LARGER HEIGHT */}
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="grid grid-cols-12 gap-4 px-6 py-5 bg-white border border-slate-200/60 rounded-lg hover:shadow-md hover:border-slate-300 transition-all duration-200 group items-center"
          >
            {/* CHECKBOX */}
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedAssets.has(asset.id)}
                onChange={() => onSelectAsset(asset.id)}
                className="w-5 h-5 rounded cursor-pointer accent-blue-600"
              />
            </div>

            {/* THUMBNAIL */}
            <div className="col-span-1 flex items-center">
              <div className="w-14 h-14 rounded-lg bg-slate-100 flex-shrink-0" />
            </div>

            {/* NAME */}
            <div className="col-span-3">
              <p className="text-sm font-medium text-slate-900 truncate">{asset.name}</p>
              <p className="text-xs text-slate-500 truncate">{asset.name}</p>
            </div>

            {/* TYPE */}
            <div className="col-span-2">
              <p className="text-sm text-slate-600">{asset.type || "Asset"}</p>
            </div>

            {/* FORMAT */}
            <div className="col-span-2">
              <p className="text-sm text-slate-600">{asset.format}</p>
            </div>

            {/* UPLOAD DATE */}
            <div className="col-span-2">
              <p className="text-sm text-slate-600">{asset.uploadDate}</p>
            </div>

            {/* ACTIONS */}
            <div className="col-span-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onDownloadAsset(asset.id)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors duration-200"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDeleteAsset(asset.id)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors duration-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // GRID VIEW - DYNAMIC SIZE
  return (
    <div
      className={`grid gap-6 pb-12 transition-all duration-300 ${isDetailModalOpen ? "opacity-50 pointer-events-none" : ""}`}
      style={gridStyle}
    >
      {assets.map((asset) => (
        <div key={asset.id} className="relative group will-change-contents">
          <div className="relative bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden group-hover:shadow-lg group-hover:border-slate-300 transition-all duration-300">
            <DAMAssetCard
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              onSelect={() => onSelectAsset(asset.id)}
              onPreview={onPreviewAsset}
              onDownload={onDownloadAsset}
              onDelete={onDeleteAsset}
              onAddToCollection={onAddToCollection}
              isDisabled={isDetailModalOpen}
            />

            {currentCollectionId && onRemoveFromCollection && (
              <div className="p-3 border-t border-slate-100/60 flex items-center justify-between gap-2 bg-slate-50/50">
                <span className="text-xs text-slate-600 font-medium">In collection</span>
                <button
                  onClick={() => onRemoveFromCollection(currentCollectionId, asset.id)}
                  className="px-3 py-1.5 text-xs bg-red-50/80 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-150 font-medium border border-red-200/50"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ===== Empty State ===== */
const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
    <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8 mb-6 border border-slate-200/50">
      <HardDrive className="h-16 w-16 text-slate-300 mx-auto" />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-slate-900">No assets found</h3>
    <p className="text-sm text-slate-500 max-w-xs text-center">
      Upload some assets to get started and manage your digital library
    </p>
  </div>
);

/* ===== LibraryContent ===== */
interface LibraryContentProps {
  selectedProduct: Product | null;
  viewingCollectionId: number | null;
  collections: Collection[];
  sortedAssets: DigitalAsset[];
  selectedAssets: Set<number>;
  isDetailModalOpen: boolean;
  viewMode: ViewMode;
  cardSize: number;
  onViewModeChange: (mode: ViewMode) => void;
  onCardSizeChange: (size: number) => void;
  onSelectAll: () => void;
  onSelectAsset: (id: number) => void;
  onClearSelection: () => void;
  onPreviewAsset: (asset: DigitalAsset) => void;
  onDownloadAsset: (id: number) => void;
  onDeleteAsset: (id: number) => void;
  onAddToCollection: (asset: DigitalAsset) => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onAddSelectedToCollection: () => void;
  currentCollectionId?: number | null;
  onRemoveFromCollection?: (collectionId: number, assetId: number) => void;
}

const LibraryContent: FC<LibraryContentProps> = ({
  selectedProduct,
  viewingCollectionId,
  collections,
  sortedAssets,
  selectedAssets,
  isDetailModalOpen,
  viewMode,
  cardSize,
  onViewModeChange,
  onCardSizeChange,
  onSelectAll,
  onSelectAsset,
  onClearSelection,
  onPreviewAsset,
  onDownloadAsset,
  onDeleteAsset,
  onAddToCollection,
  onBulkDownload,
  onBulkDelete,
  onAddSelectedToCollection,
  currentCollectionId,
  onRemoveFromCollection,
}) => {
  const currentCollection = collections.find((c) => c.id === viewingCollectionId);

  return (
    <section className="flex-1 px-8 py-8 overflow-auto bg-gradient-to-b from-white to-slate-50">
      {sortedAssets.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={`flex flex-col h-full ${isDetailModalOpen ? "pointer-events-none opacity-50" : ""}`}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">
                {viewingCollectionId ? currentCollection?.name : selectedProduct ? selectedProduct.name : "All Assets"}
              </h1>
              <span className="px-3 py-1 text-sm bg-blue-100/70 text-blue-700 rounded-full font-medium">
                {sortedAssets.length} items
              </span>
            </div>
          </div>

          {/* CONTROLS BAR - ALWAYS VISIBLE WITH SLIDER + PLUS/MINUS */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/50 flex-wrap gap-4">
            {/* LEFT: SELECT & ACTIONS */}
            <div className="flex items-center gap-6 flex-wrap">
              <button
                onClick={onSelectAll}
                className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                {selectedAssets.size === sortedAssets.length && sortedAssets.length > 0 ? (
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {selectedAssets.size > 0 && (
                <div className="flex items-center gap-3 pl-6 border-l border-slate-300 transition-all duration-200">
                  <button
                    onClick={onAddSelectedToCollection}
                    className="p-2.5 hover:bg-green-50 text-green-600 rounded-lg flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <FolderIcon className="h-4 w-4" />
                  </button>

                  <button
                    onClick={onBulkDownload}
                    className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-lg flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    onClick={onBulkDelete}
                    className="p-2.5 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-1.5 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={onClearSelection}
                    className="p-2.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: VIEW TOGGLE + SLIDER + PLUS/MINUS */}
            <div className="flex items-center gap-4">
              {/* VIEW TOGGLE */}
              <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg transition-all duration-300">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                      : "text-slate-600 hover:bg-white/50"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-xs font-medium hidden sm:inline">Grid</span>
                </button>

                <button
                  onClick={() => onViewModeChange("list")}
                  className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                      : "text-slate-600 hover:bg-white/50"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                  <span className="text-xs font-medium hidden sm:inline">List</span>
                </button>
              </div>

              {/* SLIDER BAR WITH PLUS/MINUS BUTTONS */}
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-100/80 rounded-lg transition-all duration-200">
                {/* MINUS BUTTON */}
                <button
                  onClick={() => onCardSizeChange(Math.max(1, cardSize - 1))}
                  disabled={cardSize <= 1}
                  className="p-1.5 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-600 transition-colors duration-200 flex-shrink-0"
                  title="Smaller"
                >
                  <Minus className="h-4 w-4" />
                </button>

                {/* SLIDER BAR */}
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cardSize}
                  onChange={(e) => onCardSizeChange(parseInt(e.target.value))}
                  className="w-40 h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((cardSize - 1) / 9) * 100}%, #cbd5e1 ${((cardSize - 1) / 9) * 100}%, #cbd5e1 100%)`,
                  }}
                />

                {/* PLUS BUTTON */}
                <button
                  onClick={() => onCardSizeChange(Math.min(10, cardSize + 1))}
                  disabled={cardSize >= 10}
                  className="p-1.5 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-600 transition-colors duration-200 flex-shrink-0"
                  title="Larger"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ASSETS GRID/LIST */}
          <AssetGrid
            assets={sortedAssets}
            selectedAssets={selectedAssets}
            viewMode={viewMode}
            cardSize={cardSize}
            onSelectAsset={onSelectAsset}
            onPreviewAsset={onPreviewAsset}
            onDownloadAsset={onDownloadAsset}
            onDeleteAsset={onDeleteAsset}
            onAddToCollection={onAddToCollection}
            currentCollectionId={viewingCollectionId}
            onRemoveFromCollection={onRemoveFromCollection}
            isDetailModalOpen={isDetailModalOpen}
          />
        </div>
      )}
    </section>
  );
};

/* ===== MAIN DAM PAGE ===== */
const DAMPage: FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0]);
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<DigitalAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [cardSize, setCardSize] = useState<number>(4);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    assetType: "all",
    dateRange: { startDate: "", endDate: "" },
    uploader: "",
  });
  const [productSearch, setProductSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("library");
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [viewingCollectionId, setViewingCollectionId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [assetsPendingAdd, setAssetsPendingAdd] = useState<number[]>([]);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState<boolean>(false);

  const allAssets = useMemo<DigitalAsset[]>(() => Object.values(digitalAssets).flat(), []);

  const assetsInCurrentCollection = useMemo<DigitalAsset[]>(() => {
    if (!viewingCollectionId) return [];
    const col = collections.find((c) => c.id === viewingCollectionId);
    if (!col || !col.children || col.children.length === 0) return [];
    return col.children.map((id) => allAssets.find((a) => a.id === id)).filter(Boolean) as DigitalAsset[];
  }, [viewingCollectionId, collections, allAssets]);

  const currentAssets = useMemo<DigitalAsset[]>(() => {
    if (viewingCollectionId) return assetsInCurrentCollection;
    if (selectedProduct) return digitalAssets[selectedProduct.id] || [];
    return allAssets;
  }, [viewingCollectionId, assetsInCurrentCollection, selectedProduct, allAssets]);

  const filteredAssets = useMemo<DigitalAsset[]>(() => {
    return currentAssets.filter((asset) => {
      const term = (searchFilters.searchTerm || "").toLowerCase();
      const matchesSearch = asset.name.toLowerCase().includes(term) || asset.format.toLowerCase().includes(term);
      const matchesType = searchFilters.assetType === "all" || asset.type === searchFilters.assetType;
      const assetDate = asset.uploadDate ? new Date(asset.uploadDate) : new Date(0);
      const matchesDateRange =
        (!searchFilters.dateRange.startDate || assetDate >= new Date(searchFilters.dateRange.startDate)) &&
        (!searchFilters.dateRange.endDate || assetDate <= new Date(searchFilters.dateRange.endDate));
      const matchesUploader = !searchFilters.uploader || asset.uploadedBy === searchFilters.uploader;
      return matchesSearch && matchesType && matchesDateRange && matchesUploader;
    });
  }, [currentAssets, searchFilters]);

  const sortedAssets = useMemo<DigitalAsset[]>(() => {
    return [...filteredAssets].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [filteredAssets]);

  const filteredProducts = useMemo<Product[]>(
    () => products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())),
    [productSearch]
  );

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    setSelectedAssets(new Set());
    setViewingCollectionId(null);
  };

  const handleSelectAll = () => {
    if (selectedAssets.size === sortedAssets.length) setSelectedAssets(new Set());
    else setSelectedAssets(new Set(sortedAssets.map((a) => a.id)));
  };

  const handleSelectAsset = (assetId: number) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      next.has(assetId) ? next.delete(assetId) : next.add(assetId);
      return next;
    });
  };

  const handleClearSelection = () => setSelectedAssets(new Set());

  const handleAssetPreview = (asset: DigitalAsset) => {
    setSelectedAssetDetail(asset);
    setIsDetailModalOpen(true);
  };

  const handleAssetDownload = (assetId: number) => {
    const asset = sortedAssets.find((a) => a.id === assetId) || allAssets.find((a) => a.id === assetId);
    if (asset) console.log("Downloading:", asset.name);
  };

  const handleAssetDelete = (assetId: number) => {
    if (!confirm("Delete this asset?")) return;
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      next.delete(assetId);
      return next;
    });
  };

  const handleBulkDownload = () => console.log("Downloading", selectedAssets.size, "assets");
  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedAssets.size} selected assets?`)) return;
    setSelectedAssets(new Set());
  };

  const handleCreateCollection = (name: string) => {
    const id = Math.max(0, ...collections.map((c) => c.id)) + 1;
    const newCollection: Collection = {
      id,
      name,
      assetCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      children: [],
    };
    setCollections((prev) => [...prev, newCollection]);
  };

  const handleDeleteCollection = (collectionId: number) => {
    if (!confirm("Delete collection?")) return;
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    if (viewingCollectionId === collectionId) setViewingCollectionId(null);
  };

  const handleRenameCollection = (collectionId: number, newName: string) => {
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, name: newName } : c)));
  };

  const handleViewCollectionAssets = (collection: Collection) => {
    setViewingCollectionId(collection.id);
    setActiveTab("library");
  };

  const handleAddAssetsToCollection = (collectionId: number) => {
    if (!assetsPendingAdd || assetsPendingAdd.length === 0) {
      setShowAddToCollectionModal(false);
      return;
    }

    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const existingSet = new Set<number>(
          (c.children || [])
            .map((id) => (typeof id === "number" ? id : Number(id)))
            .filter((id) => !Number.isNaN(id))
        );
        for (const raw of assetsPendingAdd) {
          const id = typeof raw === "number" ? raw : Number(raw);
          if (!Number.isNaN(id)) existingSet.add(id);
        }
        const newChildren = Array.from(existingSet);
        return { ...c, children: newChildren, assetCount: newChildren.length };
      })
    );

    setAssetsPendingAdd([]);
    setShowAddToCollectionModal(false);
  };

  const handleRemoveAssetFromCollection = (collectionId: number, assetId: number) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        const children = (c.children || []).filter((id) => id !== assetId);
        return { ...c, children, assetCount: children.length };
      })
    );
  };

  const handleUpdateCollectionChildren = (collectionId: number, newChildren: number[]) => {
    setCollections((prev) => prev.map((c) => (c.id === collectionId ? { ...c, children: newChildren, assetCount: newChildren.length } : c)));
  };

  const openAddToCollectionForAsset = (asset: DigitalAsset) => {
    setAssetsPendingAdd([asset.id]);
    setShowAddToCollectionModal(true);
  };

  const openAddSelectedToCollection = () => {
    if (selectedAssets.size === 0) return;
    setAssetsPendingAdd(Array.from(selectedAssets));
    setShowAddToCollectionModal(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
        return <DAMUpload />;
      case "collections":
        return (
          <DAMCollections
            collections={collections}
            assets={allAssets}
            onCreateCollection={handleCreateCollection}
            onDeleteCollection={handleDeleteCollection}
            onRenameCollection={handleRenameCollection}
            onUpdateCollectionChildren={handleUpdateCollectionChildren}
            onSelectCollection={handleViewCollectionAssets}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
      <DAMNavbar
        selectedProduct={selectedProduct}
        viewingCollectionId={viewingCollectionId}
        collections={collections}
      />

      <div className="flex flex-1 overflow-hidden">
        <DAMSidebar
          products={products}
          filteredProducts={filteredProducts}
          selectedProduct={selectedProduct}
          productSearch={productSearch}
          isCollapsed={isSidebarCollapsed}
          onProductSearch={setProductSearch}
          onProductSelect={handleProductSelect}
          onToggleCollapse={() => setIsSidebarCollapsed((s) => !s)}
          activeTab={activeTab}
          sortedAssets={sortedAssets}
          selectedAssets={selectedAssets}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== "library") setViewingCollectionId(null);
          }}
          onFilterOpen={() => setFiltersPanelOpen(true)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeTab === "library" ? (
            <>
              <LibraryContent
                selectedProduct={selectedProduct}
                viewingCollectionId={viewingCollectionId}
                collections={collections}
                sortedAssets={sortedAssets}
                selectedAssets={selectedAssets}
                isDetailModalOpen={isDetailModalOpen}
                viewMode={viewMode}
                cardSize={cardSize}
                onViewModeChange={setViewMode}
                onCardSizeChange={setCardSize}
                onSelectAll={handleSelectAll}
                onSelectAsset={handleSelectAsset}
                onClearSelection={handleClearSelection}
                onPreviewAsset={handleAssetPreview}
                onDownloadAsset={handleAssetDownload}
                onDeleteAsset={handleAssetDelete}
                onAddToCollection={openAddToCollectionForAsset}
                onBulkDownload={handleBulkDownload}
                onBulkDelete={handleBulkDelete}
                onAddSelectedToCollection={openAddSelectedToCollection}
                currentCollectionId={viewingCollectionId}
                onRemoveFromCollection={handleRemoveAssetFromCollection}
              />

              <DAMSearchFilters
                assets={currentAssets}
                onFilterChange={setSearchFilters}
                isOpen={filtersPanelOpen}
                onClose={() => setFiltersPanelOpen(false)}
              />
            </>
          ) : (
            <div className="flex-1 overflow-auto bg-gradient-to-b from-white to-slate-50">
              {renderTabContent()}
            </div>
          )}
        </main>
      </div>

      {showAddToCollectionModal && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-200/50 z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add to collection</h3>
              <button
                onClick={() => {
                  setShowAddToCollectionModal(false);
                  setAssetsPendingAdd([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Add {assetsPendingAdd.length} asset{assetsPendingAdd.length > 1 ? "s" : ""} to a collection:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto mb-6">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleAddAssetsToCollection(col.id)}
                    className="w-full text-left px-4 py-4 bg-white border border-slate-200/60 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <div className="font-semibold text-slate-900">{col.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{formatCount(col.assetCount)} items</div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-slate-500 col-span-2 py-8 text-center">
                  No collections yet.
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowAddToCollectionModal(false);
                setAssetsPendingAdd([]);
              }}
              className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedAssetDetail && (
        <DAMAssetDetail
          asset={selectedAssetDetail}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onDownload={handleAssetDownload}
          onDelete={handleAssetDelete}
        />
      )}
    </div>
  );
};

export default DAMPage;
