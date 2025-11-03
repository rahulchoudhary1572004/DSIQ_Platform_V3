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

// Tab Configuration
const TAB_CONFIG: Record<ActiveTab, { label: string; icon?: string }> = {
  library: { label: "Asset Library" },
  upload: { label: "Upload Assets" },
  collections: { label: "Collections" },
};

// Status Badge Styles
const getStatusStyle = (status: string): string => {
  const statusMap: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Draft: "bg-yellow-100 text-yellow-700",
    Archived: "bg-gray-100 text-gray-700",
  };
  return statusMap[status] || "bg-gray-100 text-gray-700";
};

// Product Card Component (Reusable)
interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: (product: Product) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, isSelected, onClick }) => (
  <button
    onClick={() => onClick(product)}
    className={`w-full text-left px-4 py-3 rounded-lg flex flex-col border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      isSelected
        ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow"
        : "bg-white border-transparent hover:bg-neutral-50"
    }`}
  >
    <span className="font-medium text-neutral-900 truncate">{product.name}</span>
    <span className="text-xs text-neutral-500">{product.sku}</span>
    <div className="flex items-center justify-between mt-1">
      <span className={`text-xs px-2 py-1 rounded ${getStatusStyle(product.status)}`}>
        {product.status}
      </span>
      <span className="text-xs text-neutral-400">{product.assetCount} assets</span>
    </div>
  </button>
);

// Tab Navigation Component (Reusable)
interface TabNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const TabNav: FC<TabNavProps> = ({ activeTab, onTabChange }) => (
  <div className="bg-white border-b border-neutral-200 px-8">
    <div className="flex items-center gap-6">
      {Object.entries(TAB_CONFIG).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => onTabChange(key as ActiveTab)}
          className={`px-4 py-4 font-medium text-sm border-b-2 transition-colors ${
            activeTab === key
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

// Toolbar Component (Reusable) - WITHOUT Sort & Filter
interface ToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onBulkDownload: () => void;
  onBulkDelete: () => void;
}

const Toolbar: FC<ToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  isAllSelected,
  onBulkDownload,
  onBulkDelete,
}) => (
  <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
    <div className="flex items-center gap-3">
      <button
        onClick={onSelectAll}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title={isAllSelected ? "Deselect all" : "Select all"}
      >
        {isAllSelected ? (
          <CheckSquare className="h-5 w-5 text-blue-600" />
        ) : (
          <Square className="h-5 w-5 text-gray-400" />
        )}
      </button>

      <span className="text-sm font-medium text-gray-700">{totalCount} assets found</span>

      {selectedCount > 0 && (
        <div className="ml-4 flex items-center gap-2">
          <span className="text-sm font-medium text-blue-700">{selectedCount} selected</span>
          <button
            onClick={onBulkDownload}
            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
            title="Download selected"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onBulkDelete}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
            title="Delete selected"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  </div>
);

// Asset Grid Component (Reusable)
interface AssetGridProps {
  assets: DigitalAsset[];
  selectedAssets: Set<number>;
  hoveredAssetId: number | null;
  onSelectAsset: (assetId: number) => void;
  onPreviewAsset: (asset: DigitalAsset) => void;
  onDownloadAsset: (assetId: number) => void;
  onDeleteAsset: (assetId: number) => void;
  onHoverAsset: (assetId: number | null) => void;
}

const AssetGrid: FC<AssetGridProps> = ({
  assets,
  selectedAssets,
  hoveredAssetId,
  onSelectAsset,
  onPreviewAsset,
  onDownloadAsset,
  onDeleteAsset,
  onHoverAsset,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-max overflow-y-auto">
    {assets.map((asset) => (
      <div key={asset.id} className="relative">
        <input
          type="checkbox"
          checked={selectedAssets.has(asset.id)}
          onChange={() => onSelectAsset(asset.id)}
          className="border-radius-5 absolute top-3 left-3 z-10 w-5 h-5 rounded cursor-pointer"
        />
        <DAMAssetCard
          asset={asset}
          isSelected={selectedAssets.has(asset.id)}
          onSelect={() => onSelectAsset(asset.id)}
          onPreview={onPreviewAsset}
          onDownload={onDownloadAsset}
          onDelete={onDeleteAsset}
          onHover={onHoverAsset}
          isHovered={hoveredAssetId === asset.id}
        />
      </div>
      ))}
  </div>
);

// Empty State Component (Reusable)
const EmptyState: FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-neutral-400">
    <HardDrive className="h-16 w-16 mb-4 opacity-50" />
    <h3 className="text-lg font-semibold mb-2 text-gray-900">No assets found</h3>
    <p className="text-sm">Upload some assets to get started</p>
  </div>
);

// Sidebar Component (Reusable)
interface SidebarProps {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product;
  productSearch: string;
  onProductSearch: (search: string) => void;
  onProductSelect: (product: Product) => void;
}

const Sidebar: FC<SidebarProps> = ({
  products,
  filteredProducts,
  selectedProduct,
  productSearch,
  onProductSearch,
  onProductSelect,
}) => (
  <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col shadow-sm overflow-hidden">
    <div className="p-6 border-b border-neutral-200 flex-shrink-0">
      <h2 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">Products</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search products..."
          value={productSearch}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onProductSearch(e.target.value)}
          className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-50 text-sm"
        />
      </div>
    </div>

    <nav className="flex-1 overflow-auto p-2 space-y-1">
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedProduct.id === product.id}
          onClick={onProductSelect}
        />
      ))}
    </nav>
  </aside>
);

// Main DAM Page Component
const DAMPage: FC = () => {
  // State
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
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
  const [hoveredAssetId, setHoveredAssetId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("library");
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
// Add this handler to DAMPage state and handlers section:

const [viewingCollectionId, setViewingCollectionId] = useState<number | null>(null);

const handleViewCollectionAssets = (collection: Collection) => {
  setViewingCollectionId(collection.id);
  // Switch to library tab but show filtered assets
  setActiveTab("library");
};

// Update the library tab header to show collection name if viewing collection

  // Memoized data
  const currentAssets = digitalAssets[selectedProduct.id] || [];

  const filteredAssets = useMemo<DigitalAsset[]>(() => {
    return currentAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
        asset.format.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());

      const matchesType =
        searchFilters.assetType === "all" || asset.type === searchFilters.assetType;

      const assetDate = new Date(asset.uploadDate);
      const matchesDateRange =
        (!searchFilters.dateRange.startDate ||
          assetDate >= new Date(searchFilters.dateRange.startDate)) &&
        (!searchFilters.dateRange.endDate ||
          assetDate <= new Date(searchFilters.dateRange.endDate));

      const matchesUploader =
        !searchFilters.uploader || asset.uploadedBy === searchFilters.uploader;

      return matchesSearch && matchesType && matchesDateRange && matchesUploader;
    });
  }, [currentAssets, searchFilters]);

  // No sorting needed - display in upload date order
  const sortedAssets = useMemo<DigitalAsset[]>(() => {
    return [...filteredAssets].sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }, [filteredAssets]);

  const filteredProducts = useMemo<Product[]>(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  // Handlers
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

  const handleCreateCollection = (name: string, parentId?: number) => {
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

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "library":
        return (
          <>
            <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-8 py-6 flex flex-col gap-4 shadow-sm flex-shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Digital Asset Management
                </h1>
                <p className="text-neutral-500 text-sm mt-1">
                  Managing assets for:{" "}
                  <span className="font-semibold text-neutral-800">{selectedProduct.name}</span>
                </p>
              </div>
              {/* Unified Search & Filter - ONLY ONE FILTER COMPONENT */}
              <DAMSearchFilters assets={sortedAssets} onFilterChange={setSearchFilters} />
            </header>

            <section className="flex-1 px-8 py-6 overflow-auto">
              {sortedAssets.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="flex flex-col h-full">
                  {/* Simplified Toolbar - Only Bulk Actions */}
                  <Toolbar
                    selectedCount={selectedAssets.size}
                    totalCount={sortedAssets.length}
                    onSelectAll={handleSelectAll}
                    isAllSelected={selectedAssets.size === sortedAssets.length}
                    onBulkDownload={handleBulkDownload}
                    onBulkDelete={handleBulkDelete}
                  />
                  <AssetGrid
                    assets={sortedAssets}
                    selectedAssets={selectedAssets}
                    hoveredAssetId={hoveredAssetId}
                    onSelectAsset={handleSelectAsset}
                    onPreviewAsset={handleAssetPreview}
                    onDownloadAsset={handleAssetDownload}
                    onDeleteAsset={handleAssetDelete}
                    onHoverAsset={setHoveredAssetId}
                  />
                </div>
              )}
            </section>
          </>
        );

// In DAMPage.tsx renderTabContent() - UPDATE THE COLLECTIONS CASE:

case "collections":
  return (
    <DAMCollections
      collections={collections}
      onCreateCollection={handleCreateCollection}
      onDeleteCollection={handleDeleteCollection}
      onRenameCollection={handleRenameCollection}
      onSelectCollection={(selectedCollection) => {
        // When user clicks a collection, navigate to its assets
        handleViewCollectionAssets(selectedCollection);
      }}
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
          />
        );
    }
  };

  return (


    
    <div className="flex flex-col h-screen bg-neutral-100 font-sans">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          products={products}
          filteredProducts={filteredProducts}
          selectedProduct={selectedProduct}
          productSearch={productSearch}
          onProductSearch={setProductSearch}
          onProductSelect={(product) => {
            setSelectedProduct(product);
            setSelectedAssets(new Set());
          }}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          {renderTabContent()}
        </main>
      </div>

      <FloatingAddButton
        onClick={() => setActiveTab("upload")}
        label="Upload Assets"
        icon={Upload}
      />

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
