import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Upload,
  Eye,
  Download,
  Edit,
  Trash2,
  ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
  HardDrive,
  X,
} from "lucide-react";
import FloatingAddButton from "../../../helper_Functions/FloatingAddButton";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs";
import { process } from "@progress/kendo-data-query";

// Mock data for products
const products = [
  {
    id: 1,
    name: "Wireless Headphones Pro",
    sku: "WHP-001",
    category: "Electronics",
    status: "Active",
    assetCount: 12,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 2,
    name: "Smart Watch Series X",
    sku: "SWX-002",
    category: "Wearables",
    status: "Active",
    assetCount: 8,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 3,
    name: "Bluetooth Speaker Mini",
    sku: "BSM-003",
    category: "Audio",
    status: "Draft",
    assetCount: 5,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 4,
    name: "Gaming Keyboard RGB",
    sku: "GKR-004",
    category: "Gaming",
    status: "Active",
    assetCount: 15,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
  {
    id: 5,
    name: "Wireless Mouse Pro",
    sku: "WMP-005",
    category: "Accessories",
    status: "Active",
    assetCount: 7,
    thumbnail: "/placeholder.svg?height=60&width=60",
  },
];

// Mock data for digital assets
const digitalAssets = {
  1: [
    {
      id: 101,
      name: "headphones-hero-image.jpg",
      type: "image",
      size: "2.4 MB",
      dimensions: "1920x1080",
      format: "JPEG",
      uploadDate: "2024-01-15",
      uploadedBy: "John Doe",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 102,
      name: "headphones-product-demo.mp4",
      type: "video",
      size: "15.2 MB",
      duration: "0:45",
      format: "MP4",
      uploadDate: "2024-01-14",
      uploadedBy: "Jane Smith",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 103,
      name: "headphones-specifications.pdf",
      type: "document",
      size: "1.1 MB",
      pages: 4,
      format: "PDF",
      uploadDate: "2024-01-13",
      uploadedBy: "Mike Johnson",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 104,
      name: "headphones-lifestyle-1.jpg",
      type: "image",
      size: "3.1 MB",
      dimensions: "2048x1536",
      format: "JPEG",
      uploadDate: "2024-01-12",
      uploadedBy: "Sarah Wilson",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 105,
      name: "headphones-unboxing.jpg",
      type: "image",
      size: "2.8 MB",
      dimensions: "1800x1200",
      format: "JPEG",
      uploadDate: "2024-01-11",
      uploadedBy: "Tom Brown",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 106,
      name: "headphones-360-view.zip",
      type: "archive",
      size: "45.6 MB",
      files: 36,
      format: "ZIP",
      uploadDate: "2024-01-10",
      uploadedBy: "Alex Davis",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
  ],
  2: [
    {
      id: 201,
      name: "smartwatch-hero.jpg",
      type: "image",
      size: "2.1 MB",
      dimensions: "1920x1080",
      format: "JPEG",
      uploadDate: "2024-01-20",
      uploadedBy: "Lisa Chen",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
    {
      id: 202,
      name: "smartwatch-features.mp4",
      type: "video",
      size: "22.5 MB",
      duration: "1:30",
      format: "MP4",
      uploadDate: "2024-01-19",
      uploadedBy: "David Kim",
      url: "/placeholder.svg?height=300&width=300",
      thumbnail: "/placeholder.svg?height=150&width=150",
    },
  ],
};

const getAssetIcon = (type) => {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    case "video":
      return <Video className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    case "audio":
      return <Music className="h-4 w-4" />;
    case "archive":
      return <Archive className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getAssetTypeColor = (type) => {
  switch (type) {
    case "image":
      return "bg-blue-100 text-blue-800";
    case "video":
      return "bg-purple-100 text-purple-800";
    case "document":
      return "bg-green-100 text-green-800";
    case "audio":
      return "bg-orange-100 text-orange-800";
    case "archive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function DAMPage() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Kendo Grid state
  const [gridFilter, setGridFilter] = useState({ logic: "and", filters: [] });
  const [sort, setSort] = useState([]);
  const [group, setGroup] = useState([]);
  const [page, setPage] = useState({ skip: 0, take: 10 });

  const currentAssets = digitalAssets[selectedProduct.id] || [];

  const filteredAssets = useMemo(() => {
    return currentAssets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || asset.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [currentAssets, searchTerm, filterType]);

  // Process data for Kendo Grid
  const processedData = process(filteredAssets, {
    filter: gridFilter as any,
    sort,
    group,
    skip: page.skip,
    take: page.take,
  });

  const handleUploadClick = () => {
    // Handle upload functionality
    console.log("Upload assets clicked");
  };

  // Custom Pager Component
  const MyPager = (props) => {
    const currentPage = Math.floor(props.skip / props.take) + 1;
    const totalPages = Math.ceil((props.total || 0) / props.take) || 1;
    const handleChange = (event) =>
      props.onPageChange?.({
        target: { element: null, props },
        skip: ((event.value ?? 1) - 1) * props.take,
        take: props.take,
        syntheticEvent: event.syntheticEvent,
        nativeEvent: event.nativeEvent,
        targetEvent: { value: event.value },
      });
    return (
      <div
        className="k-pager k-pager-md k-grid-pager"
        style={{ borderTop: "1px solid", borderTopColor: "inherit" }}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex-1">
            <Slider
              buttons={true}
              step={1}
              value={currentPage}
              min={1}
              max={totalPages}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1 flex justify-center">
            <NumericTextBox
              value={currentPage}
              onChange={handleChange}
              min={1}
              max={totalPages}
              width={60}
            />
          </div>
          <div className="flex-1 text-right text-sm text-gray-600">{`Page ${currentPage} of ${totalPages}`}</div>
        </div>
      </div>
    );
  };

  // Custom Cell Components
  const assetNameCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td>N/A</td>;

    return (
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-neutral-900 truncate">
          {props.dataItem.name}
        </div>
      </td>
    );
  }, []);

  const assetTypeCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.type) return <td>N/A</td>;

    return (
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAssetTypeColor(
            props.dataItem.type
          )}`}
        >
          {getAssetIcon(props.dataItem.type)}
          <span className="ml-1 capitalize">{props.dataItem.type}</span>
        </span>
      </td>
    );
  }, []);

  const actionsCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td></td>;

    return (
      <td className="px-6 py-4">
        <div className="flex gap-1">
          <button
            className="p-1 text-neutral-400 hover:text-blue-600 focus:outline-none"
            title="View details"
            onClick={() => {
              setSelectedAsset(props.dataItem);
              setIsModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-1 text-neutral-400 hover:text-blue-600 focus:outline-none" title="Download">
            <Download className="h-4 w-4" />
          </button>
          <button className="p-1 text-neutral-400 hover:text-blue-600 focus:outline-none" title="Edit">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-1 text-neutral-400 hover:text-red-500 focus:outline-none" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    );
  }, []);

  return (
    <div className="flex h-screen bg-neutral-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">Products</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-50 text-sm"
              // (Optional) Add product search logic
            />
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-2 space-y-1">
          {products.map((product) => (
            <button
              key={product.id}
              className={`w-full text-left px-4 py-3 rounded-lg flex flex-col border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedProduct.id === product.id
                  ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow"
                  : "bg-white border-transparent hover:bg-neutral-50"
              }`}
              onClick={() => setSelectedProduct(product)}
            >
              <span className="font-medium text-neutral-900 truncate">{product.name}</span>
              <span className="text-xs text-neutral-500">{product.sku}</span>
              <div className="flex items-center justify-between mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    product.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {product.status}
                </span>
                <span className="text-xs text-neutral-400">{product.assetCount} assets</span>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-8 py-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Digital Asset Management</h1>
              <p className="text-neutral-500 text-sm mt-1">
                Managing assets for: <span className="font-semibold text-neutral-800">{selectedProduct.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-50 text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-44 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-neutral-50 text-sm"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="audio">Audio</option>
              <option value="archive">Archives</option>
            </select>
          </div>
        </header>

        {/* Asset Grid */}
        <section className="flex-1 px-8 py-6 overflow-auto">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
              <HardDrive className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assets found</h3>
              <p className="text-sm">Upload some assets to get started</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-neutral-900">Assets</h3>
                  <span className="text-sm text-neutral-600">
                    {filteredAssets.length} assets found
                  </span>
                </div>
              </div>

              <Grid
                style={{ height: "600px", border: "none" }}
                data={processedData}
                filterable={true}
                sortable={true}
                groupable={true}
                filter={gridFilter as any}
                sort={sort}
                group={group}
                onFilterChange={(e) => setGridFilter(e.filter)}
                onSortChange={(e) => setSort(e.sort)}
                onGroupChange={(e) => setGroup(e.group)}
                pageable={true}
                skip={page.skip}
                take={page.take}
                total={filteredAssets.length || 0}
                onPageChange={(e) => setPage(e.page)}
                pager={MyPager}
                groupPanel={{
                  className: "bg-white p-3 mb-2 border border-gray-200 rounded",
                  placeholder:
                    "Drag a column header and drop it here to group by that column",
                }}
                className="border-none"
              >
                <Column
                  field="name"
                  title="Name"
                  cell={assetNameCell}
                  filterable={{
                    ui: (props: any) => (
                      <div className="p-2">
                        <label className="block mb-1 text-sm text-gray-700">
                          Filter by Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={props.value || ""}
                          onChange={(e) => props.onChange(e.target.value)}
                          placeholder="Search assets..."
                        />
                      </div>
                    ),
                  } as any}
                />
                <Column
                  field="type"
                  title="Type"
                  cell={assetTypeCell}
                  filterable={{
                    ui: (props: any) => (
                      <div className="p-2">
                        <label className="block mb-1 text-sm text-gray-700">
                          Filter by Type
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={props.value || ""}
                          onChange={(e) =>
                            props.onChange(
                              e.target.value === "" ? null : e.target.value
                            )
                          }
                        >
                          <option value="">All Types</option>
                          <option value="image">Images</option>
                          <option value="video">Videos</option>
                          <option value="document">Documents</option>
                          <option value="audio">Audio</option>
                          <option value="archive">Archives</option>
                        </select>
                      </div>
                    ),
                  } as any}
                />
                <Column
                  field="size"
                  title="Size"
                  filterable={{
                    ui: (props: any) => (
                      <div className="p-2">
                        <label className="block mb-1 text-sm text-gray-700">
                          Filter by Size
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={props.value || ""}
                          onChange={(e) => props.onChange(e.target.value)}
                          placeholder="Search by size..."
                        />
                      </div>
                    ),
                  } as any}
                />
                <Column
                  field="format"
                  title="Format"
                  filterable={{
                    ui: (props: any) => (
                      <div className="p-2">
                        <label className="block mb-1 text-sm text-gray-700">
                          Filter by Format
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={props.value || ""}
                          onChange={(e) => props.onChange(e.target.value)}
                          placeholder="Search by format..."
                        />
                      </div>
                    ),
                  } as any}
                />
                <Column
                  field="uploadDate"
                  title="Modified"
                  filterable={{
                    ui: (props: any) => (
                      <div className="p-2">
                        <label className="block mb-1 text-sm text-gray-700">
                          Filter by Date
                        </label>
                        <input
                          type="date"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={props.value || ""}
                          onChange={(e) => props.onChange(e.target.value)}
                        />
                      </div>
                    ),
                  } as any}
                />
                <Column
                  field="uploadedBy"
                  title="Uploaded By"
                  filterable={{
                    ui: (props: any) => (
                      <div className="p-2">
                        <label className="block mb-1 text-sm text-gray-700">
                          Filter by User
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={props.value || ""}
                          onChange={(e) => props.onChange(e.target.value)}
                          placeholder="Search by user..."
                        />
                      </div>
                    ),
                  } as any}
                />
                <Column
                  field="actions"
                  title="Actions"
                  width="120px"
                  cell={actionsCell}
                  filterable={false}
                  headerCell={() => <span className="k-link">Actions</span>}
                />
              </Grid>
            </div>
          )}
        </section>
      </main>

      {/* Floating Upload Button */}
      <FloatingAddButton 
        onClick={handleUploadClick}
        label="Upload Assets"
        icon={Upload}
      />

      {/* Asset Details Modal */}
      {isModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 relative animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 focus:outline-none"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 flex items-center justify-center bg-neutral-100 rounded-xl min-h-[200px]">
                {/* Asset preview placeholder */}
                <span className="text-neutral-300 text-6xl">
                  {getAssetIcon(selectedAsset.type)}
                </span>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2">{selectedAsset.name}</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Type:</span>
                      <span className="capitalize">{selectedAsset.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Size:</span>
                      <span>{selectedAsset.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Format:</span>
                      <span>{selectedAsset.format}</span>
                    </div>
                    {selectedAsset.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Dimensions:</span>
                        <span>{selectedAsset.dimensions}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Uploaded:</span>
                      <span>{selectedAsset.uploadDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">By:</span>
                      <span>{selectedAsset.uploadedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </button>
                  <button className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}