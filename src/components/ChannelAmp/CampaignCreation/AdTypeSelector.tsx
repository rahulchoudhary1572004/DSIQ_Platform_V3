"use client"

import { useState } from "react"
import { Target, Eye, ShoppingBag, Tv, ArrowRight, Info } from "lucide-react"

const AdTypeSelector = ({ onAdTypeSelect, selectedAdType }) => {
  const [hoveredType, setHoveredType] = useState(null)

  const adTypes = [
    {
      id: "SP",
      name: "Sponsored Products",
      icon: Target,
      description: "Promote individual product listings",
      features: ["Keyword targeting", "Product targeting", "Automatic targeting"],
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
      recommended: true,
    },
    {
      id: "SB",
      name: "Sponsored Brands",
      icon: Eye,
      description: "Showcase your brand and product portfolio",
      features: ["Custom headline", "Brand logo", "Multiple products"],
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
    },
    {
      id: "SD",
      name: "Sponsored Display",
      icon: ShoppingBag,
      description: "Re-engage shoppers on and off Amazon",
      features: ["Audience targeting", "Product targeting", "Retargeting"],
      color: "from-green-500 to-green-600",
      hoverColor: "from-green-600 to-green-700",
    },
    {
      id: "STV",
      name: "Sponsored TV",
      icon: Tv,
      description: "Reach customers through streaming TV",
      features: ["Video ads", "Broad reach", "Brand awareness"],
      color: "from-orange-500 to-orange-600",
      hoverColor: "from-orange-600 to-orange-700",
      beta: true,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
        <p className="text-gray-600">Choose your advertising type to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedAdType === type.id
          const isHovered = hoveredType === type.id

          return (
            <div
              key={type.id}
              className={`relative cursor-pointer transition-all duration-300 transform ${
                isHovered ? "scale-105" : "scale-100"
              }`}
              onMouseEnter={() => setHoveredType(type.id)}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => onAdTypeSelect(type.id)}
            >
              <div
                className={`relative overflow-hidden rounded-xl p-6 h-80 bg-gradient-to-br ${
                  isHovered ? type.hoverColor : type.color
                } text-white shadow-lg ${isSelected ? "ring-4 ring-white ring-opacity-60" : ""}`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white"></div>
                </div>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {type.recommended && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                  {type.beta && (
                    <span className="bg-orange-400 text-orange-900 text-xs px-2 py-1 rounded-full font-medium">
                      Beta
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-4">
                    <Icon size={48} className="mb-3" />
                    <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                    <p className="text-sm opacity-90">{type.description}</p>
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-2">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{type.id}</span>
                    <ArrowRight
                      size={20}
                      className={`transition-transform duration-300 ${isHovered ? "translate-x-1" : "translate-x-0"}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Need help choosing?</h4>
            <p className="text-sm text-blue-700">
              Sponsored Products (SP) is recommended for beginners. It's the most straightforward way to promote
              individual products and drive sales.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdTypeSelector
