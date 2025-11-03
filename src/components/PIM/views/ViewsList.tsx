"use client"

import { useState } from "react"
import { Search, Plus, Trash2, Copy, Settings, Eye, ArrowLeft } from "lucide-react"

const ViewsList = ({ viewTemplates, onBack, onCreateView, onConfigureView, onDeleteView }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredViews = viewTemplates.filter(
    (view) =>
      view.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      view.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
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
          <button
            onClick={onCreateView}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create View
          </button>
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

      {/* Views Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredViews.map((view) => (
          <div
            key={view.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{view.name}</h3>
                  {view.isDefault && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{view.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sections:</span>
                <span className="font-medium">{view.sections.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Fields:</span>
                <span className="font-medium">
                  {view.sections.reduce((total, section) => total + section.attributes.length, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">{view.createdAt}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Modified:</span>
                <span className="font-medium">{view.lastModified}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onConfigureView(view.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Settings className="h-3 w-3" />
                Configure
              </button>
              <button
                onClick={onCreateView}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                title="Duplicate View"
              >
                <Copy className="h-3 w-3" />
              </button>
              {!view.isDefault && (
                <button
                  onClick={() => onDeleteView(view.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm"
                  title="Delete View"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredViews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No views found</h3>
            <p>Try adjusting your search or create a new view</p>
          </div>
        </div>
      )}
    </>
  )
}

export default ViewsList
