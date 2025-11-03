"use client"

import { useState } from "react"
import { Calendar, DollarSign, Target, Settings, Plus, Lightbulb } from "lucide-react"
import KeywordInput from "../KeywordResearch/KeywordInput"

const EnhancedSponsoredProductsForm = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    campaignName: "",
    dailyBudget: "",
    startDate: "",
    endDate: "",
    targetingType: "AUTO",
    bidStrategy: "DYNAMIC_BID_DOWN_ONLY",
    products: [],
    keywords: [],
    negativeKeywords: [],
    placement: {
      topOfSearch: true,
      productPages: true,
      restOfSearch: true,
    },
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Mock product context for keyword suggestions
  const productContext = {
    title: "Wireless Bluetooth Headphones",
    category: "Electronics",
    brand: "TechBrand",
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  const handleKeywordsChange = (keywords) => {
    setFormData((prev) => ({ ...prev, keywords }))
  }

  const handleNegativeKeywordsChange = (negativeKeywords) => {
    setFormData((prev) => ({ ...prev, negativeKeywords }))
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 <= currentStep
                ? "bg-blue-600 text-white"
                : i + 1 === currentStep + 1
                  ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${i + 1 < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="mr-2 text-blue-600" size={20} />
          Campaign Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
            <input
              type="text"
              value={formData.campaignName}
              onChange={(e) => handleInputChange("campaignName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Budget *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="number"
                value={formData.dailyBudget}
                onChange={(e) => handleInputChange("dailyBudget", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="mr-2 text-blue-600" size={20} />
          Targeting Strategy
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Targeting Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.targetingType === "AUTO"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleInputChange("targetingType", "AUTO")}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    checked={formData.targetingType === "AUTO"}
                    onChange={() => handleInputChange("targetingType", "AUTO")}
                    className="mr-2"
                  />
                  <span className="font-medium">Automatic Targeting</span>
                </div>
                <p className="text-sm text-gray-600">Amazon automatically targets relevant keywords and products</p>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.targetingType === "MANUAL"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleInputChange("targetingType", "MANUAL")}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    checked={formData.targetingType === "MANUAL"}
                    onChange={() => handleInputChange("targetingType", "MANUAL")}
                    className="mr-2"
                  />
                  <span className="font-medium">Manual Targeting</span>
                </div>
                <p className="text-sm text-gray-600">You choose specific keywords and products to target</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bidding Strategy</label>
            <select
              value={formData.bidStrategy}
              onChange={(e) => handleInputChange("bidStrategy", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DYNAMIC_BID_DOWN_ONLY">Dynamic bids - down only</option>
              <option value="DYNAMIC_BID_UP_AND_DOWN">Dynamic bids - up and down</option>
              <option value="FIXED_BID">Fixed bids</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Product Selection</h3>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Plus className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-gray-600 mb-2">Add Products to Campaign</h4>
          <p className="text-gray-500 mb-4">Select products from your catalog to advertise</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Browse Products
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      {formData.targetingType === "MANUAL" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="mr-2 text-blue-600" size={20} />
            Keywords & Targeting
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Target Keywords</label>
                <div className="flex items-center text-sm text-gray-500">
                  <Lightbulb size={14} className="mr-1" />
                  Use our research tool for better results
                </div>
              </div>
              <KeywordInput
                keywords={formData.keywords}
                onKeywordsChange={handleKeywordsChange}
                placeholder="Enter target keywords..."
                productContext={productContext}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Negative Keywords</label>
              <KeywordInput
                keywords={formData.negativeKeywords}
                onKeywordsChange={handleNegativeKeywordsChange}
                placeholder="Enter negative keywords..."
                showResearchTool={false}
              />
              <p className="text-xs text-gray-500 mt-2">
                Negative keywords prevent your ads from showing for irrelevant searches
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Ad Placement</h3>
        <div className="space-y-3">
          {Object.entries({
            topOfSearch: "Top of search results",
            productPages: "Product detail pages",
            restOfSearch: "Rest of search results",
          }).map(([key, label]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.placement[key]}
                onChange={(e) => handleNestedChange("placement", key, e.target.checked)}
                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Campaign Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Campaign Name:</span>
                <span>{formData.campaignName || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Budget:</span>
                <span>${formData.dailyBudget || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span>{formData.startDate || "Not set"}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Targeting</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span>{formData.targetingType === "AUTO" ? "Automatic" : "Manual"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keywords:</span>
                <span>{formData.keywords.length} keywords</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Negative Keywords:</span>
                <span>{formData.negativeKeywords.length} keywords</span>
              </div>
            </div>
          </div>
        </div>

        {formData.keywords.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">Selected Keywords</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {formData.keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                    <span className="font-medium">{keyword.text}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{keyword.matchType}</span>
                      {keyword.bid && <span className="text-xs text-green-600">${keyword.bid}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 font-medium flex items-center mb-4">
          ← Back to Ad Type Selection
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Sponsored Products Campaign</h1>
      </div>

      <StepIndicator />

      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => onSubmit(formData)}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Campaign
          </button>
        )}
      </div>
    </div>
  )
}

export default EnhancedSponsoredProductsForm
