"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings,
  ArrowLeft,
  X,
  MapPin,
} from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

const ViewConfigurator = ({
  viewTemplates,
  setViewTemplates,
  activeViewId,
  picklistOptions,
  setPicklistOptions,
  onSave,
  onBack,
  fieldMappingTemplates = [],
}) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState({})
  const [showPicklistDialog, setShowPicklistDialog] = useState(false)
  const [currentPicklistField, setCurrentPicklistField] = useState(null)
  const [newOption, setNewOption] = useState("")
  const [showFieldMappingDialog, setShowFieldMappingDialog] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [selectedRetailers, setSelectedRetailers] = useState([])
  
  // Track deleted sections and attributes
  const [deletedSectionIds, setDeletedSectionIds] = useState([])
  const [deletedAttributes, setDeletedAttributes] = useState([])

  const currentViewTemplate = viewTemplates.find((v) => v.id === activeViewId) || viewTemplates[0]

  // Safety check: if no view template exists, return early
  if (!currentViewTemplate || !currentViewTemplate.sections) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading view template...</div>
      </div>
    )
  }

  useEffect(() => {
    const initialExpanded = {}
    currentViewTemplate.sections.forEach((section) => {
      initialExpanded[section.id] = true
    })
    setExpandedSections(initialExpanded)
    
    // Initialize selected template and retailers from view
    if (currentViewTemplate.defaultFieldMapping) {
      setSelectedTemplateId(currentViewTemplate.defaultFieldMapping.templateId)
      setSelectedRetailers(currentViewTemplate.defaultFieldMapping.enabledRetailers || [])
    }
    
    // Reset deletion tracking when switching views
    setDeletedSectionIds([])
    setDeletedAttributes([])
  }, [currentViewTemplate, activeViewId])

  const filteredSections = (currentViewTemplate.sections || [])
    .filter((section) => section.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.order - b.order)

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
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
      updatedSections = [...currentViewTemplate.sections]
      updatedSections.splice(insertIndex, 0, newSection)
      updatedSections = updatedSections.map((section, index) => ({ ...section, order: index }))
    } else {
      updatedSections = [...currentViewTemplate.sections, newSection]
    }

    const updatedTemplate = {
      ...currentViewTemplate,
      sections: updatedSections,
      lastModified: new Date().toISOString().split("T")[0],
    }

    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
    setExpandedSections((prev) => ({ ...prev, [newSection.id]: true }))
  }

  const deleteSection = (sectionId) => {
    const section = currentViewTemplate.sections.find((s) => s.id === sectionId)
    
    // Only track deletion if the section has a real ID (not a temp numeric ID)
    if (section && section.id && typeof section.id === 'string' && !section.id.toString().startsWith('temp-')) {
      setDeletedSectionIds((prev) => [...prev, section.id])
    }
    
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.filter((s) => s.id !== sectionId),
      lastModified: new Date().toISOString().split("T")[0],
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const updateAttribute = (sectionId, attributeId, updates) => {
    // If changing type to Dropdown and options don't exist, add empty array
    if (updates.type === 'Dropdown') {
      updates = { ...updates, options: updates.options || [] }
    }
    
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              attributes: s.attributes.map((a) => (a.id === attributeId ? { ...a, ...updates } : a)),
            }
          : s,
      ),
      lastModified: new Date().toISOString().split("T")[0],
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const deleteAttribute = (sectionId, attributeId) => {
    const section = currentViewTemplate.sections.find((s) => s.id === sectionId)
    const attribute = section?.attributes.find((a) => a.id === attributeId)
    
    // Only track deletion if both section and attribute have real IDs (not temp numeric IDs)
    if (
      section && 
      attribute && 
      section.id && 
      attribute.id && 
      typeof section.id === 'string' && 
      typeof attribute.id === 'string'
    ) {
      setDeletedAttributes((prev) => [...prev, { id: attribute.id, section_id: section.id }])
    }
    
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId ? { ...s, attributes: s.attributes.filter((a) => a.id !== attributeId) } : s,
      ),
      lastModified: new Date().toISOString().split("T")[0],
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const addAttribute = (sectionId) => {
    const newAttribute = { 
      id: Date.now(), 
      name: "New Field", 
      type: "Text", 
      required: false, 
      order: 0,
      options: [] // Initialize with empty array
    }
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: currentViewTemplate.sections.map((s) =>
        s.id === sectionId ? { ...s, attributes: [...s.attributes, newAttribute] } : s,
      ),
      lastModified: new Date().toISOString().split("T")[0],
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const openPicklistOptions = (attributeId) => {
    setCurrentPicklistField(attributeId)
    setShowPicklistDialog(true)
  }

  const closePicklistDialog = () => {
    // Save the options to the attribute before closing
    if (currentPicklistField) {
      const options = picklistOptions[currentPicklistField] || []
      
      // Find the section and update the attribute with options
      const updatedTemplate = {
        ...currentViewTemplate,
        sections: currentViewTemplate.sections.map((section) => ({
          ...section,
          attributes: section.attributes.map((attr) => 
            attr.id === currentPicklistField 
              ? { ...attr, options } 
              : attr
          )
        }))
      }
      
      setViewTemplates((prev) =>
        prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template))
      )
    }
    
    setShowPicklistDialog(false)
    setCurrentPicklistField(null)
  }

  const addPicklistOption = () => {
    if (!newOption.trim() || !currentPicklistField) return
    setPicklistOptions((prev) => ({
      ...prev,
      [currentPicklistField]: [...(prev[currentPicklistField] || []), newOption.trim()],
    }))
    setNewOption("")
  }

  const removePicklistOption = (index) => {
    if (!currentPicklistField) return
    setPicklistOptions((prev) => ({
      ...prev,
      [currentPicklistField]: prev[currentPicklistField]?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleFieldMappingChange = (templateId, enabledRetailers) => {
    const updatedTemplate = {
      ...currentViewTemplate,
      defaultFieldMapping: {
        templateId: templateId,
        enabledRetailers: enabledRetailers,
      },
      lastModified: new Date().toISOString().split("T")[0],
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
    setSelectedTemplateId(templateId)
    setSelectedRetailers(enabledRetailers)
  }

  const removeFieldMapping = () => {
    const updatedTemplate = {
      ...currentViewTemplate,
      defaultFieldMapping: null,
      lastModified: new Date().toISOString().split("T")[0],
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
    setSelectedTemplateId(null)
    setSelectedRetailers([])
  }

  const handleRetailerToggle = (retailerId) => {
    const newSelectedRetailers = selectedRetailers.includes(retailerId)
      ? selectedRetailers.filter(id => id !== retailerId)
      : [...selectedRetailers, retailerId]
    
    setSelectedRetailers(newSelectedRetailers)
  }

  const handleSaveFieldMapping = () => {
    if (selectedTemplateId && selectedRetailers.length > 0) {
      handleFieldMappingChange(selectedTemplateId, selectedRetailers)
      setShowFieldMappingDialog(false)
    }
  }

  const handleSidebarDragEnd = (result) => {
    if (!result.destination) return
    const sections = [...currentViewTemplate.sections]
    const [movedSection] = sections.splice(result.source.index, 1)
    sections.splice(result.destination.index, 0, movedSection)
    const updatedTemplate = {
      ...currentViewTemplate,
      sections: sections.map((section, index) => ({ ...section, order: index })),
      lastModified: new Date().toISOString().split("T")[0],
    }
    setViewTemplates((prev) =>
      prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
    )
  }

  const handleFieldDragEnd = (result) => {
    if (!result.destination) return
    const { source, destination } = result
    if (source.droppableId === destination.droppableId) {
      const sectionId = source.droppableId.replace("section-", "")
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
        lastModified: new Date().toISOString().split("T")[0],
      }
      setViewTemplates((prev) =>
        prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
      )
    } else {
      const sourceSectionId = source.droppableId.replace("section-", "")
      const destinationSectionId = destination.droppableId.replace("section-", "")
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
          if (s.id === sourceSectionId) return { ...s, attributes: sourceAttributes }
          if (s.id === destinationSectionId) return { ...s, attributes: destinationAttributes }
          return s
        }),
        lastModified: new Date().toISOString().split("T")[0],
      }
      setViewTemplates((prev) =>
        prev.map((template) => (template.id === currentViewTemplate.id ? updatedTemplate : template)),
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Configuration Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-2 py-1.6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <div className="h-5 w-0.5 bg-gray-300" />
            <h2 className="text-xl font-bold text-gray-900">Configure</h2>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={() => addSection()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            <Plus className="w-3 h-3" /> Add Section
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-base text-gray-600 mb-3">Customize your product template structure</p>
          <DragDropContext onDragEnd={handleSidebarDragEnd}>
            <Droppable droppableId="sidebar-sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredSections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border border-gray-200 rounded-md overflow-hidden group transition-all ${snapshot.isDragging ? "shadow-lg" : "shadow-sm"}`}
                        >
                          <div className="flex items-center bg-white">
                            <div {...provided.dragHandleProps} className="p-2 cursor-move hover:bg-gray-50 transition-colors">
                              <GripVertical className="w-3 h-3 text-gray-400" />
                            </div>
                            <button
                              onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })}
                              className="flex-1 p-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-medium text-gray-900 truncate">{section.title}</span>
                              </div>
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {section.attributes.length}
                              </span>
                            </button>
                            <button
                              onClick={() => deleteSection(section.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                            >
                              <Trash2 className="w-3 h-3" />
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
        <div className="bg-white border-b border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.6">
                Configure Template: {currentViewTemplate.name}
              </h1>
              <p className="text-gray-600 text-base">Drag fields between sections to reorganize your template</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/pim/views")}
                className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                Manage Views
              </button>
              <button
                onClick={() => onSave({ deletedSectionIds, deletedAttributes })}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Save className="w-3 h-3" /> Save Configuration
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Field Mapping Templates Section - Compact Filter Style */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 px-5 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Field Mapping:</span>
              </div>
              
              {currentViewTemplate.defaultFieldMapping?.templateId ? (
                <>
                  {(() => {
                    const template = fieldMappingTemplates.find((t) => t.id === currentViewTemplate.defaultFieldMapping.templateId)
                    return (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                          <span className="text-sm font-medium text-blue-900">{template?.name || "Unknown"}</span>
                          <span className="text-xs text-blue-600">
                            ({currentViewTemplate.defaultFieldMapping.enabledRetailers?.length || 0}/{template?.retailers?.length || 0} retailers)
                          </span>
                        </div>
                        
                        <button
                          onClick={() => setShowFieldMappingDialog(true)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={removeFieldMapping}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Remove template"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        {/* Compact Retailer Badges */}
                        <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-gray-500">Enabled:</span>
                          {currentViewTemplate.defaultFieldMapping.enabledRetailers?.slice(0, 3).map((retailerId) => (
                            <span key={retailerId} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded capitalize border border-green-200">
                              {retailerId}
                            </span>
                          ))}
                          {currentViewTemplate.defaultFieldMapping.enabledRetailers?.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{currentViewTemplate.defaultFieldMapping.enabledRetailers.length - 3} more
                            </span>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </>
              ) : (
                <button
                  onClick={() => setShowFieldMappingDialog(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                >
                  <Plus className="w-4 h-4" />
                  Assign Template
                </button>
              )}
            </div>
          </div>

          <DragDropContext onDragEnd={handleFieldDragEnd}>
            <div className="space-y-5">
              {filteredSections.map((section, sectionIndex) => (
                <div key={section.id}>
                  <div id={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
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
                          <input
                            value={section.title}
                            onChange={(e) => {
                              const updatedTemplate = {
                                ...currentViewTemplate,
                                sections: currentViewTemplate.sections.map((s) =>
                                  s.id === section.id ? { ...s, title: e.target.value } : s,
                                ),
                                lastModified: new Date().toISOString().split("T")[0],
                              }
                              setViewTemplates((prev) =>
                                prev.map((template) =>
                                  template.id === currentViewTemplate.id ? updatedTemplate : template,
                                ),
                              )
                            }}
                            className="text-lg font-bold border-none shadow-none p-0 h-auto bg-transparent flex-1 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.8 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {section.attributes.length} fields
                          </span>
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedSections[section.id] && (
                      <div className="p-3">
                        <Droppable droppableId={`section-${section.id}`}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`space-y-2 min-h-[64px] p-3 rounded-md border-2 border-dashed transition-colors ${snapshot.isDraggingOver ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
                            >
                              {section.attributes.map((attribute, index) => (
                                <Draggable key={attribute.id} draggableId={`attr-${attribute.id}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`p-3 bg-gray-50 rounded-md border group transition-all ${snapshot.isDragging ? "shadow-lg bg-white border-blue-300" : "border-gray-200"}`}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <div {...provided.dragHandleProps} className="cursor-move p-0.8 hover:bg-gray-200 rounded transition-colors">
                                          <GripVertical className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                          <input
                                            value={attribute.name}
                                            onChange={(e) => updateAttribute(section.id, attribute.id, { name: e.target.value })}
                                            className="font-semibold border-none shadow-none p-0 h-auto bg-transparent text-sm w-full focus:outline-none"
                                            placeholder="Field name"
                                          />
                                        </div>
                                        <button
                                          onClick={() => deleteAttribute(section.id, attribute.id)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 h-6 w-6 p-0 rounded-md hover:bg-red-50"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-4 gap-3 text-xs">
                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1.6 block">Type</label>
                                          <select
                                            value={attribute.type}
                                            onChange={(e) => updateAttribute(section.id, attribute.id, { type: e.target.value })}
                                            className="w-full h-7 text-xs border border-gray-300 rounded-md px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                          >
                                            <option value="Text">Text</option>
                                            <option value="Number">Number</option>
                                            <option value="Boolean">Yes/No</option>
                                            <option value="Date">Date</option>
                                            <option value="Long Text">Long Text</option>
                                            <option value="Rich Text">Rich Text</option>
                                            <option value="Dropdown">Dropdown</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-1.6">Required</label>
                                          <div className="flex items-center gap-2 h-7">
                                            <label className="relative inline-flex items-center cursor-pointer w-9 h-5">
                                              <input
                                                type="checkbox"
                                                checked={attribute.required}
                                                onChange={(e) =>
                                                  updateAttribute(section.id, attribute.id, { required: e.target.checked })
                                                }
                                                className="sr-only peer"
                                              />
                                              <div className="w-full h-full bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors duration-200"></div>
                                              <div className="absolute left-[1.6px] top-[1.6px] w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-4"></div>
                                            </label>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1.6 block">Options</label>
                                          <div className="h-7 flex items-center">
                                            {attribute.type === "Dropdown" && (
                                              <button
                                                onClick={() => openPicklistOptions(attribute.id)}
                                                className="h-6 px-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                              >
                                                <Settings className="w-3 h-3" />
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <label className="text-xs font-medium text-gray-700 mb-1.6 block">Status</label>
                                          <div className="flex flex-wrap gap-0.8 h-7 items-center">
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full">
                                              {attribute.type}
                                            </span>
                                            {attribute.required && (
                                              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full">
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
                                className="w-full flex items-center justify-center gap-2 mt-2 border-2 border-dashed border-gray-300 h-10 text-xs rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                              >
                                <Plus className="w-3 h-3" /> Add Field
                              </button>
                              {section.attributes.length === 0 && (
                                <div className="text-center text-gray-500 py-6">
                                  <p className="text-xs font-medium">No fields in this section</p>
                                  <p className="text-xs">Drag fields here from other sections</p>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </div>

                  {sectionIndex < filteredSections.length - 1 && (
                    <div className="flex justify-center my-3">
                      <button
                        onClick={() => addSection(sectionIndex + 1)}
                        className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Section Here
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Picklist Options Dialog */}
      {showPicklistDialog && currentPicklistField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={closePicklistDialog}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Dropdown Options</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add new option"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && addPicklistOption()}
                />
                <button
                  onClick={addPicklistOption}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {(picklistOptions[currentPicklistField] || []).map((option, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm">{option}</span>
                      <button
                        onClick={() => removePicklistOption(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
              <button
                onClick={closePicklistDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Mapping Template Dialog */}
      {showFieldMappingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowFieldMappingDialog(false)
                // Reset to current template if dialog is cancelled
                if (currentViewTemplate.defaultFieldMapping) {
                  setSelectedTemplateId(currentViewTemplate.defaultFieldMapping.templateId)
                  setSelectedRetailers(currentViewTemplate.defaultFieldMapping.enabledRetailers || [])
                } else {
                  setSelectedTemplateId(null)
                  setSelectedRetailers([])
                }
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Assign Field Mapping Template</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Select ONE multi-retailer template and choose which retailers to enable for this view.
                </p>

                {/* Template Selection */}
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
                <select
                  value={selectedTemplateId || ""}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value)
                    setSelectedRetailers([]) // Reset retailers when template changes
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">-- Select a template --</option>
                  {fieldMappingTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.retailers?.length || 0} retailers)
                    </option>
                  ))}
                </select>
              </div>

              {/* Retailer Checkboxes */}
              {selectedTemplateId && (() => {
                const template = fieldMappingTemplates.find(t => t.id === selectedTemplateId)
                return template ? (
                  <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Retailers to Enable ({selectedRetailers.length} selected)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {template.retailers?.map((retailerId) => (
                          <label
                            key={retailerId}
                            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedRetailers.includes(retailerId)
                                ? "border-blue-500 bg-blue-100"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedRetailers.includes(retailerId)}
                              onChange={() => handleRetailerToggle(retailerId)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900 capitalize">{retailerId}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {selectedRetailers.length === 0 && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                        ⚠️ Please select at least one retailer to enable
                      </p>
                    )}

                    {/* Field count info */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-xs text-gray-600">
                        <strong>Total mappings in template:</strong>{" "}
                        {Object.keys(template.mappings || {}).reduce((total, retailer) => 
                          total + Object.keys(template.mappings[retailer] || {}).length, 0
                        )} field mappings across {template.retailers?.length || 0} retailers
                      </p>
                    </div>
                  </div>
                ) : null
              })()}

              {!selectedTemplateId && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a template to see available retailers</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
              <button
                onClick={() => {
                  setShowFieldMappingDialog(false)
                  // Reset to current template if dialog is cancelled
                  if (currentViewTemplate.defaultFieldMapping) {
                    setSelectedTemplateId(currentViewTemplate.defaultFieldMapping.templateId)
                    setSelectedRetailers(currentViewTemplate.defaultFieldMapping.enabledRetailers || [])
                  } else {
                    setSelectedTemplateId(null)
                    setSelectedRetailers([])
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFieldMapping}
                disabled={!selectedTemplateId || selectedRetailers.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewConfigurator
