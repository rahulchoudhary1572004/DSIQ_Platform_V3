"use client"

import { useState } from "react"
import { Search, Plus, X, Eye, DollarSign, Lightbulb } from "lucide-react"
import KeywordResearchTool from "./KeywordResearchTool"

const KeywordInput = ({
  keywords = [],
  onKeywordsChange,
  placeholder = "Enter keywords...",
  showResearchTool = true,
  productContext = null,
}) => {
  const [inputValue, setInputValue] = useState("")
  const [showResearchModal, setShowResearchModal] = useState(false)

  const addKeyword = (keywordText, matchType = "BROAD", bid = "") => {
    if (!keywordText.trim()) return

    const newKeyword = {
      text: keywordText.trim(),
      matchType,
      bid: bid || "",
      id: Date.now() + Math.random(),
    }

    // Check if keyword already exists
    const exists = keywords.find((k) => k.text.toLowerCase() === newKeyword.text.toLowerCase())
    if (!exists) {
      onKeywordsChange([...keywords, newKeyword])
    }

    setInputValue("")
  }

  const removeKeyword = (keywordId) => {
    onKeywordsChange(keywords.filter((k) => k.id !== keywordId))
  }

  const updateKeyword = (keywordId, field, value) => {
    onKeywordsChange(keywords.map((k) => (k.id === keywordId ? { ...k, [field]: value } : k)))
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addKeyword(inputValue)
    }
  }

  const handleResearchResults = (selectedKeywords) => {
    const newKeywords = selectedKeywords.map((k) => ({
      text: k.keyword,
      matchType: k.matchType || "BROAD",
      bid: k.bid || k.cpc || "",
      id: Date.now() + Math.random(),
      searchVolume: k.searchVolume,
      cpc: k.cpc,
      competition: k.competition,
    }))

    // Filter out duplicates
    const existingTexts = keywords.map((k) => k.text.toLowerCase())
    const uniqueKeywords = newKeywords.filter((k) => !existingTexts.includes(k.text.toLowerCase()))

    onKeywordsChange([...keywords, ...uniqueKeywords])
  }

  const getMatchTypeColor = (matchType) => {
    switch (matchType) {
      case "EXACT":
        return "bg-red-100 text-red-800"
      case "PHRASE":
        return "bg-yellow-100 text-yellow-800"
      case "BROAD":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => addKeyword(inputValue)}
          disabled={!inputValue.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add
        </button>
        {showResearchTool && (
          <button
            onClick={() => setShowResearchModal(true)}
            className="px-4 py-2.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center"
          >
            <Lightbulb size={16} className="mr-2" />
            Research
          </button>
        )}
      </div>

      {/* Keywords List */}
      {keywords.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Keywords ({keywords.length})</h4>
            <div className="text-sm text-gray-500">
              Est. total search volume: {keywords.reduce((sum, k) => sum + (k.searchVolume || 0), 0).toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            {keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {/* Keyword Text */}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{keyword.text}</div>
                  {keyword.searchVolume && (
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                      <span className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {keyword.searchVolume.toLocaleString()} searches
                      </span>
                      {keyword.cpc && (
                        <span className="flex items-center">
                          <DollarSign size={12} className="mr-1" />${keyword.cpc} CPC
                        </span>
                      )}
                      {keyword.competition && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            keyword.competition === "low"
                              ? "bg-green-100 text-green-700"
                              : keyword.competition === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {keyword.competition} comp
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Match Type */}
                <select
                  value={keyword.matchType}
                  onChange={(e) => updateKeyword(keyword.id, "matchType", e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BROAD">Broad</option>
                  <option value="PHRASE">Phrase</option>
                  <option value="EXACT">Exact</option>
                </select>

                {/* Match Type Badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchTypeColor(keyword.matchType)}`}>
                  {keyword.matchType}
                </span>

                {/* Bid Input */}
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2 text-gray-400" size={12} />
                  <input
                    type="number"
                    value={keyword.bid}
                    onChange={(e) => updateKeyword(keyword.id, "bid", e.target.value)}
                    placeholder="Bid"
                    className="w-20 pl-6 pr-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeKeyword(keyword.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {keywords.length === 0 && productContext && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Lightbulb className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Keyword Suggestions</h4>
              <p className="text-sm text-blue-700 mb-3">
                Based on your product "{productContext.title}", here are some keyword ideas:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  productContext.title,
                  `${productContext.title} best`,
                  `${productContext.title} reviews`,
                  `buy ${productContext.title}`,
                  `${productContext.title} deals`,
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addKeyword(suggestion)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Research Tool Modal */}
      <KeywordResearchTool
        isOpen={showResearchModal}
        onClose={() => setShowResearchModal(false)}
        onKeywordsSelect={handleResearchResults}
        selectedKeywords={keywords}
        productContext={productContext}
      />
    </div>
  )
}

export default KeywordInput
