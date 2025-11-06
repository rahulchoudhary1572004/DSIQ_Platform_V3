// components/DAM/DAM.tsx - Complete Enhanced Version
import React, { useState, useMemo, FC } from "react";
import {
  HardDrive,
  X,
  Download,
  Trash2,
  Folder as FolderIcon,
  List,
  LayoutGrid,
  Filter,
  Search,
  FileText,
  Image,
  Video,
  Archive,
} from "lucide-react";

import DAMSidebar from "./DAMSidebar";
import DAMAssetCard from "./DAMAssetCard";
import DAMSearchFilters from "./DAMSearchFilters";
import DAMAssetDetail from "./DAMAssetDetail";
import DAMUpload from "./DAMUpload";
import DAMBreadcrumb from "./DAMBreadcrumb";

import { DigitalAsset, Product, SearchFilters } from "../../types/dam.types";
import { products, digitalAssets } from "./dam.data";

type ActiveTab = "library" | "upload" | "folders";
type ViewMode = "grid" | "list";

const formatCount = (n?: number | null) => (typeof n === "number" ? n : 0);

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
  isDetailModalOpen = false,
}) => {
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize * 50}px, 1fr))`,
  };

  if (viewMode === "list") {
    return (
      <div
        className={`space-y-3 pb-12 transition-all duration-300 ${
          isDetailModalOpen ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl sticky top-0 text-sm font-semibold text-slate-900 mb-2 shadow-lg">
          <div className="col-span-1">Select</div>
          <div className="col-span-1">Thumbnail</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Format</div>
          <div className="col-span-2">Upload Date</div>
          <div className="col-span-1">Action</div>
        </div>

        {assets.map((asset) => (
          <div
            key={asset.id}
            className="grid grid-cols-12 gap-4 px-6 py-5 bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/60 hover:shadow-xl transition-all duration-300 group items-center"
          >
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedAssets.has(asset.id)}
                onChange={() => onSelectAsset(asset.id)}
                className="w-5 h-5 rounded cursor-pointer accent-blue-500"
              />
            </div>

            <div className="col-span-1 flex items-center">
              <div className="w-14 h-14 rounded-xl bg-gray-200 flex-shrink-0" />
            </div>

            <div className="col-span-3">
              <p className="text-sm font-semibold text-slate-900 truncate">{asset.name}</p>
              <p className="text-xs text-slate-500 truncate">{asset.size}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-slate-600 capitalize">{asset.type || "Asset"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-slate-600">{asset.format}</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-slate-600">{asset.uploadDate}</p>
            </div>

            <div className="col-span-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onDownloadAsset(asset.id)}
                className="p-2 hover:bg-blue-100/60 rounded-lg text-slate-500 hover:text-blue-600 transition-all duration-200"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDeleteAsset(asset.id)}
                className="p-2 hover:bg-red-100/60 rounded-lg text-slate-500 hover:text-red-600 transition-all duration-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 pb-12 transition-all duration-300 ${
        isDetailModalOpen ? "opacity-50 pointer-events-none" : ""
      }`}
      style={gridStyle}
    >
      {assets.map((asset) => (
        <div key={asset.id} className="relative group will-change-contents">
          <div className="absolute inset-0 bg-gray-200/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-hidden group-hover:shadow-2xl group-hover:border-white/40 transition-all duration-300">
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
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
    <div className="bg-white/40 rounded-3xl p-12 mb-6 border border-white/20 backdrop-blur-sm">
      <HardDrive className="h-20 w-20 text-slate-300 mx-auto" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-slate-900">No assets found</h3>
    <p className="text-sm text-slate-500 max-w-xs text-center">
      Try adjusting your search or filters to find what you're looking for
    </p>
  </div>
);

interface LibraryContentProps {
  selectedProduct: Product | null;
  viewingFolderId: string | null;
  folderName: string;
  sortedAssets: DigitalAsset[];
  selectedAssets: Set<number>;
  isDetailModalOpen: boolean;
  viewMode: ViewMode;
  cardSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onCardSizeChange: (size: number) => void;
  onFilterOpen: () => void;
  onSelectAll: () => void;
  onSelectAsset: (id: number) => void;
  onClearSelection: () => void;
  onPreviewAsset: (asset: DigitalAsset) => void;
  onDownloadAsset: (id: number) => void;
  onDeleteAsset: (id: number) => void;
  onAddToCollection: (asset: DigitalAsset) => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "image":
      return <Image className="h-4 w-4" />;
    case "video":
      return <Video className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    case "archive":
      return <Archive className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const LibraryContent: FC<LibraryContentProps> = ({
  selectedProduct,
  viewingFolderId,
  folderName,
  sortedAssets,
  selectedAssets,
  isDetailModalOpen,
  viewMode,
  cardSize,
  searchTerm,
  onSearchChange,
  onViewModeChange,
  onCardSizeChange,
  onFilterOpen,
  onSelectAll,
  onSelectAsset,
  onClearSelection,
  onPreviewAsset,
  onDownloadAsset,
  onDeleteAsset,
  onAddToCollection,
  onBulkDownload,
  onBulkDelete,
}) => {
  // Display title logic
  const displayTitle = viewingFolderId
    ? folderName
    : selectedProduct
      ? selectedProduct.name
      : "All Assets";

  // Check if viewing folder or product
  const isFolderView = !!viewingFolderId;

  // Calculate asset type breakdown
  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    sortedAssets.forEach((asset) => {
      breakdown[asset.type] = (breakdown[asset.type] || 0) + 1;
    });
    return breakdown;
  }, [sortedAssets]);

  // Calculate total file size
  const totalSize = useMemo(() => {
    const totalBytes = sortedAssets.reduce((sum, asset) => sum + (asset.sizeInBytes || 0), 0);
    if (totalBytes === 0) return "0 KB";
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    if (totalBytes < 1024 * 1024 * 1024) return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, [sortedAssets]);

  return (
    <section className="flex-1 px-8 py-8 overflow-auto bg-white flex flex-col">
      {/* ENHANCED: Header with metadata */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Title with Badge */}
            <div className="flex items-center gap-3 mb-3">
              {isFolderView && (
                <div className="px-3 py-1 bg-amber-100/60 border border-amber-200 rounded-full">
                  <span className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                    <FolderIcon className="h-3 w-3" />
                    Folder
                  </span>
                </div>
              )}
              {selectedProduct && !isFolderView && (
                <div className="px-3 py-1 bg-blue-100/60 border border-blue-200 rounded-full">
                  <span className="text-xs font-semibold text-blue-900">Product</span>
                </div>
              )}
              <h1 className="text-3xl font-light text-gray-900">{displayTitle}</h1>
            </div>

            {/* Product Info */}
            {selectedProduct && !isFolderView && (
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3 flex-wrap">
                <div>
                  <span className="text-gray-500">SKU: </span>
                  <span className="font-mono font-semibold text-gray-900">
                    {selectedProduct.sku}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Category: </span>
                  <span className="font-semibold text-gray-900">
                    {selectedProduct.category}
                  </span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedProduct.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {selectedProduct.status}
                </div>
              </div>
            )}

            {/* Asset Stats */}
            <div className="flex gap-4 text-sm">
              <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200/50">
                <span className="text-gray-600">Total Assets: </span>
                <span className="font-semibold text-blue-900">{sortedAssets.length}</span>
              </div>
              <div className="px-3 py-2 bg-purple-50 rounded-lg border border-purple-200/50">
                <span className="text-gray-600">Total Size: </span>
                <span className="font-semibold text-purple-900">{totalSize}</span>
              </div>
            </div>
          </div>

          {/* Count Badge */}
          <span className="px-4 py-2 text-sm bg-gray-200/60 text-slate-900 rounded-full font-semibold border border-gray-300/50 backdrop-blur-sm ml-4">
            {sortedAssets.length} items
          </span>
        </div>

        {/* Asset Type Breakdown */}
        {sortedAssets.length > 0 && (
          <div className="flex gap-3 text-xs text-gray-600 mt-4 flex-wrap">
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <div
                key={type}
                className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-1.5"
              >
                {getTypeIcon(type)}
                <span className="font-medium capitalize">{type}:</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/30 flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          {selectedAssets.size > 0 && (
            <div className="flex items-center gap-3 transition-all duration-200 animate-fade-in">
              <button
                onClick={onBulkDownload}
                className="p-3 hover:bg-blue-100/60 text-blue-600 rounded-lg flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                onClick={onBulkDelete}
                className="p-3 hover:bg-red-100/60 text-red-600 rounded-lg flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={onClearSelection}
                className="p-3 hover:bg-slate-100/60 text-slate-500 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search assets by name, format..."
              className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl text-sm focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30 transition-all duration-200 shadow-sm hover:bg-white/80"
            />
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={onFilterOpen}
            className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-slate-700 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/40 hover:scale-105"
            title="Open Filters"
          >
            <Filter className="h-4 w-4" />
            <span className="text-xs font-semibold">Filter</span>
          </button>

          <div className="flex items-center gap-1 bg-white/60 p-1 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/40">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white shadow-lg border border-white/20"
                  : "text-slate-600 hover:bg-white/50"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs font-semibold hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`px-3 py-2 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-lg border border-white/20"
                  : "text-slate-600 hover:bg-white/50"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
              <span className="text-xs font-semibold hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Asset Grid/List */}
      <div className={`flex-1 overflow-auto ${isDetailModalOpen ? "pointer-events-none opacity-50" : ""}`}>
        {sortedAssets.length === 0 ? (
          <EmptyState />
        ) : (
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
            isDetailModalOpen={isDetailModalOpen}
          />
        )}
      </div>
    </section>
  );
};

const DAMPage: FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0]);
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<DigitalAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [cardSize, setCardSize] = useState<number>(4);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    assetType: "all",
    dateRange: { startDate: "", endDate: "" },
    uploader: "",
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>("library");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState<boolean>(false);

  // Folder state
  const [viewingFolderId, setViewingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string>("");
  const [folderAssets, setFolderAssets] = useState<DigitalAsset[]>([]);

  const allAssets = useMemo<DigitalAsset[]>(() => Object.values(digitalAssets).flat(), []);

  const currentAssets = useMemo<DigitalAsset[]>(() => {
    if (viewingFolderId) return folderAssets;
    if (selectedProduct) return digitalAssets[selectedProduct.id] || [];
    return allAssets;
  }, [viewingFolderId, folderAssets, selectedProduct, allAssets]);

  const filteredAssets = useMemo<DigitalAsset[]>(() => {
    return currentAssets.filter((asset) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        asset.name.toLowerCase().includes(term) || asset.format.toLowerCase().includes(term);
      const filterTerm = (searchFilters.searchTerm || "").toLowerCase();
      const matchesFilterSearch =
        asset.name.toLowerCase().includes(filterTerm) ||
        asset.format.toLowerCase().includes(filterTerm);
      const matchesType = searchFilters.assetType === "all" || asset.type === searchFilters.assetType;
      const assetDate = asset.uploadDate ? new Date(asset.uploadDate) : new Date(0);
      const matchesDateRange =
        (!searchFilters.dateRange.startDate || assetDate >= new Date(searchFilters.dateRange.startDate)) &&
        (!searchFilters.dateRange.endDate || assetDate <= new Date(searchFilters.dateRange.endDate));
      const matchesUploader = !searchFilters.uploader || asset.uploadedBy === searchFilters.uploader;
      return matchesSearch && matchesFilterSearch && matchesType && matchesDateRange && matchesUploader;
    });
  }, [currentAssets, searchTerm, searchFilters]);

  const sortedAssets = useMemo<DigitalAsset[]>(() => {
    return [...filteredAssets].sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }, [filteredAssets]);

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    setSelectedAssets(new Set());
    setViewingFolderId(null);
    setFolderName("");
  };

  const handleNavigateHome = () => {
    setSelectedProduct(null);
    setViewingFolderId(null);
    setFolderName("");
    setSelectedAssets(new Set());
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
    const asset =
      sortedAssets.find((a) => a.id === assetId) || allAssets.find((a) => a.id === assetId);
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

  const openAddToCollectionForAsset = (asset: DigitalAsset) => {
    console.log("Add to collection:", asset.name);
  };

  const handleFolderSelect = (folderId: string | null, assets: DigitalAsset[]) => {
    if (folderId) {
      setViewingFolderId(folderId);
      setFolderName(folderId);
      setFolderAssets(assets);
    } else {
      setViewingFolderId(null);
      setFolderName("");
      setFolderAssets([]);
    }
    setSelectedProduct(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
        return <DAMUpload />;
      case "folders":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Select a folder from the sidebar to view assets</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <DAMBreadcrumb
        selectedProduct={selectedProduct}
        viewingFolderId={viewingFolderId}
        activeTab={activeTab}
        onNavigateHome={handleNavigateHome}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-1 overflow-hidden">
        <DAMSidebar
          isCollapsed={isSidebarCollapsed}
          activeTab={activeTab}
          sortedAssets={sortedAssets}
          selectedAssets={selectedAssets}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== "library" && tab !== "folders") {
              setViewingFolderId(null);
            }
          }}
          onToggleCollapse={() => setIsSidebarCollapsed((s) => !s)}
          onFolderSelect={handleFolderSelect}
          onFilterOpen={() => setFiltersPanelOpen(true)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {activeTab === "library" ? (
            <>
              <LibraryContent
                selectedProduct={selectedProduct}
                viewingFolderId={viewingFolderId}
                folderName={folderName}
                sortedAssets={sortedAssets}
                selectedAssets={selectedAssets}
                isDetailModalOpen={isDetailModalOpen}
                viewMode={viewMode}
                cardSize={cardSize}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onViewModeChange={setViewMode}
                onCardSizeChange={setCardSize}
                onFilterOpen={() => setFiltersPanelOpen(true)}
                onSelectAll={handleSelectAll}
                onSelectAsset={handleSelectAsset}
                onClearSelection={handleClearSelection}
                onPreviewAsset={handleAssetPreview}
                onDownloadAsset={handleAssetDownload}
                onDeleteAsset={handleAssetDelete}
                onAddToCollection={openAddToCollectionForAsset}
                onBulkDownload={handleBulkDownload}
                onBulkDelete={handleBulkDelete}
              />

              <DAMSearchFilters
                assets={currentAssets}
                onFilterChange={setSearchFilters}
                isOpen={filtersPanelOpen}
                onClose={() => setFiltersPanelOpen(false)}
              />
            </>
          ) : (
            <div className="flex-1 overflow-auto bg-white animate-fade-in">
              {renderTabContent()}
            </div>
          )}
        </main>
      </div>

      {isDetailModalOpen && selectedAssetDetail && (
        <DAMAssetDetail
          asset={selectedAssetDetail}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onDownload={handleAssetDownload}
          onDelete={handleAssetDelete}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default DAMPage;
