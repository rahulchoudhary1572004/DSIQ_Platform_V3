import { TrendingUp, TrendingDown } from "lucide-react"

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  color = "bg-purple-600",
  trend = null,
  trendValue = null,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-4 rounded-lg shadow bg-white animate-pulse">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-full ${color} opacity-50`}>
            <div className="w-5 h-5 bg-white/30 rounded"></div>
          </div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg shadow bg-white hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${color} text-white`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">{label}</div>
          <div className="flex items-center space-x-2">
            <div className="text-xl font-semibold text-gray-900">{value}</div>
            {trend && trendValue && (
              <div className={`flex items-center text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? (
                  <TrendingUp size={12} className="mr-1" />
                ) : (
                  <TrendingDown size={12} className="mr-1" />
                )}
                {trendValue}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryCard
