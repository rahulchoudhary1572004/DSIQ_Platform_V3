import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Edit, Save, Settings, Check, X, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react"
import FieldMappingTab from "./FieldMappingTab"
import RelationshipEditor from "./RelationshipEditor"

const ProductEditor = ({
  viewTemplates,
  productData: initialProductData,
  picklistOptions,
  activeViewId,
  onSave,
  onCancel,
  onConfigure,
  isEditMode,
  productId,
  pageTitle,
  onShowVersionHistory,
}) => {
  const navigate = useNavigate()
  const [productData, setProductData] = useState(initialProductData)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState({})
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingSku, setEditingSku] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const [tempSku, setTempSku] = useState("")
  const [currentTab, setCurrentTab] = useState("product")

  const currentViewTemplate = viewTemplates.find((v) => v.id === activeViewId) || viewTemplates[0]

  useEffect(() => {
    const initialExpanded = {}
    currentViewTemplate.sections.forEach((section) => {
      initialExpanded[section.id] = true
    })
    setExpandedSections(initialExpanded)
    setTempTitle(productData[1]?.toString() || "")
    setTempSku(productData[2]?.toString() || "")
  }, [currentViewTemplate, productData])

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

  const updateProductData = (attributeId, newValue) => {
    if (!isEditMode) return
    setProductData((prev) => ({
      ...prev,
      [attributeId]: newValue,
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

  const handleSave = () => {
    onSave(productData)
  }

  const renderAttributeInput = (attribute) => {
    const baseClasses = `w-full h-auto px-3 py-2 border border-gray-300 rounded-md transition-colors ${
      isEditMode ? "focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" : "bg-gray-50 cursor-not-allowed"
    }`
    const value = productData[attribute.id] || ""

    switch (attribute.type) {
      case "Boolean":
        return (
          <div className="flex items-center gap-2 h-7">
            <label className="relative inline-flex items-center cursor-pointer w-9 h-5">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => updateProductData(attribute.id, e.target.checked)}
                className="sr-only peer"
                disabled={!isEditMode}
                aria-label={attribute.name}
                title={attribute.name}
              />
              <div className="w-full h-full bg-gray-200 rounded-full peer-checked:bg-brand-primary peer-focus:ring-2 peer-focus:ring-brand-light transition-colors duration-200"></div>
              <div className="absolute left-[1.6px] top-[1.6px] w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-4"></div>
            </label>
            <span className="text-xs font-medium text-gray-700">{value ? "Yes" : "No"}</span>
          </div>
        )
      case "Picklist":
        return (
          <select
            value={value.toString()}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            disabled={!isEditMode}
            aria-label={attribute.name}
            title={attribute.name}
          >
            <option value="">Select an option</option>
            {(picklistOptions[attribute.id] || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      case "Number":
        return (
          <input
            type="number"
            value={value.toString()}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            step="any"
            disabled={!isEditMode}
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
      case "Date":
        return (
          <input
            type="date"
            value={value.toString()}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            disabled={!isEditMode}
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
      case "Text":
        return (
          <textarea
            value={value.toString()}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={`${baseClasses} h-20 resize-none`}
            rows={3}
            disabled={!isEditMode}
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
      case "Rich Text":
        return (
          <textarea
            value={value.toString()}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={`${baseClasses} h-26 resize-none`}
            rows={5}
            placeholder="Enter rich text content..."
            disabled={!isEditMode}
          />
        )
      default:
        return (
          <input
            type="text"
            value={value.toString()}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            disabled={!isEditMode}
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Catalog
              </button>
            </div>
            <div className="mb-2">
              {editingTitle && isEditMode ? (
                <div className="flex items-center gap-2">
                  <input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-2xl font-bold border-2 border-[#DD522C] px-3 py-2 rounded-md focus:outline-none"
                    autoFocus
                    aria-label="Product title"
                    title="Product title"
                  />
                  <button
                    onClick={() => {
                      updateProductData(1, tempTitle)
                      setEditingTitle(false)
                    }}
                    className="flex items-center justify-center h-8 w-8 p-0 bg-brand-primary text-white rounded-md hover:bg-brand-hover transition-colors"
                    aria-label="Save title"
                    title="Save title"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTempTitle(productData[1]?.toString() || "")
                      setEditingTitle(false)
                    }}
                    className="flex items-center justify-center h-8 w-8 p-0 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    aria-label="Cancel title edit"
                    title="Cancel title edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {productData[1] || (productId ? `Product ${productId}` : "New Product")}
                  </h1>
                  {isEditMode && (
                    <button
                      onClick={() => {
                        setEditingTitle(true)
                        setTempTitle(productData[1]?.toString() || "")
                      }}
                      className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-100 rounded-md"
                      aria-label="Edit product title"
                      title="Edit product title"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-5 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">SKU:</span>
                {editingSku && isEditMode ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={tempSku}
                      onChange={(e) => setTempSku(e.target.value)}
                      className="h-6 px-2 border border-brand-primary rounded-md focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateProductData(2, tempSku)
                          setEditingSku(false)
                        }
                        if (e.key === "Escape") {
                          setTempSku(productData[2]?.toString() || "")
                          setEditingSku(false)
                        }
                      }}
                      autoFocus
                      aria-label="Product SKU"
                      title="Product SKU"
                    />
                    <button
                      onClick={() => {
                        updateProductData(2, tempSku)
                        setEditingSku(false)
                      }}
                      className="flex items-center justify-center h-6 w-6 p-0 bg-brand-primary text-white rounded-md hover:bg-brand-hover transition-colors"
                      aria-label="Save SKU"
                      title="Save SKU"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setTempSku(productData[2]?.toString() || "")
                        setEditingSku(false)
                      }}
                      className="flex items-center justify-center h-6 w-6 p-0 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      aria-label="Cancel SKU edit"
                      title="Cancel SKU edit"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className="font-semibold">{productData[2] || "No SKU"}</span>
                    {isEditMode && (
                      <button
                        onClick={() => {
                          setEditingSku(true)
                          setTempSku(productData[2]?.toString() || "")
                        }}
                        className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-100 rounded-md"
                        aria-label="Edit SKU"
                        title="Edit SKU"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-gray-400">•</span>
              <span>
                {productId ? "Editing existing product" : "Creating new product"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onConfigure}
              className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors font-medium"
            >
              <Settings className="w-3 h-3" />
              Configure
            </button>
            {isEditMode && onShowVersionHistory && (
              <button
                onClick={onShowVersionHistory}
                className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors font-medium"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 3v12a6 6 0 0012 0V3"/><path d="M6 9h12"/></svg>
                Version History
              </button>
            )}
            {isEditMode && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-hover focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            )}
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
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Product Details
          </button>
          <button
            onClick={() => setCurrentTab("fieldMapping")}
            className={`px-6 py-3 font-medium text-sm ${
              currentTab === "fieldMapping"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Field Mapping
          </button>
          <button
            onClick={() => setCurrentTab("relationships")}
            className={`px-6 py-3 font-medium text-sm ${
              currentTab === "relationships"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Relationships
          </button>
          </div>
        </div>

      {/* Content based on selected tab */}
      <div className="flex-1 overflow-y-auto">
        {currentTab === "product" && (
          <div className="flex w-full">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
              <div className="p-5 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900 mb-5">Product Sections</h1>
                <div className="relative mb-3">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search sections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
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
                        className="w-full p-3 text-left hover:bg-brand-light flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-gray-900 truncate">{section.title}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-brand-light text-brand-primary rounded-full font-medium">
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
              <div className="p-6">
                <div className="space-y-6">
                  {filteredSections.map((section) => (
                    <div key={section.id} id={`section-${section.id}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                          <span className="text-xs px-2.5 py-1 bg-brand-light text-brand-primary rounded-full font-medium">
                            {section.attributes.length} fields
                          </span>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections[section.id] ? "rotate-90" : ""}`}
                        />
                      </button>
                      {expandedSections[section.id] && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.attributes.map((attribute) => (
                              <div
                                key={attribute.id}
                                className={`${attribute.type === "Rich Text" ? "md:col-span-2" : ""}`}
                              >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {attribute.name}
                                  {attribute.required && <span className="text-red-500 ml-0.8">*</span>}
                                </label>
                                {renderAttributeInput(attribute)}
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

        {currentTab === "fieldMapping" && (
          <FieldMappingTab
            viewTemplates={viewTemplates}
            activeViewId={activeViewId}
            productData={productData}
            isReadOnly={!isEditMode}
            onSave={(mappings) => console.log("Saving field mappings:", mappings)}
          />
        )}

        {currentTab === "relationships" && (
          <RelationshipEditor
            productId={productId}
            productData={productData}
            onSave={(relationships) => console.log("Saving relationships:", relationships)}
            onCancel={() => setCurrentTab("product")}
          />
        )}
      </div>
    </div>
  )
}

export default ProductEditor
