"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  Target,
  Plus,
  X,
  Filter,
  Download,
  Lightbulb,
  BarChart3,
  Zap,
  AlertCircle,
} from "lucide-react"

const KeywordResearchTool = ({ isOpen, onClose, onKeywordsSelect, selectedKeywords = [], productContext = null }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState([])
  const [filters, setFilters] = useState({
    minSearchVolume: 100,
    maxSearchVolume: 1000000,
    minCpc: 0.5,
    maxCpc: 10,
    competition: "all", // all, low, medium, high
    matchType: "all", // all, broad, phrase, exact
  })
  const [activeTab, setActiveTab] = useState("suggestions") // suggestions, trends, competitors
  const [sortBy, setSortBy] = useState("searchVolume") // searchVolume, cpc, competition, relevance
  const [sortOrder, setSortOrder] = useState("desc")

  const searchInputRef = useRef(null)

  // Mock keyword data - replace with real API calls
  const mockKeywordData = [
    {
      keyword: "wireless headphones",
      searchVolume: 45000,
      cpc: 2.45,
      competition: "high",
      trend: "up",
      trendValue: "+12%",
      relevanceScore: 95,
      difficulty: 78,
      opportunity: 85,
      relatedTerms: ["bluetooth headphones", "noise cancelling", "wireless earbuds"],
    },
    {
      keyword: "bluetooth headphones",
      searchVolume: 38000,
      cpc: 2.12,
      competition: "high",
      trend: "up",
      trendValue: "+8%",
      relevanceScore: 92,
      difficulty: 75,
      opportunity: 82,
      relatedTerms: ["wireless headphones", "noise cancelling headphones"],
    },
    {
      keyword: "noise cancelling headphones",
      searchVolume: 28000,
      cpc: 3.21,
      competition: "medium",
      trend: "up",
      trendValue: "+15%",
      relevanceScore: 88,
      difficulty: 65,
      opportunity: 90,
      relatedTerms: ["wireless headphones", "active noise cancellation"],
    },
    {
      keyword: "gaming headset",
      searchVolume: 22000,
      cpc: 1.89,
      competition: "medium",
      trend: "stable",
      trendValue: "+2%",
      relevanceScore: 75,
      difficulty: 58,
      opportunity: 70,
      relatedTerms: ["gaming headphones", "pc headset", "xbox headset"],
    },
    {
      keyword: "wireless earbuds",
      searchVolume: 52000,
      cpc: 2.78,
      competition: "high",
      trend: "up",
      trendValue: "+18%",
      relevanceScore: 85,
      difficulty: 82,
      opportunity: 88,
      relatedTerms: ["true wireless earbuds", "bluetooth earbuds"],
    },
  ]

  const performSearch = async (term) => {
    if (!term.trim()) return

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const filtered = mockKeywordData.filter(
        (item) =>
          item.keyword.toLowerCase().includes(term.toLowerCase()) ||
          item.relatedTerms.some((related) => related.toLowerCase().includes(term.toLowerCase())),
      )

      // Add some generated suggestions based on the search term
      const generated = [
        {
          keyword: `${term} best`,
          searchVolume: Math.floor(Math.random() * 20000) + 5000,
          cpc: (Math.random() * 3 + 1).toFixed(2),
          competition: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
          trend: Math.random() > 0.5 ? "up" : "down",
          trendValue: `${Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 20)}%`,
          relevanceScore: Math.floor(Math.random() * 30) + 70,
          difficulty: Math.floor(Math.random() * 40) + 40,
          opportunity: Math.floor(Math.random() * 40) + 60,
          relatedTerms: [`best ${term}`, `${term} reviews`, `top ${term}`],
        },
        {
          keyword: `${term} cheap`,
          searchVolume: Math.floor(Math.random() * 15000) + 3000,
          cpc: (Math.random() * 2 + 0.5).toFixed(2),
          competition: ["low", "medium"][Math.floor(Math.random() * 2)],
          trend: "stable",
          trendValue: `+${Math.floor(Math.random() * 10)}%`,
          relevanceScore: Math.floor(Math.random() * 25) + 60,
          difficulty: Math.floor(Math.random() * 30) + 30,
          opportunity: Math.floor(Math.random() * 35) + 50,
          relatedTerms: [`affordable ${term}`, `budget ${term}`, `${term} deals`],
        },
      ]

      setSuggestions([...filtered, ...generated])
      setLoading(false)
    }, 1000)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    performSearch(searchTerm)
  }

  const toggleKeywordSelection = (keyword) => {
    setSelectedSuggestions((prev) => {
      const isSelected = prev.find((k) => k.keyword === keyword.keyword)
      if (isSelected) {
        return prev.filter((k) => k.keyword !== keyword.keyword)
      } else {
        return [...prev, { ...keyword, matchType: "broad", bid: keyword.cpc }]
      }
    })
  }

  const getCompetitionColor = (competition) => {
    switch (competition) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={14} className="text-green-600" />
      case "down":
        return <TrendingDown size={14} className="text-red-600" />
      default:
        return <div className="w-3.5 h-3.5 bg-gray-400 rounded-full"></div>
    }
  }

  const sortedSuggestions = [...suggestions].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case "searchVolume":
        aValue = a.searchVolume
        bValue = b.searchVolume
        break
      case "cpc":
        aValue = Number.parseFloat(a.cpc)
        bValue = Number.parseFloat(b.cpc)
        break
      case "competition":
        const competitionOrder = { low: 1, medium: 2, high: 3 }
        aValue = competitionOrder[a.competition]
        bValue = competitionOrder[b.competition]
        break
      case "relevance":
        aValue = a.relevanceScore
        bValue = b.relevanceScore
        break
      default:
        return 0
    }

    return sortOrder === "desc" ? bValue - aValue : aValue - bValue
  })

  const filteredSuggestions = sortedSuggestions.filter((keyword) => {
    return (
      keyword.searchVolume >= filters.minSearchVolume &&
      keyword.searchVolume <= filters.maxSearchVolume &&
      Number.parseFloat(keyword.cpc) >= filters.minCpc &&
      Number.parseFloat(keyword.cpc) <= filters.maxCpc &&
      (filters.competition === "all" || keyword.competition === filters.competition)
    )
  })

  const handleAddSelected = () => {
    onKeywordsSelect(selectedSuggestions)
    setSelectedSuggestions([])
    onClose()
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Auto-search based on product context
  useEffect(() => {
    if (productContext && productContext.title) {
      setSearchTerm(productContext.title)
      performSearch(productContext.title)
    }
  }, [productContext])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Lightbulb className="text-blue-600 mr-3" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Keyword Research Tool</h2>
              <p className="text-sm text-gray-600">Discover high-performing keywords for your campaigns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter a keyword or product name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Search size={16} className="mr-2" />
              )}
              Search
            </button>
          </form>
        </div>

        {/* Tabs and Controls */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: "suggestions", label: "Suggestions", icon: Lightbulb },
              { id: "trends", label: "Trends", icon: TrendingUp },
              { id: "competitors", label: "Competitors", icon: Target },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-")
                setSortBy(field)
                setSortOrder(order)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="searchVolume-desc">Search Volume (High to Low)</option>
              <option value="searchVolume-asc">Search Volume (Low to High)</option>
              <option value="cpc-desc">CPC (High to Low)</option>
              <option value="cpc-asc">CPC (Low to High)</option>
              <option value="relevance-desc">Relevance (High to Low)</option>
              <option value="competition-asc">Competition (Low to High)</option>
            </select>

            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              <Filter size={16} className="mr-2" />
              Filters
            </button>

            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "suggestions" && (
            <div className="h-full flex">
              {/* Keywords List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Researching keywords...</p>
                    </div>
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No keywords found</p>
                      <p className="text-sm text-gray-500">Try searching for a different term</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600">Found {filteredSuggestions.length} keywords</p>
                      {selectedSuggestions.length > 0 && (
                        <span className="text-sm text-blue-600 font-medium">{selectedSuggestions.length} selected</span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {filteredSuggestions.map((keyword, index) => {
                        const isSelected = selectedSuggestions.find((k) => k.keyword === keyword.keyword)

                        return (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => toggleKeywordSelection(keyword)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div
                                  className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                    isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className="font-medium text-gray-900">{keyword.keyword}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getTrendIcon(keyword.trend)}
                                <span
                                  className={`text-xs ${keyword.trend === "up" ? "text-green-600" : keyword.trend === "down" ? "text-red-600" : "text-gray-600"}`}
                                >
                                  {keyword.trendValue}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-500 mb-1">Search Volume</div>
                                <div className="font-semibold flex items-center">
                                  <Eye size={14} className="mr-1 text-gray-400" />
                                  {keyword.searchVolume.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500 mb-1">Avg CPC</div>
                                <div className="font-semibold flex items-center">
                                  <DollarSign size={14} className="mr-1 text-gray-400" />
                                  {keyword.cpc}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500 mb-1">Competition</div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(keyword.competition)}`}
                                >
                                  {keyword.competition}
                                </span>
                              </div>
                              <div>
                                <div className="text-gray-500 mb-1">Opportunity</div>
                                <div className="flex items-center">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                                    <div
                                      className="h-full bg-green-500 rounded-full"
                                      style={{ width: `${keyword.opportunity}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium">{keyword.opportunity}%</span>
                                </div>
                              </div>
                            </div>

                            {keyword.relatedTerms && keyword.relatedTerms.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-500 mb-2">Related terms:</div>
                                <div className="flex flex-wrap gap-1">
                                  {keyword.relatedTerms.slice(0, 3).map((term, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                      {term}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar with insights */}
              <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Keyword Insights</h3>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="text-blue-600 mr-2" size={16} />
                      <span className="font-medium text-sm">Search Trends</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Keywords in this category are trending upward with 15% average growth
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2">
                      <Zap className="text-yellow-600 mr-2" size={16} />
                      <span className="font-medium text-sm">Quick Wins</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      3 low-competition keywords with high search volume identified
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="text-orange-600 mr-2" size={16} />
                      <span className="font-medium text-sm">Recommendations</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Consider long-tail variations for better conversion rates
                    </div>
                  </div>
                </div>

                {selectedSuggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Selected Keywords</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedSuggestions.map((keyword, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                        >
                          <span className="truncate">{keyword.keyword}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleKeywordSelection(keyword)
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="p-6 text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Keyword Trends</h3>
              <p className="text-gray-500">Historical search volume and trend analysis coming soon</p>
            </div>
          )}

          {activeTab === "competitors" && (
            <div className="p-6 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Competitor Analysis</h3>
              <p className="text-gray-500">Competitor keyword analysis and gap identification coming soon</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedSuggestions.length > 0 && <span>{selectedSuggestions.length} keywords selected</span>}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedSuggestions.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Selected ({selectedSuggestions.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeywordResearchTool
