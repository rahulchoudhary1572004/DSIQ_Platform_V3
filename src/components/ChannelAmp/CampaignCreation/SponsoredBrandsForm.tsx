"use client"

import { useState } from "react"
import { Upload, ImageIcon, Type, Settings, Eye } from "lucide-react"

const SponsoredBrandsForm = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    campaignName: "",
    dailyBudget: "",
    startDate: "",
    endDate: "",
    brandName: "",
    headline: "",
    brandLogo: null,
    landingPage: "STORE", // STORE, CUSTOM
    customUrl: "",
    products: [],
    keywords: [],
    adFormat: "PRODUCT_COLLECTION", // PRODUCT_COLLECTION, SPOTLIGHT, VIDEO
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 <= currentStep
                ? "bg-purple-600 text-white"
                : i + 1 === currentStep + 1
                  ? "bg-purple-100 text-purple-600 border-2 border-purple-600"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-0.5 mx-2 ${i + 1 < currentStep ? "bg-purple-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="mr-2 text-purple-600" size={20} />
          Campaign Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
            <input
              type="text"
              value={formData.campaignName}
              onChange={(e) => handleInputChange("campaignName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter campaign name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Budget *</label>
            <input
              type="number"
              value={formData.dailyBudget}
              onChange={(e) => handleInputChange("dailyBudget", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0.00"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name *</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => handleInputChange("brandName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your brand name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Ad Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: "PRODUCT_COLLECTION",
              name: "Product Collection",
              description: "Showcase multiple products",
            },
            {
              id: "SPOTLIGHT",
              name: "Spotlight",
              description: "Highlight a single product",
            },
            {
              id: "VIDEO",
              name: "Video",
              description: "Engage with video content",
            },
          ].map((format) => (
            <div
              key={format.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.adFormat === format.id
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleInputChange("adFormat", format.id)}
            >
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  checked={formData.adFormat === format.id}
                  onChange={() => handleInputChange("adFormat", format.id)}
                  className="mr-2"
                />
                <span className="font-medium">{format.name}</span>
              </div>
              <p className="text-sm text-gray-600">{format.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Type className="mr-2 text-purple-600" size={20} />
          Creative Assets
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headline *</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => handleInputChange("headline", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter compelling headline (max 50 characters)"
              maxLength={50}
            />
            <div className="text-right text-xs text-gray-500 mt-1">{formData.headline.length}/50 characters</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-2">Upload your brand logo</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 1MB. Recommended: 400x400px</p>
              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Choose File
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Landing Page</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.landingPage === "STORE"}
                  onChange={() => handleInputChange("landingPage", "STORE")}
                  className="mr-3"
                />
                <span>Amazon Store</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.landingPage === "CUSTOM"}
                  onChange={() => handleInputChange("landingPage", "CUSTOM")}
                  className="mr-3"
                />
                <span>Custom URL</span>
              </label>
              {formData.landingPage === "CUSTOM" && (
                <input
                  type="url"
                  value={formData.customUrl}
                  onChange={(e) => handleInputChange("customUrl", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ml-6"
                  placeholder="https://example.com"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Products & Keywords</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Featured Products</h4>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-2">Add products to feature</p>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Select Products
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Keywords</h4>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Type className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600 mb-2">Add targeting keywords</p>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Add Keywords
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Eye className="mr-2 text-purple-600" size={20} />
          Preview & Summary
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Campaign Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Campaign Name:</span>
                <span>{formData.campaignName || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brand Name:</span>
                <span>{formData.brandName || "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Budget:</span>
                <span>${formData.dailyBudget || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ad Format:</span>
                <span>{formData.adFormat.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Headline:</span>
                <span>{formData.headline || "Not set"}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-4">Ad Preview</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
                <span className="text-sm font-medium">{formData.brandName || "Brand Name"}</span>
              </div>
              <div className="text-lg font-semibold mb-3">{formData.headline || "Your headline here"}</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={onBack} className="text-purple-600 hover:text-purple-700 font-medium flex items-center mb-4">
          ← Back to Ad Type Selection
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Sponsored Brands Campaign</h1>
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
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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

export default SponsoredBrandsForm
