"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useProductData } from "../../context/ProductDataContext"
import { Plus, X, Search, Trash2, Copy, Settings, Eye, ArrowLeft, ChevronDown } from "lucide-react"
import FloatingAddButton from "../../../helper_Functions/FloatingAddButton"
import { useViewTemplates, useViewTemplateOperations, ENV } from "../../api/pim"
import type { ViewTemplate } from "../../api/pim"

const ViewManagementPage = () => {
  const navigate = useNavigate()
  const { fieldMappingTemplates } = useProductData()
  
  // Use real API hooks
  const { templates: viewTemplates, loading, error, fetchTemplates, setTemplates: setViewTemplates } = useViewTemplates(ENV.ORG_ID)
  const { create, update, delete: deleteViewTemplate } = useViewTemplateOperations(ENV.ORG_ID)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedViewId, setExpandedViewId] = useState<string | null>(null)
  const [newViewData, setNewViewData] = useState({
    name: "",
    sourceViewId: "",
  })

  // Hardcoded field mapping for now (TODO: will be updated in future)
  const [viewFieldMappings, setViewFieldMappings] = useState<Record<string, {
    templateId: string;
    enabledRetailers: string[];
  }>>({})

  // Fetch view templates on component mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleConfigureView = (viewId: string) => {
    navigate(`/pim/views/${viewId}`)
  }

  const handleCreateView = async () => {
    if (!newViewData.name) {
      return
    }

    try {
      let sectionsToCreate = []

      // If a source template is selected, copy its sections
      if (newViewData.sourceViewId) {
        const sourceTemplate = viewTemplates.find(v => v.id === newViewData.sourceViewId)
        if (sourceTemplate && sourceTemplate.sections) {
          sectionsToCreate = sourceTemplate.sections.map(section => ({
            id: section.id,
            title: section.title,
            order: section.order,
            attributes: section.attributes.map(attr => ({
              id: attr.id,
              name: attr.name,
              type: attr.type,
              required: attr.required,
              order: attr.order,
              options: attr.options || [],
            }))
          }))
        }
      }

      // Create temporary view template in local state (not saved to backend yet)
      const tempId = `temp-${Date.now()}`
      const newTemplate = {
        id: tempId,
        name: newViewData.name,
        orgId: ENV.ORG_ID,
        sections: sectionsToCreate,
        _isNew: true, // Flag to indicate this is a new unsaved template
      }

      setShowCreateModal(false)
      setNewViewData({ name: "", sourceViewId: "" })
      
      // Navigate to configure the new view, passing the template in state
      navigate(`/pim/views/${tempId}`, { state: { newTemplate } })
    } catch (error) {
      console.error("Error creating view:", error)
    }
  }

  const handleDeleteView = async (viewId: string) => {
    // Check if it's the first template (treating it as default)
    const isFirstTemplate = viewTemplates[0]?.id === viewId
    if (isFirstTemplate) {
      alert("Cannot delete the default view")
      return
    }
    
    if (!confirm("Are you sure you want to delete this view?")) {
      return
    }

    try {
      await deleteViewTemplate(viewId)
      await fetchTemplates()
    } catch (error) {
      console.error("Error deleting view:", error)
    }
  }

  const handleRetailerToggle = (viewId: string, retailer: string) => {
    setViewFieldMappings(prev => {
      const current = prev[viewId] || { templateId: "", enabledRetailers: [] }
      const currentRetailers = current.enabledRetailers || []
      const newRetailers = currentRetailers.includes(retailer)
        ? currentRetailers.filter(r => r !== retailer)
        : [...currentRetailers, retailer]
      
      return {
        ...prev,
        [viewId]: {
          ...current,
          enabledRetailers: newRetailers
        }
      }
    })
  }

  const handleBack = () => {
    navigate("/pim/products")
  }

  const filteredViews = viewTemplates.filter((view) =>
    view.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreateView()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Views List */}
      <>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Product Views</h1>
              <p className="text-gray-600 mt-1">Manage your product view templates</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search views..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading views...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* Views Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredViews.map((view, index) => {
              // Hardcoded field mapping - TODO: will be updated when backend provides this data
              const viewMapping = viewFieldMappings[view.id]
              const template = viewMapping ? fieldMappingTemplates.find(
                t => t.id === viewMapping.templateId
              ) : null
              const isExpanded = expandedViewId === view.id
              const isFirstView = index === 0 // Treat first view as default

              return (
                <div
                  key={view.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{view.name}</h3>
                        {isFirstView && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sections:</span>
                      <span className="font-medium">{view.sections?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Fields:</span>
                      <span className="font-medium">
                        {view.sections?.reduce((total, section) => total + section.attributes.length, 0) || 0}
                      </span>
                    </div>
                    
                    {/* Field Template Dropdown - Hardcoded for now */}
                    {template && (
                      <div className="pt-2 border-t">
                        <button
                          onClick={() => setExpandedViewId(isExpanded ? null : view.id)}
                          className="w-full flex items-center justify-between text-sm text-left py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Field Template:</span>
                            <span className="font-medium text-blue-600">{template.name}</span>
                          </div>
                          <ChevronDown 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              isExpanded ? 'transform rotate-180' : ''
                            }`} 
                          />
                        </button>
                        
                        {/* Retailer Checkboxes */}
                        {isExpanded && (
                          <div className="mt-2 pl-3 space-y-2">
                            <p className="text-xs text-gray-500 mb-2">Enable/Disable Retailers:</p>
                            <div className="space-y-1.5">
                              {template.retailers?.map((retailer) => {
                                const isEnabled = viewMapping.enabledRetailers?.includes(retailer)
                                return (
                                  <label
                                    key={retailer}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isEnabled}
                                      onChange={() => handleRetailerToggle(view.id, retailer)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className={`text-sm capitalize ${
                                      isEnabled ? 'text-green-700 font-medium' : 'text-gray-600'
                                    }`}>
                                      {retailer}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                            <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                              {viewMapping.enabledRetailers?.length || 0} of{' '}
                              {template.retailers?.length || 0} retailers enabled
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfigureView(view.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Settings className="h-3 w-3" />
                      Configure
                    </button>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                      title="Duplicate View"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {!isFirstView && (
                      <button
                        onClick={() => handleDeleteView(view.id)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm"
                        title="Delete View"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !error && filteredViews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No views found</h3>
              <p>Try adjusting your search or create a new view</p>
            </div>
          </div>
        )}
      </>

      {/* Simple Floating Button */}
      <FloatingAddButton
        onClick={() => setShowCreateModal(true)}
        label= "Create View" 
        icon={Plus}
      >
      </FloatingAddButton>

      {/* Create View Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowCreateModal(false)
                setNewViewData({ name: "", sourceViewId: "" })
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New View</h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View Name</label>
                <input
                  type="text"
                  value={newViewData.name}
                  onChange={(e) => setNewViewData({ ...newViewData, name: e.target.value })}
                  placeholder="Enter view name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Template <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  value={newViewData.sourceViewId}
                  onChange={(e) => setNewViewData({ ...newViewData, sourceViewId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Base template"
                  title="Base template"
                >
                  <option value="">
                    Create from scratch (empty view)
                  </option>
                  {viewTemplates.map((view) => (
                    <option key={view.id} value={view.id}>
                      {view.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a template to copy its structure, or leave empty to start fresh
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewViewData({ name: "", sourceViewId: "" })
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create View
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewManagementPage