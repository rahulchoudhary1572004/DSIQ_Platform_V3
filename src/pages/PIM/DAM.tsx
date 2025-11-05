import { useState, useMemo, FC, ChangeEvent } from "react";
import {
  HardDrive,
  Upload,
  Search,
  X,
  Download,
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from "lucide-react";
import FloatingAddButton from "../../../helper_Functions/FloatingAddButton";
import DAMAssetCard from "./DAMAssetCard";
import DAMSearchFilters from "./DAMSearchFilters";
import DAMAssetDetail from "./DAMAssetDetail";
import DAMUpload from "./DAMUpload";
import DAMCollections from "./DAMCollections";
import { DigitalAsset, Product, SearchFilters, Collection } from "../../types/dam.types";
import { products, digitalAssets, mockCollections } from "./dam.data";

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "size" | "type";
type ActiveTab = "library" | "upload" | "collections";

const TAB_CONFIG: Record<ActiveTab, { label: string; icon?: string }> = {
  library: { label: "Asset Library" },
  upload: { label: "Upload Assets" },
  collections: { label: "Collections" },
};

const getStatusStyle = (status: string): string => {
  const statusMap: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Draft: "bg-amber-100 text-amber-700 border border-amber-200",
    Archived: "bg-slate-100 text-slate-700 border border-slate-200",
  };
  return statusMap[status] || "bg-slate-100 text-slate-700 border border-slate-200";
};

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================
interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: (product: Product | null) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, isSelected, onClick }) => (
  <button
    onClick={() => onClick(product)}
    className={`w-full text-left px-3 py-2.5 rounded-lg flex flex-col transition-colors ${
      isSelected
        ? "bg-blue-600 text-white"
        : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-900"
    }`}
  >
    <span className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
      {product.name}
    </span>
    <span className={`text-xs mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
      {product.sku}
    </span>
  </button>
);

// ============================================================================
// COLLAPSIBLE SIDEBAR COMPONENT
// ============================================================================
interface SidebarProps {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  productSearch: string;
  isCollapsed: boolean;
  onProductSearch: (search: string) => void;
  onProductSelect: (product: Product | null) => void;
  onToggleCollapse: () => void;
}

const Sidebar: FC<SidebarProps> = ({
  products,
  filteredProducts,
  selectedProduct,
  productSearch,
  isCollapsed,
  onProductSearch,
  onProductSelect,
  onToggleCollapse,
}) => {
  if (isCollapsed) {
    return (
      <aside className="w-16 bg-white shadow-sm flex flex-col items-center py-4 gap-4 transition-all duration-300 border-r border-slate-200">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white shadow-sm flex flex-col overflow-hidden transition-all duration-300 border-r border-slate-200">
      <div className="px-5 py-4 flex-shrink-0 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Products</h2>
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onProductSearch(e.target.value)}
            className="pl-10 w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1 min-h-0">
        <button
          onClick={() => onProductSelect(null)}
          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
            selectedProduct === null
              ? "bg-blue-600 text-white"
              : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-900"
          }`}
        >
          <div className="font-semibold text-sm">All Assets</div>
          <div className="text-xs mt-1 opacity-70">Show all</div>
        </button>

        <div className="h-0.5 bg-slate-200 my-1"></div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No products found</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard
                product={product}
                isSelected={selectedProduct?.id === product.id}
                onClick={onProductSelect}
              />
              {selectedProduct?.id === product.id && (
                <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r-full"></div>
              )}
            </div>
          ))
        )}
      </nav>

      <div className="px-5 py-4 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="text-xs text-slate-600">
          <span className="font-semibold">{filteredProducts.length}</span> of{" "}
          <span className="font-semibold">{products.length}</span> products
        </div>
      </div>
    </aside>
  );
};

// ============================================================================
// TAB NAVIGATION COMPONENT
// ============================================================================
interface TabNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TabNav: FC<TabNavProps> = ({ activeTab, onTabChange }) => (
  <div className="bg-white border-b border-slate-200 px-8 flex-shrink-0">
    <div className="flex items-center gap-1">
      {Object.entries(TAB_CONFIG).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => onTabChange(key as ActiveTab)}
          className={`px-5 py-3.5 font-semibold text-sm transition-all rounded-t-lg ${
            activeTab === key
              ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-b-2 border-transparent"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

// ============================================================================
// ASSET GRID COMPONENT
// ============================================================================
interface AssetGridProps {
  assets: DigitalAsset[];
  selectedAssets: Set<number>;
  onSelectAsset: (assetId: number) => void;
  onPreviewAsset: (asset: DigitalAsset) => void;
  onDownloadAsset: (assetId: number) => void;
  onDeleteAsset: (assetId: number) => void;
  isDetailModalOpen?: boolean;
}

const AssetGrid: FC<AssetGridProps> = ({
  assets,
  selectedAssets,
  onSelectAsset,
  onPreviewAsset,
  onDownloadAsset,
  onDeleteAsset,
  isDetailModalOpen = false,
}) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-8 ${isDetailModalOpen ? "opacity-50" : ""}`}>
    {assets.map((asset) => (
      <div key={asset.id} className={`relative group ${isDetailModalOpen ? "pointer-events-none" : ""}`}>
        
        <DAMAssetCard
          asset={asset}
          isSelected={selectedAssets.has(asset.id)}
          onSelect={() => onSelectAsset(asset.id)}
          onPreview={onPreviewAsset}
          onDownload={onDownloadAsset}
          onDelete={onDeleteAsset}
          isDisabled={isDetailModalOpen}
        />
      </div>
    ))}
  </div>
);

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================
const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
    <div className="bg-slate-100 rounded-full p-6 mb-4">
      <HardDrive className="h-16 w-16 text-slate-300" />
    </div>
    <h3 className="text-lg font-semibold mb-2 text-slate-900">No assets found</h3>
    <p className="text-sm text-slate-500">Upload some assets to get started</p>
  </div>
);

// ============================================================================
// LIBRARY HEADER COMPONENT
// ============================================================================
interface LibraryHeaderProps {
  selectedProduct: Product | null;
  viewingCollectionId: number | null;
  collections: Collection[];
  sortedAssets: DigitalAsset[];
  onFilterChange: (filters: SearchFilters) => void;
}

const LibraryHeader: FC<LibraryHeaderProps> = ({
  selectedProduct,
  viewingCollectionId,
  collections,
  sortedAssets,
  onFilterChange,
}) => {
  const currentCollection = collections.find((c) => c.id === viewingCollectionId);

  return (
    <header className="sticky top-0  bg-white border-b border-slate-200 px-8 py-6 shadow-sm flex-shrink-0 flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {viewingCollectionId ? currentCollection?.name : selectedProduct ? "Digital Asset Management" : "All Assets"}
        </h1>
        <p className="text-slate-600 text-sm">
          {viewingCollectionId ? (
            <>
              Collection •{" "}
              <span className="font-semibold text-slate-900">{currentCollection?.assetCount} items</span>
            </>
          ) : selectedProduct ? (
            <>
              Managing assets for{" "}
              <span className="font-semibold text-slate-900">{selectedProduct.name}</span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-500">{selectedProduct.sku}</span>
            </>
          ) : (
            <>Viewing <span className="font-semibold text-slate-900">all assets</span></>
          )}
        </p>
      </div>
    </header>
  );
};

// ============================================================================
// LIBRARY TAB CONTENT COMPONENT
// ============================================================================
interface LibraryTabProps {
  selectedProduct: Product | null;
  viewingCollectionId: number | null;
  collections: Collection[];
  sortedAssets: DigitalAsset[];
  selectedAssets: Set<number>;
  isDetailModalOpen?: boolean;
  onFilterChange: (filters: SearchFilters) => void;
  onSelectAll: () => void;
  onSelectAsset: (assetId: number) => void;
  onPreviewAsset: (asset: DigitalAsset) => void;
  onDownloadAsset: (assetId: number) => void;
  onDeleteAsset: (assetId: number) => void;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const LibraryTab: FC<LibraryTabProps> = ({
  selectedProduct,
  viewingCollectionId,
  collections,
  sortedAssets,
  selectedAssets,
  onFilterChange,
  onSelectAll,
  onSelectAsset,
  onPreviewAsset,
  onDownloadAsset,
  onDeleteAsset,
  onBulkDownload,
  onBulkDelete,
  onClearSelection,
  isDetailModalOpen = false,
}) => {
  const isAllSelected = selectedAssets.size === sortedAssets.length && sortedAssets.length > 0;
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);

  return (
    <>
      <LibraryHeader
        selectedProduct={selectedProduct}
        viewingCollectionId={viewingCollectionId}
        collections={collections}
        sortedAssets={sortedAssets}
        onFilterChange={onFilterChange}
      />

      <section className="flex-1 px-8 py-6 overflow-auto bg-slate-50">
        {sortedAssets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={`flex flex-col h-full ${isDetailModalOpen ? "pointer-events-none opacity-50" : ""}`}>
            {/* TOOLBAR WITH FILTER BUTTON */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={onSelectAll}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                  title={isAllSelected ? "Deselect all" : "Select all"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{sortedAssets.length}</span>
                  <span className="text-sm text-slate-500">assets found</span>
                </div>

                {selectedAssets.size > 0 && (
                  <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-300">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {selectedAssets.size} selected
                    </span>
                    <button
                      onClick={onBulkDownload}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all flex items-center gap-1.5"
                      title="Download selected"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm font-medium hidden sm:inline">Download</span>
                    </button>
                    <button
                      onClick={onBulkDelete}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all flex items-center gap-1.5"
                      title="Delete selected"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm font-medium hidden sm:inline">Delete</span>
                    </button>
                    <button
                      onClick={onClearSelection}
                      className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-all"
                      title="Clear selection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* FILTERS BUTTON - RIGHT SIDE */}
              <button
                onClick={() => setFiltersPanelOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Sliders className="h-4 w-4" />
                Filters
              </button>
            </div>

            <AssetGrid
              assets={sortedAssets}
              selectedAssets={selectedAssets}
              onSelectAsset={onSelectAsset}
              onPreviewAsset={onPreviewAsset}
              onDownloadAsset={onDownloadAsset}
              onDeleteAsset={onDeleteAsset}
              isDetailModalOpen={isDetailModalOpen}
            />
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR FILTERS */}
      <DAMSearchFilters
        assets={sortedAssets}
        onFilterChange={onFilterChange}
        isOpen={filtersPanelOpen}
        onClose={() => setFiltersPanelOpen(false)}
      />
    </>
  );
};

// ============================================================================
// MAIN DAM PAGE COMPONENT
// ============================================================================
const DAMPage: FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0]);
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<DigitalAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
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

  const currentAssets = selectedProduct
    ? digitalAssets[selectedProduct.id] || []
    : Object.values(digitalAssets).flat();

  const filteredAssets = useMemo<DigitalAsset[]>(() => {
    return currentAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
        asset.format.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());
      const matchesType = searchFilters.assetType === "all" || asset.type === searchFilters.assetType;
      const assetDate = new Date(asset.uploadDate);
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

  const filteredProducts = useMemo<Product[]>(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    setSelectedAssets(new Set());
    setViewingCollectionId(null);
  };

  const handleSelectAll = () => {
    if (selectedAssets.size === sortedAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(sortedAssets.map((a) => a.id)));
    }
  };

  const handleSelectAsset = (assetId: number) => {
    const newSelected = new Set(selectedAssets);
    newSelected.has(assetId) ? newSelected.delete(assetId) : newSelected.add(assetId);
    setSelectedAssets(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedAssets(new Set());
  };

  const handleAssetPreview = (asset: DigitalAsset) => {
    setSelectedAssetDetail(asset);
    setIsDetailModalOpen(true);
  };

  const handleAssetDownload = (assetId: number) => {
    const asset = sortedAssets.find((a) => a.id === assetId);
    if (asset) console.log("Downloading:", asset.name);
  };

  const handleAssetDelete = (assetId: number) => {
    if (confirm("Delete this asset?")) {
      setSelectedAssets((prev) => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
    }
  };

  const handleBulkDownload = () => console.log("Downloading", selectedAssets.size, "assets");
  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedAssets.size} selected assets?`)) {
      setSelectedAssets(new Set());
    }
  };

  const handleCreateCollection = (name: string) => {
    const newCollection: Collection = {
      id: Math.max(...collections.map((c) => c.id), 0) + 1,
      name,
      assetCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
      children: [],
    };
    setCollections((prev) => [...prev, newCollection]);
  };

  const handleDeleteCollection = (collectionId: number) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
  };

  const handleRenameCollection = (collectionId: number, newName: string) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === collectionId ? { ...c, name: newName } : c))
    );
  };

  const handleViewCollectionAssets = (collection: Collection) => {
    setViewingCollectionId(collection.id);
    setActiveTab("library");
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab !== "library") {
      setViewingCollectionId(null);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "library":
        return (
          <LibraryTab
            selectedProduct={selectedProduct}
            viewingCollectionId={viewingCollectionId}
            collections={collections}
            sortedAssets={sortedAssets}
            selectedAssets={selectedAssets}
            isDetailModalOpen={isDetailModalOpen}
            onFilterChange={setSearchFilters}
            onSelectAll={handleSelectAll}
            onSelectAsset={handleSelectAsset}
            onPreviewAsset={handleAssetPreview}
            onDownloadAsset={handleAssetDownload}
            onDeleteAsset={handleAssetDelete}
            onBulkDownload={handleBulkDownload}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        );
      case "upload":
        return <DAMUpload />;
      case "collections":
        return (
          <DAMCollections
            collections={collections}
            onCreateCollection={handleCreateCollection}
            onDeleteCollection={handleDeleteCollection}
            onRenameCollection={handleRenameCollection}
            onSelectCollection={handleViewCollectionAssets}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          products={products}
          filteredProducts={filteredProducts}
          selectedProduct={selectedProduct}
          productSearch={productSearch}
          isCollapsed={isSidebarCollapsed}
          onProductSearch={setProductSearch}
          onProductSelect={handleProductSelect}
          onToggleCollapse={handleToggleSidebar}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
          {renderTabContent()}
        </main>
      </div>

      {/* <FloatingAddButton
        onClick={() => setActiveTab("upload")}
        label="Upload Assets"
        icon={Upload}
      /> */}

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
