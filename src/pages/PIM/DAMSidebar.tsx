// components/DAM/DAMSidebar.tsx
import React, { FC, ChangeEvent } from "react";
import { Search, ChevronLeft, ChevronRight, Grid3x3, Upload, Folder as FolderIcon, Sliders, Home } from "lucide-react";
import { Product, DigitalAsset, Collection } from "../../types/dam.types";

type ActiveTab = "library" | "upload" | "collections";

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: (product: Product | null) => void;
}

const ProductCard: FC<ProductCardProps> = ({ product, isSelected, onClick }) => (
  <button
    onClick={() => onClick(product)}
    className={`w-full text-left px-4 py-3 rounded-lg flex flex-col transition-all duration-200 ${
      isSelected
        ? "bg-blue-600 text-white"
        : "text-slate-900 hover:bg-slate-100"
    }`}
  >
    <span className="font-medium text-sm truncate">{product.name}</span>
    <span className={`text-xs mt-1 transition-colors ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
      {product.sku}
    </span>
  </button>
);

interface DAMSidebarProps {
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;
  productSearch: string;
  isCollapsed: boolean;
  onProductSearch: (s: string) => void;
  onProductSelect: (p: Product | null) => void;
  onToggleCollapse: () => void;
  activeTab: ActiveTab;
  sortedAssets: DigitalAsset[];
  selectedAssets: Set<number>;
  onTabChange: (tab: ActiveTab) => void;
  onFilterOpen: () => void;
}

const TAB_CONFIG: Record<ActiveTab, { label: string; icon: React.ReactNode }> = {
  library: { label: "Library", icon: <Grid3x3 className="h-5 w-5" /> },
  upload: { label: "Upload", icon: <Upload className="h-5 w-5" /> },
  collections: { label: "Collections", icon: <FolderIcon className="h-5 w-5" /> },
};

const DAMSidebar: FC<DAMSidebarProps> = ({
  products,
  filteredProducts,
  selectedProduct,
  productSearch,
  isCollapsed,
  onProductSearch,
  onProductSelect,
  onToggleCollapse,
  activeTab,
  sortedAssets,
  selectedAssets,
  onTabChange,
  onFilterOpen,
}) => {
  // ===== COLLAPSED STATE (CLEAN WHITE ICON SIDEBAR) =====
  if (isCollapsed) {
    return (
      <aside className="w-20 bg-white border-r border-slate-200/50 flex flex-col items-center py-6 gap-6 transition-all duration-300 shadow-sm">
        
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          title="Expand"
        >
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </button>

        {/* DIVIDER */}
        <div className="w-6 h-px bg-slate-200" />

    

        {/* TAB ICONS */}
        <div className="flex flex-col gap-2">
          {Object.entries(TAB_CONFIG).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => onTabChange(key as ActiveTab)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* DIVIDER */}
        <div className="w-6 h-px bg-slate-200" />

        {/* FILTERS ICON */}
        <button
          onClick={onFilterOpen}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 text-slate-400 hover:text-slate-600 mt-auto"
          title="Filters"
        >
          <Sliders className="h-5 w-5" />
        </button>
      </aside>
    );
  }

  // ===== EXPANDED STATE (FULL SIDEBAR) =====
  return (
    <aside className="w-72 bg-white flex flex-col overflow-hidden transition-all duration-300 shadow-sm border-r border-slate-200/50">
      
      {/* ===== HEADER ===== */}
      <div className="px-5 py-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Products</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={productSearch}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onProductSearch(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-slate-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="px-3 py-3 border-b border-slate-200/50">
        <div className="flex flex-col gap-1.5">
          {Object.entries(TAB_CONFIG).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => onTabChange(key as ActiveTab)}
              className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 text-sm font-medium ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== FILTERS BUTTON ===== */}
      <div className="px-3 py-3 border-b border-slate-200/50">
        {/* <button
          onClick={onFilterOpen}
          className="w-full px-3 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm"
        >
          <Sliders className="h-4 w-4" />
          <span>Filters</span>
        </button> */}
      </div>

      {/* ===== PRODUCTS LIST ===== */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
        <button
          onClick={() => onProductSelect(null)}
          className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 flex flex-col ${
            selectedProduct === null
              ? "bg-slate-900 text-white"
              : "text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span className="font-medium text-sm">All Assets</span>
        </button>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p>No products</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className="transition-all duration-200">
              <ProductCard product={p} isSelected={selectedProduct?.id === p.id} onClick={onProductSelect} />
            </div>
          ))
        )}
      </nav>
    </aside>
  );
};

export default DAMSidebar;
