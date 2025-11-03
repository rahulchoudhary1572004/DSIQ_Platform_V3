"use client"

import { useState } from "react"
import AdTypeSelector from "./AdTypeSelector"
import SponsoredProductsForm from "./SponsoredProductsForm"
import SponsoredBrandsForm from "./SponsoredBrandsForm"
// Import other forms as needed
import { X } from "lucide-react"

const CampaignCreationFlow = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState("adTypeSelection")
  const [selectedAdType, setSelectedAdType] = useState(null)

  const handleAdTypeSelect = (adType) => {
    setSelectedAdType(adType)
    setCurrentStep("campaignForm")
  }

  const handleBack = () => {
    setCurrentStep("adTypeSelection")
    setSelectedAdType(null)
  }

  const handleSubmit = (formData) => {
    const campaignData = {
      adType: selectedAdType,
      ...formData,
    }
    onComplete(campaignData)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "adTypeSelection":
        return <AdTypeSelector onAdTypeSelect={handleAdTypeSelect} selectedAdType={selectedAdType} />

      case "campaignForm":
        switch (selectedAdType) {
          case "SP":
            return <SponsoredProductsForm onBack={handleBack} onSubmit={handleSubmit} />
          case "SB":
            return <SponsoredBrandsForm onBack={handleBack} onSubmit={handleSubmit} />
          case "SD":
            // return <SponsoredDisplayForm onBack={handleBack} onSubmit={handleSubmit} />
            return <div className="text-center p-8">Sponsored Display form coming soon...</div>
          case "STV":
            // return <SponsoredTVForm onBack={handleBack} onSubmit={handleSubmit} />
            return <div className="text-center p-8">Sponsored TV form coming soon...</div>
          default:
            return <div>Unknown ad type</div>
        }

      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Create New Campaign</h1>
          <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{renderCurrentStep()}</div>
      </div>
    </div>
  )
}

export default CampaignCreationFlow
