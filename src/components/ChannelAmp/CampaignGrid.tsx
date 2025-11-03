"use client"

import { useState } from "react"
import { MoreHorizontal, Play, Pause, Archive, Copy, Edit } from "lucide-react"

const CampaignGrid = ({ campaigns, loading = false }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showActionMenu, setShowActionMenu] = useState(null)

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const ActionMenu = ({ campaign, onClose }) => (
    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 min-w-[150px]">
      <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center">
        <Edit size={14} className="mr-2" />
        Edit Campaign
      </button>
      <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center">
        <Copy size={14} className="mr-2" />
        Duplicate
      </button>
      <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center">
        {campaign.status === "Active" ? <Pause size={14} className="mr-2" /> : <Play size={14} className="mr-2" />}
        {campaign.status === "Active" ? "Pause" : "Resume"}
      </button>
      <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600">
        <Archive size={14} className="mr-2" />
        Archive
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Remove all grid view logic and viewMode controls, keep only the table/list view
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Campaigns</h3>
      </div>

      {/* Keep only the table view */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impressions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROAS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{campaign.adType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(campaign.spend)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(campaign.impressions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(campaign.clicks)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(campaign.cpc)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.roas}x</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    <button
                      onClick={() => setShowActionMenu(showActionMenu === campaign.id ? null : campaign.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {showActionMenu === campaign.id && (
                      <ActionMenu campaign={campaign} onClose={() => setShowActionMenu(null)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CampaignGrid
