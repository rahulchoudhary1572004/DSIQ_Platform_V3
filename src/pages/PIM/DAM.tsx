// components/DAM/DAM.tsx - COMPLETE with Folder Search Popup
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
  Check,
} from "lucide-react";

import DAMSidebar from "./DAMSidebar";
import DAMAssetCard from "./DAMAssetCard";
import DAMSearchFilters from "./DAMSearchFilters";
import DAMAssetDetail from "./DAMAssetDetail";
import DAMUpload from "./DAMUpload";
import DAMBreadcrumb from "./DAMBreadcrumb";
import DAMSearchBar from "./DAMSearchBar";
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
  onAddToFolderClick?: (asset: DigitalAsset) => void;
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
  onAddToFolderClick,
}) => {
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize * 50}px, 1fr))`,
  };

  if (viewMode === "list") {
    return (
      <div
        className={`space-y-3 pb-12 transition-opacity duration-200 ${
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
            className="grid grid-cols-12 gap-4 px-6 py-5 bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl hover:bg-white/60 hover:shadow-xl transition-all duration-200 group items-center"
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
      className={`grid gap-6 pb-12 transition-opacity duration-200 ${
        isDetailModalOpen ? "opacity-50 pointer-events-none" : ""
      }`}
      style={gridStyle}
    >
      {assets.map((asset) => (
        <div key={asset.id} className="relative group">
          <div className="absolute inset-0 bg-gray-200/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg overflow-visible group-hover:shadow-2xl group-hover:border-white/40 transition-all duration-200">
            <DAMAssetCard
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              onSelect={() => onSelectAsset(asset.id)}
              onPreview={onPreviewAsset}
              onDownload={onDownloadAsset}
              onDelete={onDeleteAsset}
              onAddToCollection={onAddToCollection}
              isDisabled={isDetailModalOpen}
              onAddToFolderClick={onAddToFolderClick}
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
  onAddToFolderClick?: (asset: DigitalAsset) => void;
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
  onAddToFolderClick,
}) => {
  const [showTypeBreakdown, setShowTypeBreakdown] = useState(false);

  const displayTitle = viewingFolderId
    ? folderName
    : selectedProduct
      ? selectedProduct.name
      : "All Assets";

  const isFolderView = !!viewingFolderId;

  const typeBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    sortedAssets.forEach((asset) => {
      breakdown[asset.type] = (breakdown[asset.type] || 0) + 1;
    });
    return breakdown;
  }, [sortedAssets]);

  const totalSize = useMemo(() => {
    const totalBytes = sortedAssets.reduce((sum, asset) => sum + (asset.sizeInBytes || 0), 0);
    if (totalBytes === 0) return "0 KB";
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    if (totalBytes < 1024 * 1024 * 1024) return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }, [sortedAssets]);

  return (
    <section className="flex-1 px-8 py-8 overflow-auto bg-white flex flex-col">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
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
              
         {/* INFO ICON - TYPE BREAKDOWN TOOLTIP */}
{sortedAssets.length > 0 && (
  <div className="relative">
    <button
      onClick={() => setShowTypeBreakdown(!showTypeBreakdown)}
      className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 text-gray-500 hover:text-blue-600"
      title="View asset type breakdown"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    </button>
    
    {/* TOOLTIP - TYPE BREAKDOWN */}
    {showTypeBreakdown && (
      <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-max z-10 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Asset Type Distribution</p>
          <button
            onClick={() => setShowTypeBreakdown(false)}
            className="ml-3 p-1 hover:bg-gray-100 rounded transition-all text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {Object.entries(typeBreakdown).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="p-1 bg-gray-100 rounded">
                {getTypeIcon(type)}
              </div>
              <span className="text-xs font-medium text-gray-700 capitalize">{type}:</span>
              <span className="text-xs font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
</div>


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

           
          </div>
        </div>
      </div>

      {/* ALL 3 IN SAME ROW - SEPARATED, LOCKED POSITIONS WITH BOTTOM SPACE */}
      <div className="px-8 py-4 pb-6 border-b border-gray-100 bg-white flex-shrink-0 h-auto">
        <div className="flex items-center justify-between h-12 gap-4">
          
          {/* LEFT: BULK ACTIONS - Fixed Width */}
          <div style={{ width: "120px", minWidth: "120px", flexShrink: 0 }}>
            {selectedAssets.size > 0 ? (
              <div className="flex items-center gap-3 animate-fade-in">
                <button
                  onClick={onBulkDownload}
                  className="p-2 hover:bg-blue-100/60 text-blue-600 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={onBulkDelete}
                  className="p-2 hover:bg-red-100/60 text-red-600 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={onClearSelection}
                  className="p-2 hover:bg-slate-100/60 text-slate-500 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div />
            )}
          </div>

          {/* CENTER: SEARCH BAR - Fixed Width */}
          <div style={{ width: "520px", minWidth: "320px", flexShrink: 0 }}>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors duration-300 shadow-sm"
                style={{ height: "40px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* RIGHT: FILTER & VIEW CONTROLS - Fixed Width */}
          <div style={{ width: "240px", minWidth: "240px", flexShrink: 0 }} className="flex items-center justify-end gap-3">
            <button
              onClick={onFilterOpen}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap flex-shrink-0"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`px-2.5 py-1.5 rounded-md transition-all duration-200 flex-shrink-0 ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-gray-200"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`px-2.5 py-1.5 rounded-md transition-all duration-200 flex-shrink-0 ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-gray-200"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
            onAddToFolderClick={onAddToFolderClick}
          />
        )}
      </div>
    </section>
  );
};


const DAMPage: FC = () => {
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const [viewingFolderId, setViewingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string>("");
  const [folderAssets, setFolderAssets] = useState<DigitalAsset[]>([]);

  // Global folder popup state
  const [showFolderPopup, setShowFolderPopup] = useState(false);
  const [selectedAssetForFolder, setSelectedAssetForFolder] = useState<DigitalAsset | null>(null);
  const [assetFolderMap, setAssetFolderMap] = useState<Map<number, string[]>>(new Map());
  const [selectedFoldersForPopup, setSelectedFoldersForPopup] = useState<string[]>([]);
  const [folderSearchTerm, setFolderSearchTerm] = useState("");

  const allAssets = useMemo<DigitalAsset[]>(() => Object.values(digitalAssets).flat(), []);

  const allFolders = useMemo(() => {
    return ["Electronics", "Wireless", "Videos", "Images", "Documents", "Archive"];
  }, []);

  const filteredFolders = useMemo(() => {
    if (!folderSearchTerm) return allFolders;
    return allFolders.filter(folder =>
      folder.toLowerCase().includes(folderSearchTerm.toLowerCase())
    );
  }, [folderSearchTerm, allFolders]);

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

  const handleOpenFolderPopup = (asset: DigitalAsset) => {
    setSelectedAssetForFolder(asset);
    setSelectedFoldersForPopup(assetFolderMap.get(asset.id) || []);
    setShowFolderPopup(true);
  };

  const handleCloseFolderPopup = () => {
    setShowFolderPopup(false);
    setSelectedAssetForFolder(null);
    setFolderSearchTerm("");
  };

  const handleFolderSelect = (folderName: string) => {
    if (selectedAssetForFolder) {
      setSelectedFoldersForPopup((prev) => {
        if (prev.includes(folderName)) {
          return prev.filter(f => f !== folderName);
        } else {
          return [...prev, folderName];
        }
      });

      setAssetFolderMap((prev) => {
        const newMap = new Map(prev);
        const currentFolders = newMap.get(selectedAssetForFolder.id) || [];
        
        if (!currentFolders.includes(folderName)) {
          newMap.set(selectedAssetForFolder.id, [...currentFolders, folderName]);
        }
        
        console.log(`✓ Asset ${selectedAssetForFolder.id} added to folder: ${folderName}`);
        console.log("Asset-Folder Map:", Object.fromEntries(newMap));
        
        return newMap;
      });
    }
  };

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

  const handleFolderSelect2 = (folderId: string | null, assets: DigitalAsset[]) => {
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
          <LibraryContent
            selectedProduct={null}
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
            onAddToFolderClick={handleOpenFolderPopup}
          />
        );
      default:
        return null;
    }
  };

  const getFolderColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-amber-100 text-amber-600",
      "bg-green-100 text-green-600",
      "bg-cyan-100 text-cyan-600",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      <div className="relative z-50">
        <DAMBreadcrumb
          selectedProduct={selectedProduct}
          viewingFolderId={viewingFolderId}
          activeTab={activeTab}
          onNavigateHome={handleNavigateHome}
          onTabChange={setActiveTab}
        />
      </div>

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
          onFolderSelect={handleFolderSelect2}
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
                onAddToFolderClick={handleOpenFolderPopup}
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
              {activeTab === "folders" && (
                <DAMSearchFilters
                  assets={currentAssets}
                  onFilterChange={setSearchFilters}
                  isOpen={filtersPanelOpen}
                  onClose={() => setFiltersPanelOpen(false)}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* GLOBAL FOLDER POPUP - In Main Window with Search */}
      {showFolderPopup && selectedAssetForFolder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={handleCloseFolderPopup}
          style={{
            animation: "backdropFadeIn 0.3s ease-out forwards",
          }}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "popupSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Add to Folders</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedAssetForFolder.name}</p>
              </div>
              <button
                onClick={handleCloseFolderPopup}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                <input
                  type="text"
                  value={folderSearchTerm}
                  onChange={(e) => setFolderSearchTerm(e.target.value)}
                  placeholder="Search folders..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                  autoFocus
                />
              </div>
            </div>

            {/* Folder Grid */}
            <div className="p-8">
              {filteredFolders.length === 0 ? (
                <div className="text-center py-12">
                  <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No folders found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFolders.map((folder, index) => {
                    const isFolderSelected = selectedFoldersForPopup.includes(folder);
                    const colorClass = getFolderColor(index);

                    return (
                      <button
                        key={index}
                        onClick={() => handleFolderSelect(folder)}
                        className="group relative"
                        style={{
                          animation: `folderItemFadeIn 0.4s ease-out ${index * 0.08}s both`,
                        }}
                      >
                        <div
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer ${
                            isFolderSelected
                              ? "border-green-400 bg-green-50/50 shadow-lg scale-105"
                              : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:shadow-md hover:scale-102"
                          }`}
                        >
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${colorClass} group-hover:scale-110`}
                          >
                            <FolderIcon className="h-7 w-7" />
                          </div>

                          <p className="font-semibold text-gray-900 text-sm">{folder}</p>

                          {isFolderSelected && (
                            <div
                              className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                              style={{
                                animation: "checkmarkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                              }}
                            >
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button
                onClick={handleCloseFolderPopup}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-xl font-medium text-sm transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseFolderPopup}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-md"
              >
                Done
              </button>
            </div>
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

      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popupSlideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes folderItemFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes checkmarkPop {
          from {
            opacity: 0;
            transform: scale(0) rotate(-45deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default DAMPage;
