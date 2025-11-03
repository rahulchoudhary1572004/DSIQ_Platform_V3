import { useState } from "react"
import { ArrowLeft, Plus, Settings, Trash2, Copy, Calendar, Users, Eye, Search, Filter } from "lucide-react"

export default function ViewsListPage({ viewTemplates, setCurrentPage, onConfigureView, onCreateView, onDeleteView }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newViewName, setNewViewName] = useState("")
  const [newViewDescription, setNewViewDescription] = useState("")
  const [selectedSourceView, setSelectedSourceView] = useState("")
  const [filterType, setFilterType] = useState("all") // "all", "default", "custom"

  const filteredViews = viewTemplates.filter((view) => {
    const matchesSearch =
      view.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterType === "all" ||
      (filterType === "default" && view.isDefault) ||
      (filterType === "custom" && !view.isDefault)

    return matchesSearch && matchesFilter
  })

  const handleCreateView = () => {
    if (!newViewName.trim() || !selectedSourceView) return

    onCreateView(selectedSourceView, {
      name: newViewName.trim(),
      description: newViewDescription.trim() || "Custom view",
    })

    setShowCreateDialog(false)
    setNewViewName("")
    setNewViewDescription("")
    setSelectedSourceView("")
  }

  const getViewStats = (view) => {
    const totalFields = view.sections.reduce((acc, section) => acc + section.attributes.length, 0)
    const requiredFields = view.sections.reduce(
      (acc, section) => acc + section.attributes.filter((attr) => attr.required).length,
      0,
    )
    return { totalFields, requiredFields, sections: view.sections.length }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage("product")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Product
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Views</h1>
                <p className="text-gray-600 mt-1">Manage and configure your product view templates</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create New View
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-5/6 mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search views..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Views</option>
              <option value="default">Default Views</option>
              <option value="custom">Custom Views</option>
            </select>
          </div>
        </div>

        {/* Views Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredViews.map((view) => {
            const stats = getViewStats(view)
            return (
              <div
                key={view.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{view.name}</h3>
                        {view.isDefault && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{view.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.sections}</div>
                      <div className="text-xs text-gray-500">Sections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.totalFields}</div>
                      <div className="text-xs text-gray-500">Total Fields</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.requiredFields}</div>
                      <div className="text-xs text-gray-500">Required</div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {view.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>Modified: {view.lastModified}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onConfigureView(view.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSourceView(view.id)
                        setNewViewName(`${view.name} Copy`)
                        setNewViewDescription(`Copy of ${view.name}`)
                        setShowCreateDialog(true)
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {!view.isDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${view.name}"?`)) {
                            onDeleteView(view.id)
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredViews.length === 0 && (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No views found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Create your first custom view to get started"}
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New View
            </button>
          </div>
        )}
      </div>

      {/* Create View Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create New View</h3>
              <p className="text-sm text-gray-600 mt-2">
                Create a new view by copying sections and fields from an existing view.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View Name</label>
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="Enter view name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newViewDescription}
                  onChange={(e) => setNewViewDescription(e.target.value)}
                  placeholder="Enter view description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Copy From</label>
                <select
                  value={selectedSourceView}
                  onChange={(e) => setSelectedSourceView(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select a view to copy from</option>
                  {viewTemplates.map((view) => (
                    <option key={view.id} value={view.id}>
                      {view.name} ({getViewStats(view).totalFields} fields)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateDialog(false)
                  setNewViewName("")
                  setNewViewDescription("")
                  setSelectedSourceView("")
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateView}
                disabled={!newViewName.trim() || !selectedSourceView}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
