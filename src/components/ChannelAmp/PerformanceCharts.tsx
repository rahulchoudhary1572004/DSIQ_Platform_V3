"use client"

import { useState } from "react"
import { BarChart, LineChart, PieChart, TrendingUp } from "lucide-react"

const PerformanceCharts = ({ data, loading = false }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [chartType, setChartType] = useState("line")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "charts", label: "Charts" },
    { id: "breakdown", label: "Breakdown" },
    { id: "targets", label: "Targets" },
    { id: "settings", label: "Settings" },
  ]

  const chartTypes = [
    { id: "line", label: "Line Chart", icon: LineChart },
    { id: "bar", label: "Bar Chart", icon: BarChart },
    { id: "pie", label: "Pie Chart", icon: PieChart },
  ]

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Performance Overview</h3>
              <div className="flex items-center space-x-2">
                {chartTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`p-2 rounded ${
                      chartType === type.id ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                    }`}
                    title={type.label}
                  >
                    <type.icon size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Placeholder for actual charts - Replace with KendoUI Charts */}
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {chartType === "line" && "Line Chart: Spend vs Clicks vs Sales over time"}
                  {chartType === "bar" && "Bar Chart: ROAS or CPC per campaign"}
                  {chartType === "pie" && "Pie Chart: Spend distribution by Ad Type or Country"}
                </p>
                <p className="text-sm text-gray-400 mt-2">Integrate KendoUI Chart component here</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Total Campaigns</div>
                <div className="text-2xl font-bold text-blue-900">{data?.totalCampaigns || 0}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Active Campaigns</div>
                <div className="text-2xl font-bold text-green-900">{data?.activeCampaigns || 0}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Avg ROAS</div>
                <div className="text-2xl font-bold text-yellow-900">{data?.avgRoas || "0.0"}x</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Total Spend</div>
                <div className="text-2xl font-bold text-purple-900">${data?.totalSpend?.toLocaleString() || "0"}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="text-center py-12">
            <BarChart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Advanced Charts</h3>
            <p className="text-gray-500">Detailed performance charts and analytics</p>
          </div>
        )}

        {activeTab === "breakdown" && (
          <div className="text-center py-12">
            <PieChart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Performance Breakdown</h3>
            <p className="text-gray-500">Detailed breakdown by various dimensions</p>
          </div>
        )}

        {activeTab === "targets" && (
          <div className="text-center py-12">
            <div className="text-lg font-semibold text-gray-600 mb-2">Targets & Goals</div>
            <p className="text-gray-500">Set and track performance targets</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="text-center py-12">
            <div className="text-lg font-semibold text-gray-600 mb-2">Chart Settings</div>
            <p className="text-gray-500">Customize chart appearance and data</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PerformanceCharts
