"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown, Save, Plus, X, Settings, MapPin, Calculator } from "lucide-react"

const SelectionTag = ({ label, countryCode, onRemove }) => (
  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 text-sm font-medium">
    <span>{label}</span>
    {countryCode && (
      <span className="text-xs bg-blue-100 px-1.5 py-0.5 rounded text-blue-600">
        {countryCode}
      </span>
    )}
    {onRemove && (
      <button
        onClick={onRemove}
        className="ml-1 text-blue-500 hover:text-blue-700 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
)

const CalculativeFieldWizard = ({ 
  isOpen, 
  onClose, 
  onSave, 
  pimFields 
}) => {
  const [step, setStep] = useState(1)
  const [fieldName, setFieldName] = useState("")
  const [formula, setFormula] = useState("")
  const [selectedFields, setSelectedFields] = useState([])

  const handleAddField = (fieldId) => {
    if (!selectedFields.includes(fieldId)) {
      setSelectedFields([...selectedFields, fieldId])
      setFormula(prev => `${prev}${prev ? ' + ' : ''}{${fieldId}}`)
    }
  }

  const handleRemoveField = (fieldId) => {
    setSelectedFields(selectedFields.filter(id => id !== fieldId))
    setFormula(prev => prev.replace(new RegExp(`\\{${fieldId}\\}`, 'g'), ''))
  }

  const handleSave = () => {
    onSave({
      id: `calc_${Date.now()}`,
      name: fieldName,
      formula,
      isCalculative: true
    })
    onClose()
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${!isOpen && 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Create Calculative Field</h3>
        </div>
        
        <div className="p-6">
          {step === 1 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter field name"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Fields</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md">
                  {pimFields.map(field => (
                    <button
                      key={field.id}
                      onClick={() => handleAddField(field.id)}
                      className="text-left px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      {field.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Selected Fields</label>
                {selectedFields.length === 0 ? (
                  <p className="text-sm text-gray-500">No fields selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFields.map(fieldId => {
                      const field = pimFields.find(f => f.id === fieldId)
                      return (
                        <div key={fieldId} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {field?.name || fieldId}
                          <button 
                            onClick={() => handleRemoveField(fieldId)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                <textarea
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-20"
                  placeholder="Enter formula (e.g., {field1} * {field2} + 10)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use field names in curly braces. Supported operators: +, -, *, /, (, )
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!fieldName || selectedFields.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${!fieldName || selectedFields.length === 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!formula}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${!formula ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Create Field
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FieldMapping = ({
  viewTemplates = [
    {
      id: "template1",
      sections: [
        {
          attributes: [
            { id: "name", name: "Product Name", required: true },
            { id: "description", name: "Description", required: false },
            { id: "price", name: "Price", required: true },
            { id: "brand", name: "Brand", required: true },
            { id: "category", name: "Category", required: true },
            { id: "sku", name: "SKU", required: true },
            { id: "weight", name: "Weight", required: false },
            { id: "dimensions", name: "Dimensions", required: false }
          ]
        }
      ]
    }
  ],
  activeViewId = "template1",
  productData = {
    name: "Premium Auto Oil Filter Pro",
    brand: "Advance Auto Parts",
    price: "24.99",
    category: "Automotive Filters",
    sku: "AOF-PRO-2024-001",
    description: "High-performance oil filter designed for premium vehicles with advanced filtration technology",
    weight: "2.5 lbs",
    dimensions: "6x4x4 inches"
  },
  onMappingChange,
  onSaveMappings,
  isReadOnly = false,
}) => {
  const [selectedRetailers, setSelectedRetailers] = useState([])
  const [retailerSearch, setRetailerSearch] = useState("")
  const [showRetailerDropdown, setShowRetailerDropdown] = useState(false)
  const [fieldMappings, setFieldMappings] = useState({})
  const [activeRetailer, setActiveRetailer] = useState(null)
  const [customTemplateName, setCustomTemplateName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState({})
  const [mappingTemplates, setMappingTemplates] = useState({})
  const [selectedRetailerCategories, setSelectedRetailerCategories] = useState({})
  const [showCalculativeWizard, setShowCalculativeWizard] = useState(false)
  const [calculativeFields, setCalculativeFields] = useState([])
  const [currentDropdownRetailerField, setCurrentDropdownRetailerField] = useState(null)

  const currentViewTemplate = viewTemplates.find((v) => v.id === activeViewId) || viewTemplates[0]
  const allPimFields = [...currentViewTemplate.sections.flatMap(s => s.attributes), ...calculativeFields]

  const [retailerOptions] = useState([
    { id: "amazon", name: "Amazon", country: "USA", country_iso3: "US" },
    { id: "walmart", name: "Walmart", country: "USA", country_iso3: "US" },
    { id: "target", name: "Target", country: "USA", country_iso3: "US" },
    { id: "ebay", name: "eBay", country: "USA", country_iso3: "US" },
    { id: "etsy", name: "Etsy", country: "USA", country_iso3: "US" },
  ])

  const dummyRetailerCategories = {
    Amazon: [
      { id: "electronics", name: "Electronics" },
      { id: "automotive", name: "Automotive" },
      { id: "fashion", name: "Fashion" },
      { id: "books", name: "Books" },
    ],
    Walmart: [
      { id: "automotive", name: "Automotive" },
      { id: "groceries", name: "Groceries" },
      { id: "clothing", name: "Clothing" },
      { id: "toys", name: "Toys" },
    ],
    Target: [
      { id: "automotive", name: "Automotive" },
      { id: "home", name: "Home" },
      { id: "beauty", name: "Beauty" },
      { id: "electronics", name: "Electronics" },
    ],
    eBay: [
      { id: "automotive", name: "Automotive" },
      { id: "collectibles", name: "Collectibles" },
      { id: "motors", name: "Motors" },
      { id: "fashion", name: "Fashion" },
    ],
    Etsy: [
      { id: "automotive", name: "Automotive" },
      { id: "handmade", name: "Handmade" },
      { id: "vintage", name: "Vintage" },
      { id: "crafts", name: "Crafts" },
    ],
  }

  const dummyCategoryFields = {
    Amazon: {
      automotive: [
        { id: "title", name: "Product Title" },
        { id: "brand", name: "Brand Name" },
        { id: "description", name: "Product Description" },
        { id: "price", name: "Price" },
        { id: "part_number", name: "Part Number" },
        { id: "vehicle_fit", name: "Vehicle Compatibility" },
        { id: "weight", name: "Item Weight" },
        { id: "dimensions", name: "Package Dimensions" },
      ],
      electronics: [
        { id: "title", name: "Product Title" },
        { id: "brand", name: "Brand Name" },
        { id: "model", name: "Model Number" },
        { id: "price", name: "Price" },
        { id: "warranty", name: "Warranty" },
      ],
    },
    Walmart: {
      automotive: [
        { id: "name", name: "Item Name" },
        { id: "brand", name: "Brand" },
        { id: "description", name: "Item Description" },
        { id: "price", name: "Price" },
        { id: "sku", name: "SKU" },
        { id: "weight", name: "Weight" },
        { id: "vehicle_type", name: "Vehicle Type" },
      ],
    },
    Target: {
      automotive: [
        { id: "title", name: "Product Title" },
        { id: "brand", name: "Brand" },
        { id: "description", name: "Description" },
        { id: "price", name: "Price" },
        { id: "upc", name: "UPC" },
        { id: "category", name: "Category" },
      ],
    },
    eBay: {
      automotive: [
        { id: "title", name: "Listing Title" },
        { id: "brand", name: "Brand" },
        { id: "description", name: "Description" },
        { id: "price", name: "Price" },
        { id: "condition", name: "Condition" },
        { id: "part_number", name: "Manufacturer Part Number" },
      ],
    },
    Etsy: {
      automotive: [
        { id: "title", name: "Listing Title" },
        { id: "description", name: "Description" },
        { id: "price", name: "Price" },
        { id: "tags", name: "Tags" },
        { id: "materials", name: "Materials" },
      ],
    },
  }

  const getRetailerName = (id) => {
    const r = retailerOptions.find((r) => r.id === id)
    return r ? r.name : id
  }

  const handleRetailerSelect = (retailerId) => {
    setSelectedRetailers((prev) =>
      prev.includes(retailerId) ? prev.filter((id) => id !== retailerId) : [...prev, retailerId]
    )
    if (!activeRetailer || activeRetailer !== retailerId) setActiveRetailer(retailerId)
    setShowRetailerDropdown(false)
    setRetailerSearch("")
  }

  const handleRemoveRetailer = (retailerId) => {
    setSelectedRetailers((prev) => prev.filter((id) => id !== retailerId))
    setFieldMappings((prev) => {
      const newMap = { ...prev }
      delete newMap[retailerId]
      return newMap
    })
    if (activeRetailer === retailerId) {
      const remaining = selectedRetailers.filter(id => id !== retailerId)
      setActiveRetailer(remaining[0] || null)
    }
  }

  const handleMappingChange = (retailerId, retailerFieldId, pimFieldId) => {
    const newMappings = {
      ...fieldMappings,
      [retailerId]: {
        ...(fieldMappings[retailerId] || {}),
        [retailerFieldId]: pimFieldId,
      },
    }
    setFieldMappings(newMappings)
    
    if (onMappingChange) {
      onMappingChange(newMappings)
    }
  }

  const handleSaveMappings = () => {
    if (onSaveMappings) {
      onSaveMappings(fieldMappings)
    }
  }

  const filteredRetailers = retailerOptions.filter(
    (r) =>
      r.name.toLowerCase().includes(retailerSearch.toLowerCase()) &&
      !selectedRetailers.includes(r.id)
  )

  const getMappedPIMFields = (retailerId, pimFieldId) => {
    if (!fieldMappings[retailerId]) return []
    
    return Object.entries(fieldMappings[retailerId])
      .filter(([key, value]) => value === pimFieldId)
      .map(([key]) => key)
  }

  const handleAddCalculativeField = (newField) => {
    setCalculativeFields([...calculativeFields, newField])
    setShowCalculativeWizard(false)
  }

  const calculateFieldValue = (field) => {
    if (!field.formula) return ""
    
    // This is a simplified calculation - in a real app you'd need a proper formula parser
    try {
      let result = field.formula
      for (const f of allPimFields) {
        if (field.formula.includes(`{${f.id}}`)) {
          result = result.replace(new RegExp(`\\{${f.id}\\}`, 'g'), productData[f.id] || '0')
        }
      }
      return eval(result) // Note: Using eval is generally unsafe - use a proper expression evaluator in production
    } catch (e) {
      return "Error in calculation"
    }
  }

  const getProductValue = (fieldId) => {
    if (fieldId.startsWith('calc_')) {
      const calcField = calculativeFields.find(f => f.id === fieldId)
      return calcField ? calculateFieldValue(calcField) : ""
    }
    return productData[fieldId] || ""
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculativeFieldWizard
        isOpen={showCalculativeWizard}
        onClose={() => setShowCalculativeWizard(false)}
        onSave={handleAddCalculativeField}
        pimFields={currentViewTemplate.sections.flatMap(s => s.attributes)}
      />
      
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Field Mapping</h1>
              <p className="mt-1 text-sm text-gray-600">
                Configure field mappings between your PIM system and retailer platforms
                {isReadOnly && <span className="text-amber-600 font-medium ml-2">(Read-only)</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                Configure
              </button>
              {!isReadOnly && (
                <button 
                  onClick={handleSaveMappings}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Mappings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Retailer Selection
            </h2>
          </div>
          
          <div className="p-6">
            {selectedRetailers.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedRetailers.map((retailerId) => {
                    const retailer = retailerOptions.find((r) => r.id === retailerId)
                    return (
                      <SelectionTag
                        key={retailerId}
                        label={retailer?.name || retailerId}
                        countryCode={retailer?.country_iso3}
                        onRemove={isReadOnly ? undefined : () => handleRemoveRetailer(retailerId)}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {!isReadOnly && (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search and select retailers..."
                    value={retailerSearch}
                    onChange={(e) => setRetailerSearch(e.target.value)}
                    onFocus={() => setShowRetailerDropdown(true)}
                    className="w-full max-w-md pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                {showRetailerDropdown && filteredRetailers.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="max-h-60 overflow-y-auto">
                      {filteredRetailers.map((retailer) => (
                        <button
                          key={retailer.id}
                          onClick={() => handleRetailerSelect(retailer.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{retailer.name}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {retailer.country}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedRetailers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-0" aria-label="Tabs">
                {selectedRetailers.map((retailerId) => (
                  <button
                    key={retailerId}
                    onClick={() => setActiveRetailer(retailerId)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeRetailer === retailerId
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {getRetailerName(retailerId)}
                  </button>
                ))}
              </nav>
            </div>

            {activeRetailer && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {getRetailerName(activeRetailer)} Field Mapping
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Category:</label>
                      <div className="relative">
                        <select
                          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={selectedRetailerCategories[activeRetailer] || ""}
                          onChange={e => {
                            setSelectedRetailerCategories(prev => ({
                              ...prev,
                              [activeRetailer]: e.target.value
                            }))
                          }}
                        >
                          <option value="">Select category</option>
                          {(dummyRetailerCategories[getRetailerName(activeRetailer)] || []).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">Template:</label>
                        <div className="relative">
                          <select
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedTemplate[activeRetailer] ?? ""}
                            onChange={(e) => {
                              // Handle template change logic here
                            }}
                          >
                            <option value="">New Mapping</option>
                            <option value="automotive-basic">Automotive - Basic</option>
                            <option value="automotive-advanced">Automotive - Advanced</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Template name"
                          value={customTemplateName}
                          onChange={(e) => setCustomTemplateName(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                          disabled={!customTemplateName.trim()}
                        >
                          <Plus className="w-4 h-4" />
                          Save Template
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {getRetailerName(activeRetailer)} Field
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            PIM Field
                          </th>
                          {!isReadOnly && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Current Value
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRetailerCategories[activeRetailer] && dummyCategoryFields[getRetailerName(activeRetailer)]?.[selectedRetailerCategories[activeRetailer]]?.map((retailerField) => (
                          <tr key={retailerField.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  {retailerField.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="relative">
                                <select
                                  className={`w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""
                                  }`}
                                  value={fieldMappings[activeRetailer]?.[retailerField.id] || ""}
                                  onChange={(e) =>
                                    handleMappingChange(
                                      activeRetailer,
                                      retailerField.id,
                                      e.target.value
                                    )
                                  }
                                  disabled={isReadOnly}
                                >
                                  <option value="">Select PIM field</option>
                                  {allPimFields.map(attr => (
                                    <option 
                                      key={attr.id} 
                                      value={attr.id}
                                      disabled={getMappedPIMFields(activeRetailer, attr.id).length > 0 && fieldMappings[activeRetailer]?.[retailerField.id] !== attr.id}
                                    >
                                      {attr.name}
                                      {attr.isCalculative && " (calculated)"}
                                      {getMappedPIMFields(activeRetailer, attr.id).length > 0 && fieldMappings[activeRetailer]?.[retailerField.id] !== attr.id && " (already mapped)"}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                {!isReadOnly && (
                                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                    <button
                                      onClick={() => {
                                        setCurrentDropdownRetailerField(retailerField.id)
                                        setShowCalculativeWizard(true)
                                      }}
                                      className="text-gray-400 hover:text-blue-500 transition-colors"
                                      title="Create calculative field"
                                    >
                                      <Calculator className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            {!isReadOnly && (
                              <td className="px-6 py-4">
                                <div className="max-w-xs">
                                  {fieldMappings[activeRetailer]?.[retailerField.id] ? (
                                    <span className="text-sm text-gray-900 truncate block">
                                      {getProductValue(fieldMappings[activeRetailer][retailerField.id])}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-400 italic">No mapping</span>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FieldMapping