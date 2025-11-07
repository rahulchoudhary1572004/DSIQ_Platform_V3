"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Save,
  ChevronDown,
  ChevronRight,
  Layers,
  Settings,
  Check,
  X,
  GripVertical,
} from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

const EnhancedProductDetailPage = () => {
  // View templates
  const [viewTemplates, setViewTemplates] = useState([
    {
      id: "default",
      name: "Default View",
      description: "Complete product details for internal use",
      isDefault: true,
      sections: [
        {
          id: "product-details",
          title: "Product Details",
          order: 0,
          attributes: [
            { id: 1, name: "Product Name", type: "String", required: true },
            { id: 2, name: "SKU", type: "String", required: true },
            { id: 3, name: "Brand", type: "Picklist", required: true },
            { id: 4, name: "Category", type: "Picklist", required: true },
            { id: 5, name: "Price", type: "Number", required: true },
            { id: 6, name: "Weight (lbs)", type: "Number", required: false },
            { id: 7, name: "Is Available", type: "Boolean", required: false },
            { id: 20, name: "Launch Date", type: "Date", required: false },
          ],
        },
        {
          id: "images",
          title: "Images",
          order: 1,
          attributes: [
            {
              id: 8,
              name: "Primary Image URL",
              type: "String",
              required: true,
            },
            { id: 9, name: "Gallery Images", type: "Text", required: false },
            { id: 10, name: "Image Alt Text", type: "String", required: false },
          ],
        },
        {
          id: "warranty",
          title: "Warranty",
          order: 2,
          attributes: [
            {
              id: 11,
              name: "Warranty Period (months)",
              type: "Number",
              required: true,
            },
            { id: 12, name: "Warranty Type", type: "Picklist", required: true },
            {
              id: 13,
              name: "Warranty Coverage",
              type: "Rich Text",
              required: false,
            },
          ],
        },
      ],
    },
    {
      id: "customer",
      name: "Customer View",
      description: "Simplified view for customer-facing applications",
      isDefault: false,
      sections: [
        {
          id: "product-details",
          title: "Product Details",
          order: 0,
          attributes: [
            { id: 1, name: "Product Name", type: "String", required: true },
            { id: 3, name: "Brand", type: "Picklist", required: true },
            { id: 5, name: "Price", type: "Number", required: true },
            { id: 7, name: "Is Available", type: "Boolean", required: false },
          ],
        },
        {
          id: "images",
          title: "Images",
          order: 1,
          attributes: [
            {
              id: 8,
              name: "Primary Image URL",
              type: "String",
              required: true,
            },
          ],
        },
      ],
    },
  ])

  // Product data
  const [productData, setProductData] = useState({
    1: "Premium Auto Oil Filter",
    2: "AOF-2024-001",
    3: "Advance Auto Parts",
    4: "Filters",
    5: "24.99",
    6: "0.8",
    7: true,
    8: "https://example.com/image1.jpg",
    9: "Image URLs separated by commas",
    10: "Premium Oil Filter",
    11: "12",
    12: "Limited",
    13: "Covers manufacturing defects and material failures",
    20: "2024-01-15",
  })

  // Picklist options
  const [picklistOptions, setPicklistOptions] = useState({
    3: ["Advance Auto Parts", "Bosch", "K&N", "Fram"],
    4: ["Filters", "Fluids", "Parts", "Accessories"],
    12: ["Limited", "Full", "Extended"],
  })

  const [activeViewId, setActiveViewId] = useState("default")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState({})
  const [showPicklistDialog, setShowPicklistDialog] = useState(false)
  const [currentPicklistField, setCurrentPicklistField] = useState(null)
  const [newOption, setNewOption] = useState("")
  const [isConfigMode, setIsConfigMode] = useState(false)
  const [showViewDropdown, setShowViewDropdown] = useState(false)

  // Inline editing states
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingSku, setEditingSku] = useState(false)
  const [tempTitle, setTempTitle] = useState("")
  const [tempSku, setTempSku] = useState("")

  // Get current view template
  const currentViewTemplate = viewTemplates.find((v) => v.id === activeViewId) || viewTemplates[0]

  // Initialize expanded sections and inline edit values
  useEffect(() => {
    const initialExpanded = {}
    currentViewTemplate.sections.forEach((section) => {
      initialExpanded[section.id] = true
    })
    setExpandedSections(initialExpanded)
    setTempTitle(productData[1] || "")
    setTempSku(productData[2] || "")
  }, [currentViewTemplate, productData])

  // Filter sections based on search
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
    setProductData((prev) => ({
      ...prev,
      [attributeId]: newValue,
    }))
  }

  const handleViewChange = (viewId) => {
    setActiveViewId(viewId)
    setShowViewDropdown(false)
  }

  const handleTitleEdit = () => {
    setEditingTitle(true)
    setTempTitle(productData[1] || "")
  }

  const handleTitleSave = () => {
    updateProductData(1, tempTitle)
    setEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setTempTitle(productData[1] || "")
    setEditingTitle(false)
  }

  const handleSkuEdit = () => {
    setEditingSku(true)
    setTempSku(productData[2] || "")
  }

  const handleSkuSave = () => {
    updateProductData(2, tempSku)
    setEditingSku(false)
  }

  const handleSkuCancel = () => {
    setTempSku(productData[2] || "")
    setEditingSku(false)
  }

  const openPicklistOptions = (attributeId) => {
    setCurrentPicklistField(attributeId)
    setShowPicklistDialog(true)
  }

  const addPicklistOption = () => {
    if (!newOption.trim()) return

    setPicklistOptions((prev) => ({
      ...prev,
      [currentPicklistField]: [...(prev[currentPicklistField] || []), newOption.trim()],
    }))
    setNewOption("")
  }

  const removePicklistOption = (index) => {
    setPicklistOptions((prev) => ({
      ...prev,
      [currentPicklistField]: prev[currentPicklistField].filter((_, i) => i !== index),
    }))
  }

  const handlePicklistOptionDragEnd = (result) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    const options = Array.from(picklistOptions[currentPicklistField] || [])
    const [movedOption] = options.splice(sourceIndex, 1)
    options.splice(destinationIndex, 0, movedOption)

    setPicklistOptions((prev) => ({
      ...prev,
      [currentPicklistField]: options,
    }))
  }

  const handleSidebarDragEnd = (result) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    const updatedTemplate = { ...currentViewTemplate }
    const sections = [...updatedTemplate.sections]
    const [movedSection] = sections.splice(sourceIndex, 1)
    sections.splice(destinationIndex, 0, movedSection)

    const updatedSections = sections.map((section, index) => ({
      ...section,
      order: index,
    }))

    updatedTemplate.sections = updatedSections

    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  // Handle field drag and drop between sections
  const handleFieldDragEnd = (result) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceDroppableId = source.droppableId
    const destinationDroppableId = destination.droppableId

    // If dropped in the same section
    if (sourceDroppableId === destinationDroppableId) {
      const sectionId = sourceDroppableId.replace("section-", "")
      const section = currentViewTemplate.sections.find((s) => s.id === sectionId)
      if (!section) return

      const newAttributes = Array.from(section.attributes)
      const [movedAttribute] = newAttributes.splice(source.index, 1)
      newAttributes.splice(destination.index, 0, movedAttribute)

      const updatedTemplate = {
        ...currentViewTemplate,
        sections: currentViewTemplate.sections.map((s) =>
          s.id === sectionId ? { ...s, attributes: newAttributes } : s,
        ),
      }

      setViewTemplates((prev) =>
        prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
      )
    } else {
      // Moving between sections
      const sourceSectionId = sourceDroppableId.replace("section-", "")
      const destinationSectionId = destinationDroppableId.replace("section-", "")

      const sourceSection = currentViewTemplate.sections.find((s) => s.id === sourceSectionId)
      const destinationSection = currentViewTemplate.sections.find((s) => s.id === destinationSectionId)

      if (!sourceSection || !destinationSection) return

      const sourceAttributes = Array.from(sourceSection.attributes)
      const destinationAttributes = Array.from(destinationSection.attributes)

      const [movedAttribute] = sourceAttributes.splice(source.index, 1)
      destinationAttributes.splice(destination.index, 0, movedAttribute)

      const updatedTemplate = {
        ...currentViewTemplate,
        sections: currentViewTemplate.sections.map((s) => {
          if (s.id === sourceSectionId) {
            return { ...s, attributes: sourceAttributes }
          }
          if (s.id === destinationSectionId) {
            return { ...s, attributes: destinationAttributes }
          }
          return s
        }),
      }

      setViewTemplates((prev) =>
        prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
      )
    }
  }

  const updateAttribute = (sectionId, attributeId, updates) => {
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            attributes: s.attributes.map((a) => {
              if (a.id === attributeId) {
                return { ...a, ...updates }
              }
              return a
            }),
          }
        }
        return s
      }),
    }

    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const deleteAttribute = (sectionId, attributeId) => {
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              attributes: s.attributes.filter((a) => a.id !== attributeId),
            }
          : s,
      ),
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const addAttribute = (sectionId) => {
    const newAttribute = {
      id: Date.now(),
      name: "New Field",
      type: "String",
      required: false,
    }

    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId ? { ...s, attributes: [...s.attributes, newAttribute] } : s,
      ),
    }

    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const addSection = (insertIndex = null) => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      order: insertIndex !== null ? insertIndex : currentViewTemplate.sections.length,
      attributes: [],
    }

    let updatedSections
    if (insertIndex !== null) {
      // Insert at specific position
      updatedSections = [...currentViewTemplate.sections]
      updatedSections.splice(insertIndex, 0, newSection)
      // Update order for all sections after insertion
      updatedSections = updatedSections.map((section, index) => ({
        ...section,
        order: index,
      }))
    } else {
      // Add at the end
      updatedSections = [...currentViewTemplate.sections, newSection]
    }

    const updatedTemplate = {
      ...currentViewTemplate,
      sections: updatedSections,
    }

    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )

    setExpandedSections((prev) => ({ ...prev, [newSection.id]: true }))
  }

  const handleSaveChanges = () => {
    console.log("Saving product data:", productData)
    console.log("Picklist options:", picklistOptions)
    alert("Product data saved successfully!")
  }

  const deleteSection = (sectionId) => {
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.filter((s) => s.id !== sectionId),
    }

    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId)
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  const renderAttributeInput = (attribute) => {
    const baseClasses =
      "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    const value = productData[attribute.id] || ""

    switch (attribute.type) {
      case "Boolean":
        return (
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => updateProductData(attribute.id, e.target.checked)}
                className="sr-only peer"
                aria-label={attribute.name}
                title={attribute.name}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700">{value ? "Yes" : "No"}</span>
          </div>
        )
      case "Picklist":
        return (
          <div className="flex gap-2">
            <select
              value={value}
              onChange={(e) => updateProductData(attribute.id, e.target.value)}
              className={`${baseClasses} flex-1`}
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
            <button
              onClick={() => openPicklistOptions(attribute.id)}
              className="flex items-center justify-center flex-shrink-0 px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Configure picklist options"
              title="Configure picklist options"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )
      case "Number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            step="any"
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
      case "Date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
      case "Text":
        return (
          <textarea
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={`${baseClasses} h-24 resize-none`}
            rows={3}
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
      case "Rich Text":
        return (
          <textarea
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={`${baseClasses} h-32 resize-none`}
            rows={5}
            placeholder="Enter rich text content..."
          />
        )
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            aria-label={attribute.name}
            title={attribute.name}
          />
        )
    }
  }

  if (isConfigMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Configuration Sidebar */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Template Configuration</h2>
            <p className="text-sm text-gray-600 mb-4">Customize your product template structure</p>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              onClick={addSection}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <DragDropContext onDragEnd={handleSidebarDragEnd}>
              <Droppable droppableId="sidebar-sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {filteredSections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border border-gray-200 rounded-lg overflow-hidden group transition-all ${
                              snapshot.isDragging ? "shadow-lg" : "shadow-sm"
                            }`}
                          >
                            <div className="flex items-center bg-white">
                              <div
                                {...provided.dragHandleProps}
                                className="p-3 cursor-move hover:bg-gray-50 transition-colors"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </div>
                              <button
                                onClick={() => scrollToSection(section.id)}
                                className="flex-1 p-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                              >
                                <div className="flex items-center gap-3 truncate">
                                  <span className="font-medium text-gray-900 truncate">{section.title}</span>
                                </div>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                  {section.attributes.length}
                                </span>
                              </button>
                              <button
                                onClick={() => deleteSection(section.id)}
                                className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mr-3 h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                aria-label={`Delete ${section.title} section`}
                                title={`Delete ${section.title} section`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Configuration Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Configure Template: {currentViewTemplate.name}
                </h1>
                <p className="text-gray-600 text-lg">Drag fields between sections to reorganize your template</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfigMode(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                >
                  Back to Product
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <DragDropContext onDragEnd={handleFieldDragEnd}>
              <div className="space-y-6">
                {filteredSections.map((section, sectionIndex) => (
                  <div key={section.id}>
                    <div
                      id={`section-${section.id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              {expandedSections[section.id] ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                            <input
                              value={section.title}
                              onChange={(e) => {
                                const updatedTemplate = {
                                  ...currentViewTemplate,
                                  sections: currentViewTemplate.sections.map((s) =>
                                    s.id === section.id ? { ...s, title: e.target.value } : s,
                                  ),
                                }
                                setViewTemplates((prev) =>
                                  prev.map((template) =>
                                    template.id === currentViewTemplate.id ? updatedTemplate : template,
                                  ),
                                )
                              }}
                              className="text-xl font-bold border-none shadow-none p-0 h-auto bg-transparent flex-1 focus:outline-none"
                              aria-label="Section title"
                              title="Section title"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {section.attributes.length} fields
                            </span>
                            <button
                              onClick={() => deleteSection(section.id)}
                              className="flex items-center justify-center h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                              aria-label={`Delete ${section.title} section`}
                              title={`Delete ${section.title} section`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {expandedSections[section.id] && (
                        <div className="p-4">
                          <Droppable droppableId={`section-${section.id}`}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`space-y-3 min-h-[80px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                                  snapshot.isDraggingOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
                                }`}
                              >
                                {section.attributes.map((attribute, index) => (
                                  <Draggable key={attribute.id} draggableId={`attr-${attribute.id}`} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`p-4 bg-gray-50 rounded-lg border group transition-all ${
                                          snapshot.isDragging ? "shadow-lg bg-white border-blue-300" : "border-gray-200"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 mb-3">
                                          <div
                                            {...provided.dragHandleProps}
                                            className="cursor-move p-1 hover:bg-gray-200 rounded transition-colors"
                                          >
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                          </div>
                                          <div className="flex-1">
                                            <input
                                              value={attribute.name}
                                              onChange={(e) =>
                                                updateAttribute(section.id, attribute.id, { name: e.target.value })
                                              }
                                              className="font-semibold border-none shadow-none p-0 h-auto bg-transparent text-base w-full focus:outline-none"
                                              placeholder="Field name"
                                            />
                                          </div>
                                          <button
                                            onClick={() => deleteAttribute(section.id, attribute.id)}
                                            className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 h-8 w-8 p-0 rounded-lg hover:bg-red-50"
                                            aria-label={`Delete ${attribute.name} field`}
                                            title={`Delete ${attribute.name} field`}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                          <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
                                            <select
                                              value={attribute.type}
                                              onChange={(e) =>
                                                updateAttribute(section.id, attribute.id, { type: e.target.value })
                                              }
                                              className="w-full h-9 text-sm border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                              aria-label="Field type"
                                              title="Field type"
                                            >
                                              <option value="String">Text</option>
                                              <option value="Number">Number</option>
                                              <option value="Boolean">Yes/No</option>
                                              <option value="Date">Date</option>
                                              <option value="Text">Long Text</option>
                                              <option value="Rich Text">Rich Text</option>
                                              <option value="Picklist">Dropdown</option>
                                            </select>
                                          </div>

                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                              Required
                                            </label>
                                            <div className="flex items-center gap-2 h-9">
                                              <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
                                                <input
                                                  type="checkbox"
                                                  checked={attribute.required}
                                                  onChange={(e) =>
                                                    updateAttribute(section.id, attribute.id, {
                                                      required: e.target.checked,
                                                    })
                                                  }
                                                  className="sr-only peer"
                                                  aria-label="Required field"
                                                  title="Required field"
                                                />
                                                <div className="w-full h-full bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors duration-200"></div>
                                                <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                                              </label>
                                            </div>
                                          </div>

                                          <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                              Options
                                            </label>
                                            <div className="h-9 flex items-center">
                                              {attribute.type === "Picklist" && (
                                                <button
                                                  onClick={() => openPicklistOptions(attribute.id)}
                                                  className="flex items-center justify-center h-8 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                  aria-label="Configure picklist options"
                                                  title="Configure picklist options"
                                                >
                                                  <Settings className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          </div>

                                          <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                              Status
                                            </label>
                                            <div className="flex flex-wrap gap-1 h-9 items-center">
                                              <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-200 rounded-full">
                                                {attribute.type}
                                              </span>
                                              {attribute.required && (
                                                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full">
                                                  Required
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button
                                  onClick={() => addAttribute(section.id)}
                                  className="w-full flex items-center justify-center gap-2 mt-3 border-2 border-dashed border-gray-300 h-12 text-sm rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Field
                                </button>
                                {section.attributes.length === 0 && (
                                  <div className="text-center text-gray-500 py-8">
                                    <p className="text-sm font-medium">No fields in this section</p>
                                    <p className="text-sm">Drag fields here from other sections</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </div>

                    {/* Add Section Button between sections */}
                    {sectionIndex < filteredSections.length - 1 && (
                      <div className="flex justify-center py-4">
                        <button
                          onClick={() => addSection(sectionIndex + 1)}
                          className="flex items-center gap-2 border-2 border-dashed border-gray-300 h-10 text-sm px-6 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add Section
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Final Add Section Button */}
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => addSection()}
                    className="flex items-center gap-2 border-2 border-dashed border-gray-300 h-10 text-sm px-6 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Sections</h2>
          <p className="text-sm text-gray-600 mb-4">Navigate through product information</p>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sections or attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="relative mb-4">
            <button
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="flex items-center gap-2 w-full justify-between px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="truncate font-medium">{currentViewTemplate.name}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showViewDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">Product Views</span>
                </div>
                {viewTemplates.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => handleViewChange(view.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-2">
                        {view.name}
                        {view.isDefault && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                            Default
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">{view.description}</span>
                    </div>
                    {activeViewId === view.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 font-medium">Quick Filters:</span>
            <button className="h-7 px-3 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              Required
            </button>
            <button className="h-7 px-3 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              All
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-semibold text-gray-900 truncate">{section.title}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
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
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Inline Editable Title */}
              <div className="mb-3">
                {editingTitle ? (
                  <div className="flex items-center gap-3">
                    <input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-3xl font-bold border-2 border-blue-500 px-4 py-2 rounded-lg focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTitleSave()
                        if (e.key === "Escape") handleTitleCancel()
                      }}
                      autoFocus
                      aria-label="Product title"
                      title="Product title"
                    />
                    <button
                      onClick={handleTitleSave}
                      className="flex items-center justify-center h-10 w-10 p-0 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      aria-label="Save title"
                      title="Save title"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleTitleCancel}
                      className="flex items-center justify-center h-10 w-10 p-0 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      aria-label="Cancel title edit"
                      title="Cancel title edit"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group">
                    <h1 className="text-3xl font-bold text-gray-900">{productData[1] || "Untitled Product"}</h1>
                    <button
                      onClick={handleTitleEdit}
                      className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                      aria-label="Edit product title"
                      title="Edit product title"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Editable SKU */}
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">SKU:</span>
                  {editingSku ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={tempSku}
                        onChange={(e) => setTempSku(e.target.value)}
                        className="h-8 px-3 border border-blue-500 rounded-lg focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSkuSave()
                          if (e.key === "Escape") handleSkuCancel()
                        }}
                        autoFocus
                        aria-label="Product SKU"
                        title="Product SKU"
                      />
                      <button
                        onClick={handleSkuSave}
                        className="flex items-center justify-center h-8 w-8 p-0 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        aria-label="Save SKU"
                        title="Save SKU"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSkuCancel}
                        className="flex items-center justify-center h-8 w-8 p-0 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label="Cancel SKU edit"
                        title="Cancel SKU edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className="font-semibold">{productData[2] || "No SKU"}</span>
                      <button
                        onClick={handleSkuEdit}
                        className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-100 rounded-lg"
                        aria-label="Edit product SKU"
                        title="Edit product SKU"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-gray-400">•</span>
                <span>
                  View: <span className="font-medium">{currentViewTemplate.name}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span>
                  Last updated: <span className="font-medium">2 hours ago</span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsConfigMode(true)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                <Settings className="w-4 h-4" />
                Configure
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                id={`section-${section.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedSections[section.id] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                    </div>
                    <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {section.attributes.length} fields
                    </span>
                  </div>
                </div>

                {expandedSections[section.id] && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.attributes.map((attribute) => (
                        <div key={attribute.id} className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            {attribute.name}
                            {attribute.required && <span className="text-red-500 ml-1">*</span>}
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

      {/* Picklist Options Dialog */}
      {showPicklistDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Manage Picklist Options</h3>
              <p className="text-sm text-gray-600 mt-2">
                Add, remove, or reorder options for this picklist field. Changes will be saved when you save the
                product.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter new option"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addPicklistOption()
                    }
                  }}
                />
                <button
                  onClick={addPicklistOption}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg">
                <DragDropContext onDragEnd={handlePicklistOptionDragEnd}>
                  <Droppable droppableId="picklist-options">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="p-2">
                        {currentPicklistField &&
                          (picklistOptions[currentPicklistField] || []).map((option, index) => (
                            <Draggable key={`${option}-${index}`} draggableId={`${option}-${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2 group transition-all ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{option}</span>
                                  </div>
                                  <button
                                    onClick={() => removePicklistOption(index)}
                                    className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg"
                                    aria-label={`Remove ${option} option`}
                                    title={`Remove ${option} option`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                        {currentPicklistField &&
                          (!picklistOptions[currentPicklistField] ||
                            picklistOptions[currentPicklistField].length === 0) && (
                            <div className="p-8 text-center text-gray-500">
                              <p className="font-medium">No options added yet</p>
                              <p className="text-sm">Add your first option above</p>
                            </div>
                          )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPicklistDialog(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedProductDetailPage