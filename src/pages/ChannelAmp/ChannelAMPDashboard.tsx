"use client"

import { useState } from "react"
import { Calendar, Filter } from "lucide-react"
import SummaryCard from "../../components/ChannelAmp/SummaryCard"
import CampaignFilters from "../../components/ChannelAmp/CampaignFilters"
import CampaignGrid from "../../components/ChannelAmp/CampaignGrid"
import PerformanceCharts from "../../components/ChannelAmp/PerformanceCharts"
import { DollarSign, Eye, MousePointer, Target, TrendingUp, Percent } from "lucide-react"

const ChannelAMPDashboard = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [adTypes, setAdTypes] = useState(["SP", "SB", "SD", "STV"])
  const [activeAdTypes, setActiveAdTypes] = useState(["SP", "SB"])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  // Mock data - replace with real API calls
  const [summaryData, setSummaryData] = useState({
    totalSpend: 15420.5,
    impressions: 1250000,
    clicks: 8750,
    cpc: 1.76,
    roas: 3.2,
    conversionRate: 12.5,
  })

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Holiday Campaign 2024",
      adType: "SP",
      status: "Active",
      country: "US",
      spend: 2500.0,
      impressions: 125000,
      clicks: 875,
      cpc: 2.86,
      roas: 4.2,
    },
    {
      id: 2,
      name: "Brand Defense Q4",
      adType: "SB",
      status: "Active",
      country: "US",
      spend: 1800.0,
      impressions: 95000,
      clicks: 650,
      cpc: 2.77,
      roas: 3.8,
    },
    {
      id: 3,
      name: "Product Launch UK",
      adType: "SD",
      status: "Paused",
      country: "UK",
      spend: 950.0,
      impressions: 45000,
      clicks: 320,
      cpc: 2.97,
      roas: 2.1,
    },
  ])

  const handleFiltersChange = (filters) => {
    console.log("Filters changed:", filters)
    // Apply filters to campaigns
  }

  const toggleAdType = (adType) => {
    setActiveAdTypes((prev) => (prev.includes(adType) ? prev.filter((type) => type !== adType) : [...prev, adType]))
  }

  const summaryCards = [
    {
      label: "Total Spend",
      value: `$${summaryData.totalSpend.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-blue-600",
      trend: "up",
      trendValue: "+12.5%",
    },
    {
      label: "Impressions",
      value: summaryData.impressions.toLocaleString(),
      icon: Eye,
      color: "bg-green-600",
      trend: "up",
      trendValue: "+8.3%",
    },
    {
      label: "Clicks",
      value: summaryData.clicks.toLocaleString(),
      icon: MousePointer,
      color: "bg-purple-600",
      trend: "up",
      trendValue: "+15.2%",
    },
    {
      label: "CPC",
      value: `$${summaryData.cpc}`,
      icon: Target,
      color: "bg-orange-600",
      trend: "down",
      trendValue: "-5.1%",
    },
    {
      label: "ROAS",
      value: `${summaryData.roas}x`,
      icon: TrendingUp,
      color: "bg-indigo-600",
      trend: "up",
      trendValue: "+18.7%",
    },
    {
      label: "Conversion Rate",
      value: `${summaryData.conversionRate}%`,
      icon: Percent,
      color: "bg-pink-600",
      trend: "up",
      trendValue: "+3.2%",
    },
  ]

  return (
    <div className="h-full bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">ChannelAMP Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Ad Types Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                {adTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleAdType(type)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      activeAdTypes.includes(type) ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {summaryCards.map((card, index) => (
              <SummaryCard
                key={index}
                label={card.label}
                value={card.value}
                icon={card.icon}
                color={card.color}
                trend={card.trend}
                trendValue={card.trendValue}
                loading={loading}
              />
            ))}
          </div>

          {/* Performance Charts */}
          <PerformanceCharts
            data={{
              totalCampaigns: campaigns.length,
              activeCampaigns: campaigns.filter((c) => c.status === "Active").length,
              avgRoas: summaryData.roas,
              totalSpend: summaryData.totalSpend,
            }}
            loading={loading}
          />

          {/* Campaign Grid */}
          <CampaignGrid campaigns={campaigns} loading={loading} />
        </div>
      </div>

      {/* Filter Panel */}
      <CampaignFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  )
}

export default ChannelAMPDashboard