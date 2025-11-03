"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

const CreateViewModal = ({ isOpen, onClose, onSubmit, viewTemplates }) => {
  const [newViewData, setNewViewData] = useState({
    name: "",
    description: "",
    sourceViewId: "",
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newViewData.name && newViewData.sourceViewId) {
      onSubmit(newViewData)
      setNewViewData({ name: "", description: "", sourceViewId: "" })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New View</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newViewData.description}
              onChange={(e) => setNewViewData({ ...newViewData, description: e.target.value })}
              placeholder="Enter view description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Template</label>
            <select
              value={newViewData.sourceViewId}
              onChange={(e) => setNewViewData({ ...newViewData, sourceViewId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>
                Select a template to copy from
              </option>
              {viewTemplates.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose()
                setNewViewData({ name: "", description: "", sourceViewId: "" })
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
  )
}

export default CreateViewModal
