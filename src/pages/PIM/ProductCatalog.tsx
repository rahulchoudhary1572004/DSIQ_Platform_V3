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
} from "lucide-react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs";
import { process } from "@progress/kendo-data-query";
import { mockProducts } from "../../data/mockData";
import FloatingAddButton from "../../../helper_Functions/FloatingAddButton";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ExportButton from "../../../helper_Functions/Export";
import { PDFExport } from '@progress/kendo-react-pdf';

const AddProductModal = ({ isOpen, onClose, onSubmit }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    view: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
    setNewProduct({ name: "", category: "", view: "" });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(60, 61, 61, 0.5)" }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Add New Product
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "category"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === "name" ? "Product Name" : "Category"}
              </label>
              <input
                type="text"
                value={newProduct[field]}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, [field]: e.target.value })
                }
                placeholder={`Enter ${
                  field === "name" ? "product name" : "category"
                }`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View Template
            </label>
            <select
              value={newProduct.view}
              onChange={(e) =>
                setNewProduct({ ...newProduct, view: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>
                Select view template
              </option>
              <option value="default">Complete Product View</option>
              <option value="customer-facing">Customer View</option>
              <option value="inventory-warehouse">
                Inventory & Warehouse View
              </option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add More Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductCatalogHeader = () => (
  <div className="flex justify-end items-center gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Product Catalog</h1>
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
  currentView,
  onViewChange,
  views,
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
          <div className="flex gap-3 items-center w-full md:w-auto">
            <div className="relative">
              <select
                value={currentView}
                onChange={(e) => onViewChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
              >
                {views.map((view) => (
                  <option key={view.name} value={view.name}>
                    {view.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={onOpenViewManagement}
              className="px-4 py-2 border border-blue-500 text-blue-700 rounded-lg text-sm font-medium bg-blue-50 hover:bg-blue-100 flex items-center gap-2 shadow-sm"
            >
              <Columns className="h-4 w-4" /> Customize Columns
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

const ProductStatsCards = () => {
  const stats = [
    { title: "Total Products", value: "1,247", icon: Grid3X3, color: "blue" },
    {
      title: "Active Products",
      value: "1,156",
      icon: CheckCircle,
      color: "green",
    },
    { title: "Syndicated", value: "892", icon: Upload, color: "blue" },
    {
      title: "Avg. Completeness",
      value: "82%",
      icon: AlertCircle,
      color: "amber",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${stat.color}-100 text-${stat.color}-600`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p
                className={`text-2xl font-semibold ${
                  stat.color === "green"
                    ? "text-green-600"
                    : stat.color === "amber"
                    ? "text-amber-600"
                    : "text-gray-900"
                }`}
              >
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ViewManagementModal = ({
  isOpen,
  onClose,
  currentView,
  views,
  onViewChange,
  onViewsUpdate,
}) => {
  const [tempViews, setTempViews] = useState(views);
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const currentViewData = tempViews.find((v) => v.name === currentView);
  const columnsExceptActions = currentViewData.columns.filter(
    (col) => col.field !== "actions"
  );
  const actionsColumn = currentViewData.columns.find(
    (col) => col.field === "actions"
  );

  const allColumns = Array.from(
    new Set(
      views.flatMap((v) =>
        v.columns
          .filter((c) => c.field !== "actions")
          .map((c) => ({
            field: c.field,
            title: c.title,
            required: c.required,
          }))
      )
    )
  );
  const currentFields = columnsExceptActions.map((col) => col.field);
  const availableColumns = allColumns.filter(
    (col) => !currentFields.includes(col.field)
  );
  const filteredAvailableColumns = availableColumns.filter((col) =>
    col.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddColumn = (field) => {
    const colToAdd = allColumns.find((col) => col.field === field);
    setTempViews((prev) =>
      prev.map((view) => {
        if (view.name === currentView) {
          const newCols = [
            ...columnsExceptActions,
            { ...colToAdd, visible: true },
          ];
          if (actionsColumn) newCols.push(actionsColumn);
          return { ...view, columns: newCols };
        }
        return view;
      })
    );
    setSearch("");
  };

  const handleRemoveColumn = (field) => {
    setTempViews((prev) =>
      prev.map((view) => {
        if (view.name === currentView) {
          const newCols = view.columns.filter((col) => col.field !== field);
          const colsNoActions = newCols.filter(
            (col) => col.field !== "actions"
          );
          const actionsCol = newCols.find((col) => col.field === "actions");
          if (actionsCol) colsNoActions.push(actionsCol);
          return { ...view, columns: colsNoActions };
        }
        return view;
      })
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    setTempViews((prev) =>
      prev.map((view) => {
        if (view.name === currentView) {
          const requiredCols = columnsExceptActions.filter(
            (col) => col.required
          );
          const optionalCols = columnsExceptActions.filter(
            (col) => !col.required
          );
          const reordered = Array.from(optionalCols);
          const [removed] = reordered.splice(result.source.index, 1);
          reordered.splice(result.destination.index, 0, removed);
          let newCols = [...requiredCols, ...reordered];
          if (actionsColumn) newCols.push(actionsColumn);
          return { ...view, columns: newCols };
        }
        return view;
      })
    );
  };

  const saveChanges = () => {
    onViewsUpdate(tempViews);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(60, 61, 61, 0.5)" }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Customize Columns
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add columns
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search a column"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {search && filteredAvailableColumns.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 max-h-40 overflow-y-auto">
                {filteredAvailableColumns.map((col) => (
                  <div
                    key={col.field}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleAddColumn(col.field)}
                  >
                    {col.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manage and reorder columns
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {columnsExceptActions
              .filter((col) => col.required)
              .map((col) => (
                <span
                  key={col.field}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded flex items-center text-sm font-medium cursor-default"
                >
                  {col.title}
                </span>
              ))}
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="columns-droppable" direction="horizontal">
              {(provided) => (
                <div
                  className="flex flex-wrap gap-2 min-h-[40px]"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {columnsExceptActions
                    .filter((col) => !col.required)
                    .map((col, idx) => (
                      <Draggable
                        key={col.field}
                        draggableId={col.field}
                        index={idx}
                      >
                        {(provided) => (
                          <span
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded flex items-center text-sm font-medium cursor-move"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {col.title}
                            <button
                              className="ml-2 text-gray-400 hover:text-red-600"
                              onClick={() => handleRemoveColumn(col.field)}
                              title="Remove column"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </span>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {actionsColumn && (
            <div className="mt-4 flex gap-2 items-center">
              <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded flex items-center text-sm font-medium cursor-not-allowed opacity-80">
                {actionsColumn.title} (Always last)
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={saveChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCatalogPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewManagementModal, setShowViewManagementModal] = useState(false);
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
    },
    {
      name: "Customer View",
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
          field: "completenessPercent",
          title: "Completeness",
          visible: true,
          required: false,
        },
        { field: "actions", title: "Actions", visible: true, required: true },
      ],
    },
    {
      name: "Inventory & Warehouse View",
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
          field: "lastModified",
          title: "Last Modified",
          visible: true,
          required: false,
        },
        { field: "actions", title: "Actions", visible: true, required: true },
      ],
    },
    {
      name: "Minimal View",
      columns: [
        {
          field: "productName",
          title: "Product",
          visible: true,
          required: true,
        },
        { field: "sku", title: "SKU", visible: true, required: true },
        { field: "actions", title: "Actions", visible: true, required: true },
      ],
    },
  ]);
  const [currentView, setCurrentView] = useState("Complete Product View");

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
    filter: gridFilter,
    sort,
    group,
    skip: page.skip,
    take: page.take,
  });

  const currentViewColumns = useMemo(() => {
    const view = views.find((v) => v.name === currentView);
    if (!view) return [];
    const cols = view.columns.filter(
      (col) => col.visible && col.field !== "actions"
    );
    const actionsCol = view.columns.find(
      (col) => col.visible && col.field === "actions"
    );
    return actionsCol ? [...cols, actionsCol] : cols;
  }, [views, currentView]);

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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  getCompletenessColor(props.dataItem.completeness).split(
                    " "
                  )[1]
                }`}
                style={{ width: `${props.dataItem.completeness}%` }}
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

  const actionsCell = useCallback((props) => {
    if (props.rowType === "groupHeader") return null;
    if (!props.dataItem?.id) return <td></td>;
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
        </div>
      </td>
    );
  }, []);

  const handleViewProduct = (productId) =>
    navigate(`/pim/products/${productId}`);
  const handleEditProduct = (productId) =>
    navigate(`/pim/products/${productId}/edit`);
  const handleAddProduct = () => setShowAddModal(true);
  const handleCreateProduct = () => {
    setShowAddModal(false);
    navigate("/pim/products/new");
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
  const onViewChange = (viewName) => setCurrentView(viewName);
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
            filterable={{ ui: (props) => filterInput(props, "Product") }}
          />
        );
      case "sku":
        return (
          <Column
            {...commonProps}
            filterable={{ ui: (props) => filterInput(props, "SKU") }}
          />
        );
      case "categoryInfo":
        return (
          <Column
            {...commonProps}
            cell={categoryCell}
            filterable={{
              ui: (props) =>
                filterInput(
                  props,
                  "Category",
                  "select",
                  filterOptions.categories
                ),
            }}
          />
        );
      case "brand":
        return (
          <Column
            {...commonProps}
            filterable={{
              ui: (props) =>
                filterInput(props, "Brand", "select", filterOptions.brands),
            }}
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
              ui: (props) =>
                filterInput(props, "Completeness", "select", [
                  "high",
                  "medium",
                  "low",
                ]),
            }}
          />
        );
      case "lastModified":
        return (
          <Column
            {...commonProps}
            filterable={{ ui: (props) => filterInput(props, "Date", "date") }}
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

  const gridRef = useRef();
  const pdfExportComponent = useRef(null);

  const handlePdfExport = () => {
    if (pdfExportComponent?.current) {
      pdfExportComponent.current.save();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <style jsx>{`
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
              { icon: Download, text: "Import" },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <btn.icon className="h-4 w-4" /> {btn.text}
              </button>
            ))}
          <ExportButton
            data={processedProducts}
            columns={currentViewColumns}
            gridRef={gridRef}
            fileName="ProductCatalog"
            pdfExportComponent={pdfExportComponent}
          />
        </div>
      </div>
      <ProductStatsCards />
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        clearFilters={clearFilters}
        currentView={currentView}
        onViewChange={onViewChange}
        views={views}
        onOpenViewManagement={() => setShowViewManagementModal(true)}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredProducts.length} of {mockProducts.length} products
        </span>
        <div className="flex items-center gap-4">
          <span>
            Current View: <strong>{currentView}</strong>
          </span>
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span>
              {Object.values(filters).filter(Boolean).length} filter(s) applied
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Products</h3>
            {selectedProducts.length > 0 && (
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Bulk Edit ({selectedProducts.length})
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Sync Selected
                </button>
              </div>
            )}
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
            paperSize={{ width: '2000px', height: '1400px' }}
            landscape={true}
          >
            <Grid 
              ref={gridRef}
              style={{ height: "600px", border: "none" }}
              data={processedData}
              filterable={true}
              sortable={true}
              groupable={true}
              filter={gridFilter}
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
        currentView={currentView}
        views={views}
        onViewChange={onViewChange}
        onViewsUpdate={onViewsUpdate}
      />
    </div>
  );
};

export default ProductCatalogPage;
