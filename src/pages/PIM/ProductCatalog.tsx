import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid3X3,
  Download,
  Upload,
  Search,
  Filter,
  ChevronDown,
  X,
  Plus,
  Info,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Settings,
  EyeOff,
  Columns,
  Image as ImageIcon,
} from "lucide-react";
import { Grid, GridColumn as Column, GridSelectionChangeEvent, GridHeaderSelectionChangeEvent } from "@progress/kendo-react-grid";
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs";
import { process } from "@progress/kendo-data-query";
import { SelectDescriptor } from "@progress/kendo-react-data-tools";
import { mockProducts } from "../../data/mockData";
import FloatingAddButton from "../../../helper_Functions/FloatingAddButton";
import ExportButton from "../../../helper_Functions/Export";
import { PDFExport } from '@progress/kendo-react-pdf';
import AddProductModal from "../../components/PIM/AddProductModal";
import ProductStatsInfo from "../../components/PIM/ProductStatsInfo";
import ViewManagementModal from "../../components/PIM/ViewManagementModal";
import DigitalAssetsPanel from "../../components/PIM/DigitalAssetsPanel";

const ProductCatalogHeader = () => (
  <div className="flex items-center gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
        Product Catalog
        <ProductStatsInfo />
      </h1>
      <p className="text-gray-600 mt-1">
        Manage your product information and syndication status
      </p>
    </div>
  </div>
);

const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  filterOptions,
  clearFilters,
  onOpenViewManagement,
}) => {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, SKUs, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-sm font-medium ${
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

        </div>

        {showFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                {
                  field: "category",
                  label: "Category",
                  options: filterOptions.categories,
                },
                {
                  field: "brand",
                  label: "Brand",
                  options: filterOptions.brands,
                },
                {
                  field: "completeness",
                  label: "Completeness",
                  options: ["high", "medium", "low"],
                },
                {
                  field: "syndicationStatus",
                  label: "Sync Status",
                  options: ["synced", "pending", "failed"],
                },
              ].map((filter) => (
                <div key={filter.field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <select
                    value={filters[filter.field]}
                    onChange={(e) =>
                      setFilters({ ...filters, [filter.field]: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label={`Filter by ${filter.label}`}
                    title={`Filter by ${filter.label}`}
                  >
                    <option value="">
                      All{" "}
                      {filter.label === "Sync Status"
                        ? "Sync Status"
                        : filter.label + "s"}
                    </option>
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {filter.field === "completeness"
                          ? `${option} (${
                              option === "high"
                                ? "90%+"
                                : option === "medium"
                                ? "70-89%"
                                : "<70%"
                            })`
                          : option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" /> Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductLegend = () => {
  const legendItems = [
    {
      icon: CheckCircle,
      text: "Synced",
      desc: "Successfully synchronized",
      color: "green",
    },
    {
      icon: Clock,
      text: "Pending",
      desc: "Waiting for approval or processing",
      color: "yellow",
    },
    {
      icon: XCircle,
      text: "Failed",
      desc: "Synchronization failed - requires attention",
      color: "red",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Channel Status Legend
        </span>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        {legendItems.map((item) => (
          <div key={item.text} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${item.color}-100 text-${item.color}-800 border border-${item.color}-200`}
            >
              <item.icon className="h-3 w-3" /> {item.text}
            </span>
            <span className="text-gray-600">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductCatalogPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [select, setSelect] = useState<SelectDescriptor>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewManagementModal, setShowViewManagementModal] = useState(false);
  const [showDigitalAssetsPanel, setShowDigitalAssetsPanel] = useState(false);
  const [selectedProductForAssets, setSelectedProductForAssets] = useState<any>(null);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    status: "",
    completeness: "",
    syndicationStatus: "",
  });

  const [views, setViews] = useState([
    {
      name: "Complete Product View",
      columns: [
        {
          field: "productName",
          title: "Product",
          visible: true,
          required: true,
        },
        { field: "sku", title: "SKU", visible: true, required: true },
        {
          field: "categoryInfo",
          title: "Category",
          visible: true,
          required: false,
        },
        { field: "brand", title: "Brand", visible: true, required: false },
        {
          field: "channelsStatus",
          title: "Channels",
          visible: true,
          required: false,
        },
        {
          field: "completenessPercent",
          title: "Completeness",
          visible: true,
          required: false,
        },
        {
          field: "lastModified",
          title: "Last Modified",
          visible: true,
          required: false,
        },
        { field: "actions", title: "Actions", visible: true, required: true },
      ],
    }
  ]);

  const [gridFilter, setGridFilter] = useState({ logic: "and", filters: [] });
  const [sort, setSort] = useState([]);
  const [group, setGroup] = useState([]);
  const [page, setPage] = useState({ skip: 0, take: 10 });

  const filterOptions = useMemo(
    () => ({
      categories: [...new Set(mockProducts.map((p) => p.category))],
      brands: [...new Set(mockProducts.map((p) => p.brand))],
      statuses: [...new Set(mockProducts.map((p) => p.status))],
    }),
    []
  );

  const filteredProducts = useMemo(
    () =>
      mockProducts.filter((product) => {
        const matchesSearch =
          !searchTerm ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          !filters.category || product.category === filters.category;
        const matchesBrand = !filters.brand || product.brand === filters.brand;
        const matchesStatus =
          !filters.status || product.status === filters.status;
        const matchesCompleteness =
          !filters.completeness ||
          (filters.completeness === "high" && product.completeness >= 90) ||
          (filters.completeness === "medium" &&
            product.completeness >= 70 &&
            product.completeness < 90) ||
          (filters.completeness === "low" && product.completeness < 70);
        const matchesSyndicationStatus =
          !filters.syndicationStatus ||
          product.channels.some(
            (channel) => channel.status === filters.syndicationStatus
          );

        return (
          matchesSearch &&
          matchesCategory &&
          matchesBrand &&
          matchesStatus &&
          matchesCompleteness &&
          matchesSyndicationStatus
        );
      }),
    [searchTerm, filters]
  );

  const processedProducts = useMemo(
    () =>
      filteredProducts.map((product) => ({
        ...product,
        productName: product.name,
        categoryInfo: `${product.category} / ${product.subcategory}`,
        completenessPercent: product.completeness,
        channelsStatus: product.channels,
      })),
    [filteredProducts]
  );

  const processedData = process(processedProducts, {
    filter: gridFilter as any,
    sort,
    group,
    skip: page.skip,
    take: page.take,
  });

  const currentViewColumns = useMemo(() => {
    const view = views[0]; // Always use first view
    if (!view) return [];
    const cols = view.columns.filter(
      (col) => col.visible && col.field !== "actions"
    );
    const actionsCol = view.columns.find(
      (col) => col.visible && col.field === "actions"
    );
    return actionsCol ? [...cols, actionsCol] : cols;
  }, [views]);

  const getChannelStatusColor = (status) => {
    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getChannelStatusIcon = (status) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "failed":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getCompletenessColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-500";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-500";
    return "text-red-600 bg-red-500";
  };

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
        className="k-pager k-pager-md k-grid-pager border-t border-gray-300"
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

  const productNameCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td>N/A</td>;
    return (
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {props.dataItem.name}
          </div>
          <div className="text-sm text-gray-500">{props.dataItem.brand}</div>
        </div>
      </td>
    );
  }, []);

  const categoryCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td>N/A</td>;
    return (
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{props.dataItem.category}</div>
        <div className="text-sm text-gray-500">
          {props.dataItem.subcategory}
        </div>
      </td>
    );
  }, []);

  const channelsCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.channels) return <td>N/A</td>;
    return (
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {props.dataItem.channels.map((channel) => (
            <div key={channel.name} className="group relative">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border cursor-help ${getChannelStatusColor(
                  channel.status
                )}`}
              >
                {getChannelStatusIcon(channel.status)}
                {channel.name}
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                <div className="font-medium mb-1">
                  {channel.name} -{" "}
                  {channel.status.charAt(0).toUpperCase() +
                    channel.status.slice(1)}
                </div>
                <div className="text-gray-300">{channel.reason}</div>
                <div className="text-gray-400 text-xs mt-1">
                  Last sync: {channel.lastSync}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          ))}
        </div>
      </td>
    );
  }, []);

  const completenessCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.completeness) return <td>N/A</td>;
    return (
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
              <div
                className={`h-2 rounded-full absolute left-0 top-0 ${
                  getCompletenessColor(props.dataItem.completeness).split(
                    " "
                  )[1]
                }`}
                {...{ style: { width: `${props.dataItem.completeness}%` } }}
              />
            </div>
          </div>
          <span
            className={`text-sm font-medium ${
              getCompletenessColor(props.dataItem.completeness).split(" ")[0]
            }`}
          >
            {props.dataItem.completeness}%
          </span>
        </div>
      </td>
    );
  }, []);

  const onSelectionChange = useCallback((event: GridSelectionChangeEvent) => {
    console.log('Selection changed:', event.select); // Debug
    setSelect(event.select);
  }, []);

  const onHeaderSelectionChange = useCallback((event: GridHeaderSelectionChangeEvent) => {
    console.log('Header selection changed:', event.select); // Debug
    setSelect(event.select);
  }, []);

  const selectedProducts = useMemo(() => {
    console.log('Select object:', select); // Debug
    if (!select || Object.keys(select).length === 0) {
      console.log('No selection'); // Debug
      return [];
    }
    // Get the selected IDs from the keys where value is true
    const selectedIDs = Object.keys(select).filter(key => select[key] === true);
    console.log('Selected IDs:', selectedIDs); // Debug
    
    if (selectedIDs.length === 0) {
      console.log('Empty selection'); // Debug
      return [];
    }
    const selected = processedProducts.filter(product => selectedIDs.includes(product.id));
    console.log('Selected Products Count:', selected.length); // Debug log
    return selected;
  }, [processedProducts, select]);

  const hasSelection = selectedProducts.length > 0;

  // Not using useCallback here so it re-renders when selectedProducts changes
  const actionsCell = (props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td></td>;
    
    console.log('Rendering actions cell, hasSelection:', hasSelection); // Debug log
    
    // If multiple products are selected, show "Assign Field Mapping" button
    if (hasSelection) {
      return (
        <td className="px-6 py-4">
          <div className="flex justify-center">
            <button
              onClick={handleAssignFieldMapping}
              className="px-3 py-1.5 text-xs border border-[#DD522C] text-[#DD522C] bg-[#FDE2CF] rounded-md hover:bg-[#F27A56] hover:text-white transition-colors font-medium flex items-center gap-1.5"
              title="Assign Field Mapping"
            >
              <Settings className="h-3.5 w-3.5" />
              Assign Field Mapping
            </button>
          </div>
        </td>
      );
    }
    
    // Default actions when no products are selected
    return (
      <td className="px-6 py-4">
        <div className="flex justify-center gap-1">
          <button
            onClick={() => handleViewProduct(props.dataItem.id)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Product"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditProduct(props.dataItem.id)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleViewAssets(props.dataItem)}
            className="p-2 text-gray-400 hover:text-[#DD522C] hover:bg-[#FDE2CF] rounded-lg transition-colors"
            title="Digital Assets"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    );
  };

  const handleAssignFieldMapping = () => {
    alert(`Assigning field mapping to ${selectedProducts.length} products`);
    // TODO: Implement field mapping assignment
  };

  const handleViewProduct = (productId) =>
    navigate(`/pim/products/${productId}`);
  const handleEditProduct = (productId) =>
    navigate(`/pim/products/${productId}/edit`);
  const handleViewAssets = (product) => {
    setSelectedProductForAssets(product);
    setShowDigitalAssetsPanel(true);
  };
  const handleAddProduct = () => setShowAddModal(true);
  const handleCreateProduct = (data) => {
    setShowAddModal(false);
    
    if (data.type === "bulk") {
      // TODO: Navigate to bulk import page when implemented
      console.log("Bulk import selected:", data);
      alert("Bulk import feature coming soon!");
      return;
    }
    
    // Build query params for single product
    const params = new URLSearchParams();
    if (data.viewTemplateId) params.append("view", data.viewTemplateId);
    if (data.selectedRetailers && data.selectedRetailers.length > 0) {
      params.append("retailers", data.selectedRetailers.join(","));
    }
    if (data.productName) params.append("name", data.productName);
    if (data.category) params.append("category", data.category);
    
    navigate(`/pim/products/new?${params.toString()}`);
  };
  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      status: "",
      completeness: "",
      syndicationStatus: "",
    });
    setGridFilter({ logic: "and", filters: [] });
  };
  const onViewsUpdate = (updatedViews) => setViews(updatedViews);

  const renderColumn = (column) => {
    const commonProps = {
      field: column.field,
      title: column.title,
      filterable:
        column.field !== "actions" && column.field !== "channelsStatus",
    };

    const filterInput = (props, label, type = "text", options = []) => (
      <div className="p-2">
        <label className="block mb-1 text-sm text-gray-700">
          Filter by {label}
        </label>
        {type === "select" ? (
          <select
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={props.value || ""}
            onChange={(e) =>
              props.onChange(e.target.value === "" ? null : e.target.value)
            }
            aria-label={`Filter by ${label}`}
            title={`Filter by ${label}`}
          >
            <option value="">All {label}s</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={props.value || ""}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
          />
        )}
      </div>
    );

    switch (column.field) {
      case "productName":
        return (
          <Column
            {...commonProps}
            cell={productNameCell}
            filterable={{ ui: (props: any) => filterInput(props, "Product") } as any}
          />
        );
      case "sku":
        return (
          <Column
            {...commonProps}
            filterable={{ ui: (props: any) => filterInput(props, "SKU") } as any}
          />
        );
      case "categoryInfo":
        return (
          <Column
            {...commonProps}
            cell={categoryCell}
            filterable={{
              ui: (props: any) =>
                filterInput(
                  props,
                  "Category",
                  "select",
                  filterOptions.categories
                ),
            } as any}
          />
        );
      case "brand":
        return (
          <Column
            {...commonProps}
            filterable={{
              ui: (props: any) =>
                filterInput(props, "Brand", "select", filterOptions.brands),
            } as any}
          />
        );
      case "channelsStatus":
        return (
          <Column {...commonProps} cell={channelsCell} filterable={false} />
        );
      case "completenessPercent":
        return (
          <Column
            {...commonProps}
            cell={completenessCell}
            filterable={{
              ui: (props: any) =>
                filterInput(props, "Completeness", "select", [
                  "high",
                  "medium",
                  "low",
                ]),
            } as any}
          />
        );
      case "lastModified":
        return (
          <Column
            {...commonProps}
            filterable={{ ui: (props: any) => filterInput(props, "Date", "date") } as any}
          />
        );
      case "actions":
        return (
          <Column
            {...commonProps}
            width="120px"
            cell={actionsCell}
            filterable={false}
            headerCell={() => <span className="k-link">Actions</span>}
          />
        );
      default:
        return <Column {...commonProps} />;
    }
  };

  const gridRef = useRef<any>(null);
  const pdfExportComponent = useRef<any>(null);

  const handlePdfExport = () => {
    if (pdfExportComponent?.current) {
      pdfExportComponent.current.save();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <style>{`
        .k-grid-content tr.k-grouping-row td {
          padding: 0.75rem 1rem;
          background-color: #f3f4f6;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
        }
        .k-grid-content tr.k-grouping-row + tr td {
          border-top: none;
        }
        .k-grid-header th.k-header {
          font-weight: 600;
          padding: 0.75rem 1rem;
        }
        .k-grid td {
          padding: 0.75rem 1rem;
          vertical-align: middle;
        }
        .k-grouping-header {
          padding: 0.5rem;
          background-color: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
        }
        .k-grid-grouping-row {
          background-color: #f3f4f6;
        }
      `}</style>

      <div className="flex gap-4 items-center justify-between">
        <ProductCatalogHeader />
        <div className="flex gap-3 items-center">
            {[
              {
                icon: Grid3X3,
                text: "Manage Views",
                onClick: () => navigate("/pim/views"),
              },
              // { icon: Download, text: "Import" },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <btn.icon className="h-4 w-4" /> {btn.text}
              </button>
            ))}
          {/* <ExportButton
            data={processedProducts}
            columns={currentViewColumns}
            gridRef={gridRef}
            fileName="ProductCatalog"
            pdfExportComponent={pdfExportComponent}
          /> */}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredProducts.length} of {mockProducts.length} products
        </span>
        <div className="flex items-center gap-4">
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span>
              {Object.values(filters).filter(Boolean).length} filter(s) applied
            </span>
          )}
        </div>
      </div>
      
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        clearFilters={clearFilters}
        onOpenViewManagement={() => setShowViewManagementModal(true)}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Products</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowViewManagementModal(true)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Columns className="h-4 w-4" /> Customize Columns
              </button>
            </div>
          </div>
        </div>

        {processedData.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <PDFExport
            ref={pdfExportComponent}
            margin={{ top: 0, left: 10, right: 10, bottom: 10 }}
            paperSize={['2000px', '1400px'] as any}
            landscape={true}
          >
            <Grid 
              ref={gridRef}
              key={`grid-selection-${hasSelection}`}
              style={{ height: "auto", border: "none" }}
              data={processedData}
              dataItemKey="id"
              selectable={{
                enabled: true,
                drag: false,
                cell: false,
                mode: 'multiple'
              }}
              select={select}
              onSelectionChange={onSelectionChange}
              onHeaderSelectionChange={onHeaderSelectionChange}
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
              total={processedProducts.length || 0}
              onPageChange={(e) => setPage(e.page)}
              pager={MyPager}
              groupPanel={{
                className: "bg-white p-3 mb-2 border border-gray-200 rounded",
                placeholder:
                  "Drag a column header and drop it here to group by that column",
              }}
              className="border-none"
            >
              <Column columnType="checkbox" width="50px" filterable={false} />
              {currentViewColumns.map((column) => renderColumn(column))}
            </Grid>
          </PDFExport>
        )}
      </div>

      <ProductLegend />
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateProduct}
      />
      <FloatingAddButton
        onClick={handleAddProduct}
        label="Add Product"
        icon={Plus}
        className="z-40"
      />
      <ViewManagementModal
        isOpen={showViewManagementModal}
        onClose={() => setShowViewManagementModal(false)}
        currentView={views[0]?.name || "Default View"}
        views={views}
        onViewChange={() => {}} // No-op since we removed view switching
        onViewsUpdate={onViewsUpdate}
      />
      <DigitalAssetsPanel
        isOpen={showDigitalAssetsPanel}
        onClose={() => setShowDigitalAssetsPanel(false)}
        productId={selectedProductForAssets?.id || ""}
        productName={selectedProductForAssets?.productName || ""}
      />
    </div>
  );
};

export default ProductCatalogPage;
