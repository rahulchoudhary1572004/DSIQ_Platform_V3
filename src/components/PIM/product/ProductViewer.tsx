"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Edit,
  Settings,
  Check,
  Layers,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  ArrowLeft,
} from "lucide-react"
import ProductVersionHistory from "./ProductVersionHistory"
import FieldMapping from "./FieldMapping"
import ProductRelationshipsTab from "./ProductRelationshipsTab"
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid"
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs"

const ProductViewer = ({
  viewTemplates,
  productData,
  picklistOptions,
  activeViewId,
  onEdit,
  onBack,
  onConfigure,
  productId,
}) => {
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState("product")
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState({})
  const [showViewDropdown, setShowViewDropdown] = useState(false)
  const [fieldMappings, setFieldMappings] = useState({})
  const [syndPage, setSyndPage] = useState({ skip: 0, take: 10 })

  const currentViewTemplate = viewTemplates.find((v) => v.id === activeViewId) || viewTemplates[0]

  useEffect(() => {
    const initialExpanded = {}
    currentViewTemplate.sections.forEach((section) => {
      initialExpanded[section.id] = true
    })
    setExpandedSections(initialExpanded)
  }, [currentViewTemplate, productData])

  const handleMappingChange = (newMappings) => {
    setFieldMappings(newMappings)
  }

  const handleSaveMappings = (mappings) => {
    console.log("Saving field mappings:", mappings)
    // Here you would typically save to backend
    // For now, just log the mappings
  }

  const filteredSections = currentViewTemplate.sections
    .filter(
      (section) =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.attributes.some(
          (attr) =>
            attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (productData[attr.id] && productData[attr.id].toString().toLowerCase().includes(searchTerm.toLowerCase())),
        ),
    )
    .sort((a, b) => a.order - b.order)

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleViewChange = (viewId) => {
    const currentPath = window.location.pathname
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("view", viewId)
    navigate(`${currentPath}?${searchParams.toString()}`)
  }

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(`section-${sectionId}`)
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const renderAttributeDisplay = (attribute) => {
    const value = productData[attribute.id] || ""

    switch (attribute.type) {
      case "Boolean":
        return (
          <div className="flex items-center gap-2 h-7">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {value ? "Yes" : "No"}
            </span>
          </div>
        )
      case "Picklist":
        return (
          <div className="text-sm text-gray-900">
            {value || <span className="text-gray-400 italic">Not selected</span>}
          </div>
        )
      case "Number":
        return (
          <div className="text-sm text-gray-900">{value || <span className="text-gray-400 italic">Not set</span>}</div>
        )
      case "Date":
        return (
          <div className="text-sm text-gray-900">
            {value ? (
              new Date(value.toString()).toLocaleDateString()
            ) : (
              <span className="text-gray-400 italic">Not set</span>
            )}
          </div>
        )
      case "Text":
      case "Rich Text":
        return (
          <div className="text-sm text-gray-900 whitespace-pre-wrap">
            {value || <span className="text-gray-400 italic">No content</span>}
          </div>
        )
      default:
        return (
          <div className="text-sm text-gray-900">{value || <span className="text-gray-400 italic">Not set</span>}</div>
        )
    }
  }

  // Mock syndication data and color mapping (adapted from Syndication.jsx)
  const syndicationRows = [
    {
      channel: "Amazon",
      status: "Success",
      lastSync: "2024-01-15 10:30",
      message: "Successfully synced",
    },
    {
      channel: "Walmart",
      status: "Failed",
      lastSync: "2024-01-15 09:15",
      message: "Missing required field: brand_name",
    },
    {
      channel: "Target",
      status: "In Progress",
      lastSync: "2024-01-15 11:00",
      message: "Sync in progress",
    },
  ];
  const statusColor = {
    Success: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
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
              Try Again
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

  // Add state for paging (demo only, no real backend)
  const syndProcessedData = {
    data: syndicationRows.slice(syndPage.skip, syndPage.skip + syndPage.take),
    total: syndicationRows.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Catalog
              </button>
            </div>
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {productData[1] || (productId ? `Product ${productId}` : "Product Details")}
              </h1>
            </div>

            <div className="flex items-center gap-5 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">SKU:</span>
                <span className="font-semibold">{productData[2] || "No SKU"}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span>
                Last updated: <span className="font-medium">2 hours ago</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                <Layers className="w-3 h-3" />
                <span>{currentViewTemplate.name}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showViewDropdown && (
                <div className="absolute top-full right-0 mt-0.8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-52">
                  <div className="p-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-700">Product Views</span>
                  </div>
                  {viewTemplates.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => handleViewChange(view.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          {view.name}
                          {view.isDefault && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                              Default
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.8">{view.description}</span>
                      </div>
                      {activeViewId === view.id && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={() => navigate("/pim/views")}
                      className="w-full flex items-center gap-2 px-2 py-1.6 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      Manage All Views
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onConfigure}
              className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
            >
              <Settings className="w-3 h-3" />
              Configure
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <Edit className="w-3 h-3" />
              Edit Product
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setCurrentTab("product")}
            className={`px-6 py-3 font-medium text-sm ${
              currentTab === "product"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Product Details
          </button>
          <button
            onClick={() => setCurrentTab("fieldMapping")}
            className={`px-6 py-3 font-medium text-sm ${
              currentTab === "fieldMapping"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Field Mapping
          </button>
          <button
            onClick={() => setCurrentTab("relationships")}
            className={`px-6 py-3 font-medium text-sm ${
              currentTab === "relationships"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Relationships
          </button>
          <button
            onClick={() => setCurrentTab("syndication")}
            className={`px-6 py-3 font-medium text-sm ${
              currentTab === "syndication"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Syndication Status
          </button>
          <button
            onClick={() => setCurrentTab("versionHistory")}
            className={`px-6 py-3 font-medium text-sm ${
              currentTab === "versionHistory"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Version History
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      <div className="flex-1 overflow-y-auto">
        {currentTab === "product" && (
          <div className="flex w-full">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
              <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h1 className="text-xl font-bold text-gray-900 mb-5">Product Sections</h1>
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search sections or attributes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                <p className="text-base text-gray-600 mb-3">Navigate through product information</p>

                <div className="space-y-2">
                  {filteredSections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-gray-900 truncate">{section.title}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {section.attributes.length}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Sections */}
              <div className="p-5">
                <div className="space-y-5">
                  {filteredSections.map((section) => (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-5 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-1.6 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              {expandedSections[section.id] ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                          </div>
                          <span className="text-xs px-2 py-0.8 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {section.attributes.length} fields
                          </span>
                        </div>
                      </div>

                      {expandedSections[section.id] && (
                        <div className="p-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {section.attributes.map((attribute) => (
                              <div key={attribute.id} className="space-y-1.6">
                                <label className="block text-xs font-semibold text-gray-700">
                                  {attribute.name}
                                  {attribute.required && <span className="text-red-500 ml-0.8">*</span>}
                                </label>
                                {renderAttributeDisplay(attribute)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === "syndication" && (
          <div className="p-5">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Syndication Status</h2>
                    <p className="text-gray-600">Monitor syndication status for this product</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" /> Export
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <Grid
                  style={{ height: "400px", border: "none" }}
                  data={syndProcessedData}
                  filterable={true}
                  pageable={true}
                  sortable={true}
                  skip={syndPage.skip}
                  take={syndPage.take}
                  total={syndicationRows.length}
                  onPageChange={(e) => setSyndPage(e.page)}
                  pager={MyPager}
                  className="border-none"
                >
                  <Column field="channel" title="Channel" />
                  <Column field="status" title="Status" cell={statusCell} filterable={false} />
                  <Column field="lastSync" title="Last Sync" />
                  <Column field="message" title="Message" cell={messageCell} filterable={false} />
                </Grid>
              </div>
            </div>
          </div>
        )}

        {currentTab === "versionHistory" && (
          <div className="p-5">
            <ProductVersionHistory
              product={productData}
              onClose={() => setCurrentTab("product")}
              onRestore={() => setCurrentTab("product")}
            />
          </div>
        )}

        {currentTab === "relationships" && (
          <div className="p-5">
            <ProductRelationshipsTab
              productSku={productData[2] || "No SKU"}
              productName={productData[1] || "Unknown Product"}
              availableChannels={[
                { id: 'amazon', name: 'Amazon', icon: 'A', color: '#FF9900' },
                { id: 'walmart', name: 'Walmart', icon: 'W', color: '#0071ce' },
                { id: 'target', name: 'Target', icon: 'T', color: '#CC0000' },
                { id: 'shopify', name: 'Shopify', icon: 'S', color: '#96bf48' },
              ]}
              relationTypes={[
                { id: 'bundles', name: 'Bundles / Kits', custom: false },
                { id: 'accessories', name: 'Accessories', custom: false },
                { id: 'replacement-parts', name: 'Replacement Parts', custom: false },
                { id: 'upsells', name: 'Upsells', custom: false },
                { id: 'cross-sells', name: 'Cross-sells', custom: false },
                { id: 'variants', name: 'Variants', custom: false },
                { id: 'substitutes', name: 'Substitutes', custom: false },
                { id: 'styled-with', name: 'Styled With', custom: true },
              ]}
              onAddRelationship={(relationship) => {
                console.log('Adding relationship:', relationship);
                // TODO: Implement API call to add relationship
              }}
              onRemoveRelationship={(relationshipId, relationType) => {
                console.log('Removing relationship:', relationshipId, relationType);
                // TODO: Implement API call to remove relationship
              }}
              onUpdateRelationship={(relationshipId, updates) => {
                console.log('Updating relationship:', relationshipId, updates);
                // TODO: Implement API call to update relationship
              }}
            />
          </div>
        )}

        {currentTab === "fieldMapping" && (
          <FieldMapping
            viewTemplates={viewTemplates}
            activeViewId={activeViewId}
            productData={productData}
            onMappingChange={handleMappingChange}
            onSaveMappings={handleSaveMappings}
            isReadOnly={false}
          />
        )}
      </div>
    </div>
  )
}

export default ProductViewer
