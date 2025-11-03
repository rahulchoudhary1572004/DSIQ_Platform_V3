import { useState, useEffect } from "react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    productStats: {
      totalProducts: 1247,
      activeProducts: 1156,
      draftProducts: 91,
      categories: 23,
      completionRate: 87,
    },
    retailerReadiness: [
      {
        name: "Amazon",
        ready: 892,
        total: 1156,
        percentage: 77,
        color: "#FF9500",
      },
      {
        name: "Walmart",
        ready: 734,
        total: 1156,
        percentage: 63,
        color: "#004C91",
      },
      {
        name: "Target",
        ready: 623,
        total: 1156,
        percentage: 54,
        color: "#CC0000",
      },
      {
        name: "Best Buy",
        ready: 445,
        total: 1156,
        percentage: 38,
        color: "#FFE100",
      },
      {
        name: "Home Depot",
        ready: 567,
        total: 1156,
        percentage: 49,
        color: "#F96302",
      },
      {
        name: "Costco",
        ready: 389,
        total: 1156,
        percentage: 34,
        color: "#E31837",
      },
    ],
    dataQuality: {
      overall: 87,
      categories: [
        { name: "Product Titles", score: 95 },
        { name: "Descriptions", score: 82 },
        { name: "Images", score: 78 },
        { name: "Specifications", score: 91 },
        { name: "Pricing", score: 96 },
        { name: "Categories", score: 88 },
      ],
    },
    syndicationStats: {
      successfulSyncs: 2847,
      pendingSyncs: 156,
      failedSyncs: 23,
      lastSyncTime: "2 hours ago",
    },
    channelPerformance: [
      { channel: "Amazon", growth: 12.5, status: "active" },
      { channel: "Walmart", growth: 8.3, status: "active" },
      { channel: "Target", growth: -2.1, status: "active" },
      { channel: "Best Buy", growth: 15.7, status: "active" },
    ],
    recentActivity: [
      {
        action: 'Product "Wireless Headphones Pro" updated',
        time: "5 minutes ago",
        type: "update",
      },
      {
        action: "Bulk sync to Amazon completed",
        time: "1 hour ago",
        type: "sync",
      },
      {
        action: "23 new products added to Electronics category",
        time: "3 hours ago",
        type: "create",
      },
      {
        action: "Walmart catalog sync failed - missing SKUs",
        time: "4 hours ago",
        type: "error",
      },
      {
        action: "Data quality report generated",
        time: "6 hours ago",
        type: "report",
      },
    ],
    assets: {
      totalAssets: 5643,
      images: 4521,
      videos: 234,
      documents: 888,
      storageUsed: 78,
    },
  });

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return "#10B981";
    if (percentage >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "update":
        return "✏️";
      case "sync":
        return "🔄";
      case "create":
        return "➕";
      case "error":
        return "⚠️";
      case "report":
        return "📊";
      default:
        return "📝";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">PIM Dashboard</h1>
        <p className="text-sm text-gray-600">
          Monitor your product information and syndication performance
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.productStats.totalProducts.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="text-lg">📦</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600 font-medium">
              +12% from last month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Data Quality</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.dataQuality.overall}%
              </p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <span className="text-lg">✅</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-green-600 font-medium">
              +3% improvement
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">
                Active Channels
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.channelPerformance.length}
              </p>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <span className="text-lg">🏪</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-blue-600 font-medium">
              2 new this month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Pending Syncs</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.syndicationStats.pendingSyncs}
              </p>
            </div>
            <div className="bg-orange-100 p-2 rounded-full">
              <span className="text-lg">⏳</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-600">
              Last sync: {dashboardData.syndicationStats.lastSyncTime}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Retailer Readiness */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Retailer Readiness
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Product syndication readiness by retailer
              </p>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {dashboardData.retailerReadiness.map((retailer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: retailer.color }}
                      ></div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {retailer.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {retailer.ready} of {retailer.total} products ready
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-base font-semibold"
                        style={{ color: getStatusColor(retailer.percentage) }}
                      >
                        {retailer.percentage}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${retailer.percentage}%`,
                            backgroundColor: getStatusColor(
                              retailer.percentage
                            ),
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Channel Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Channel Performance
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Sales performance across retail channels
              </p>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs">
                        Channel
                      </th>
                      <th className="text-center py-2 px-3 font-medium text-gray-700 text-xs">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.channelPerformance.map((channel, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-3 font-medium text-gray-900 text-sm">
                          {channel.channel}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Data Quality Score */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Data Quality
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Product information completeness
              </p>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData.dataQuality.overall}%
                </div>
                <div className="text-xs text-gray-600">Overall Score</div>
              </div>
              <div className="space-y-2">
                {dashboardData.dataQuality.categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-700">
                      {category.name}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${category.score}%`,
                            backgroundColor: getStatusColor(category.score),
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-6">
                        {category.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Latest system updates
              </p>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                  <div className="text-lg mb-1">➕</div>
                  <div className="text-xs font-medium text-blue-700">
                    Add Product
                  </div>
                </button>
                <button className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
                  <div className="text-lg mb-1">🔄</div>
                  <div className="text-xs font-medium text-green-700">
                    Sync All
                  </div>
                </button>
                <button className="p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                  <div className="text-lg mb-1">📊</div>
                  <div className="text-xs font-medium text-purple-700">
                    Generate Report
                  </div>
                </button>
                <button className="p-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
                  <div className="text-lg mb-1">📤</div>
                  <div className="text-xs font-medium text-orange-700">
                    Bulk Export
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
