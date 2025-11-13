import React, { useState, useMemo, useCallback, useRef } from "react";
import { RefreshCw, Download, Search, Package, MapPin, CheckCircle, XCircle, Clock, Settings, Plus, Filter, ArrowRight } from "lucide-react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs";
import { process } from "@progress/kendo-data-query";
import { useNavigate } from "react-router-dom";
import ExportButton from '../../../helper_Functions/Export';
import { useProductData } from "../../context/ProductDataContext";

const mockStats = {
  total: 4,
  success: 2,
  failed: 1,
  inProgress: 1,
  ready: 8,
  notReady: 3,
};

const mockRows = [
  {
    product: "Wireless Bluetooth Headphones",
    retailer: "Amazon",
    status: "Success",
    lastSync: "2024-01-15 10:30",
    message: "Successfully synced",
  },
  {
    product: "Organic Cotton T-Shirt",
    retailer: "Walmart",
    status: "Failed",
    lastSync: "2024-01-15 09:15",
    message: "Missing required field: brand_name",
  },
  {
    product: "Eco Water Bottle",
    retailer: "Target",
    status: "In Progress",
    lastSync: "2024-01-15 08:45",
    message: "Syncing...",
  },
  {
    product: "Yoga Mat Pro",
    retailer: "Shopify",
    status: "Success",
    lastSync: "2024-01-14 17:20",
    message: "Successfully synced",
  },
];

const statusColor = {
  Success: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
  "In Progress": "bg-amber-100 text-amber-800",
};

const statusCell = (props) => {
  const value = props.dataItem.status;
  const { status } = props.dataItem;
  return (
    <td className="flex justify-between">
      <span
        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusColor[value] || "bg-gray-100 text-gray-800"
        }`}
      >
        {value}
      </span>
      {status === "Failed" && (
        <div className="inline-flex">
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      )}
    </td>
  );
};

const messageCell = (props) => {
  const { message } = props.dataItem;
  return (
    <td className="align-top">
      <div>{message}</div>
    </td>
  );
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

export default function Syndication() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [gridPage, setGridPage] = useState({ skip: 0, take: 10 });
  const [gridFilter, setGridFilter] = useState<any>({ logic: "and", filters: [] });
  const [activeTab, setActiveTab] = useState("status"); // status, readiness, templates
  const gridRef = useRef<any>(null);
  
  const { fieldMappingTemplates } = useProductData();

  const filteredRows = useMemo(() => {
    return mockRows.filter((row) => {
      const matchesSearch =
        row.product.toLowerCase().includes(search.toLowerCase()) ||
        row.retailer.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || row.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const processedData = useMemo(() => {
    return process(filteredRows, {
      filter: gridFilter,
      skip: gridPage.skip,
      take: gridPage.take,
    });
  }, [filteredRows, gridFilter, gridPage]);

  // Define columns for export
  const columns = [
    { field: 'product', title: 'Product' },
    { field: 'retailer', title: 'Retailer' },
    { field: 'status', title: 'Status' },
    { field: 'lastSync', title: 'Last Sync' },
    { field: 'message', title: 'Message' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Syndication</h1>
          <p className="text-sm text-gray-600">
            Manage product syndication workflow: configure field mappings, monitor readiness, and track syndication status across all retailers.
          </p>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("status")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "status"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Syndication Status
              </div>
            </button>
            <button
              onClick={() => setActiveTab("readiness")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "readiness"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Product Readiness
              </div>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "templates"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Field Mapping Templates
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "status" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900">
                  {mockStats.total}
                </div>
                <div className="text-sm text-gray-500">Total Syncs</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-green-600">
                  {mockStats.success}
                </div>
                <div className="text-sm text-gray-500">Successful</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-red-600">
                  {mockStats.failed}
                </div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-amber-600">
                  {mockStats.inProgress}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
            </div>

            {/* Filter/Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products or retailers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                {["All", "Success", "Failed", "In Progress"].map((f) => (
                  <button
                    key={f}
                    className={`px-4 py-2 rounded-md border ${
                      filter === f ? "bg-gray-900 text-white" : "border-gray-300"
                    } text-sm`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <ExportButton
                  data={filteredRows}
                  columns={columns}
                  gridRef={gridRef}
                  fileName="Syndication"
                />
              </div>
            </div>

            {/* Kendo Data Grid */}
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              <Grid
                ref={gridRef}
                style={{ height: "500px", border: "none" }}
                data={processedData}
                filterable={true}
                pageable={true}
                sortable={true}
                filter={gridFilter}
                onFilterChange={(e) => setGridFilter(e.filter)}
                skip={gridPage.skip}
                take={gridPage.take}
                total={filteredRows.length}
                onPageChange={(e) => setGridPage(e.page)}
                pager={MyPager}
                className="border-none"
              >
                <Column field="product" title="Product" />
                <Column field="retailer" title="Retailer" />
                <Column
                  field="status"
                  title="Status"
                  cell={statusCell}
                  filterable={false}
                />
                <Column field="lastSync" title="Last Sync" />
                <Column
                  field="message"
                  title="Message"
                  cell={messageCell}
                  filterable={false}
                />
              </Grid>
            </div>
          </>
        )}

        {activeTab === "readiness" && (
          <div>
            {/* Readiness Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{mockStats.ready}</div>
                    <div className="text-sm text-gray-500">Ready for Syndication</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{mockStats.notReady}</div>
                    <div className="text-sm text-gray-500">Not Ready</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-amber-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((mockStats.ready / (mockStats.ready + mockStats.notReady)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Overall Readiness</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Readiness Overview</h3>
              <p className="text-gray-600 mb-4">
                Monitor which products are ready for syndication to specific retailers. Products need complete field mappings and all required data to be syndicated.
              </p>
              <div className="text-center py-8 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p>Product readiness data will be displayed here</p>
                <p className="text-sm mt-2">Check which products meet retailer requirements</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Field Mapping Templates</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage field mapping templates for different retailers and categories
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate("/pim/field-mapping")}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[#DD522C] text-[#DD522C] rounded-lg hover:bg-[#FDE2CF] transition-all shadow-sm"
                >
                  <Settings className="w-4 h-4" /> Manage All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fieldMappingTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {template.category}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {template.retailers?.length || 0} retailers
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate("/pim/field-mapping")}
                      className="text-gray-400 hover:text-[#DD522C] opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Configure template"
                      title="Configure template"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  {/* Show all retailers */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Supported Retailers:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.retailers?.map((retailer) => (
                        <span key={retailer} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded capitalize border border-green-200">
                          {retailer}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                    <span>Updated: {template.lastModified}</span>
                    <span>{Object.keys(template.mappings || {}).reduce((total, retailer) => 
                      total + Object.keys(template.mappings[retailer] || {}).length, 0
                    )} total fields</span>
                  </div>
                </div>
              ))}
            </div>

            {fieldMappingTemplates.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Field Mapping Templates</h3>
                <p className="text-gray-600 mb-4">Create templates to standardize field mappings across products</p>
                <button 
                  onClick={() => navigate("/pim/field-mapping")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#DD522C] text-white rounded-lg hover:bg-[#F27A56] transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" /> Go to Field Mapping
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
