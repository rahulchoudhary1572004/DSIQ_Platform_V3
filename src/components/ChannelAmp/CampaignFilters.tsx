"use client"

import { useState } from "react"
import { Filter, X, Search } from "lucide-react"

const CampaignFilters = ({ isOpen, onClose, onFiltersChange }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    adTypes: [],
    status: [],
    countries: [],
    searchTerm: "",
  })

  const adTypes = ["SP", "SB", "SD", "STV"]
  const statuses = ["Active", "Paused", "Archived"]
  const countries = ["US", "UK", "DE", "FR", "IT", "ES"]

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters }

    if (filterType === "adTypes" || filterType === "status" || filterType === "countries") {
      const currentArray = newFilters[filterType]
      if (currentArray.includes(value)) {
        newFilters[filterType] = currentArray.filter((item) => item !== value)
      } else {
        newFilters[filterType] = [...currentArray, value]
      }
    } else {
      newFilters[filterType] = value
    }

    setFilters(newFilters)
    onFiltersChange && onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: { start: "", end: "" },
      adTypes: [],
      status: [],
      countries: [],
      searchTerm: "",
    }
    setFilters(clearedFilters)
    onFiltersChange && onFiltersChange(clearedFilters)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-96 bg-white h-full shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Filter size={20} className="mr-2 text-gray-600" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Campaigns</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by campaign name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, start: e.target.value })}
              />
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange("dateRange", { ...filters.dateRange, end: e.target.value })}
              />
            </div>
          </div>

          {/* Ad Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ad Types</label>
            <div className="grid grid-cols-2 gap-2">
              {adTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.adTypes.includes(type)}
                    onChange={() => handleFilterChange("adTypes", type)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleFilterChange("status", status)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
            <div className="grid grid-cols-3 gap-2">
              {countries.map((country) => (
                <label key={country} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.countries.includes(country)}
                    onChange={() => handleFilterChange("countries", country)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignFilters
