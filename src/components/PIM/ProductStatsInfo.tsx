import { useState } from "react";
import { Info, X, Grid3X3, CheckCircle, Upload, AlertCircle } from "lucide-react";

const ProductStatsInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const stats = [
    { title: "Total Products", value: "1,247", icon: Grid3X3, color: "blue" },
    {
      title: "Active Products",
      value: "1,156",
      icon: CheckCircle,
      color: "green",
    },
    { title: "Syndicated", value: "892", icon: Upload, color: "blue" },
    {
      title: "Avg. Completeness",
      value: "82%",
      icon: AlertCircle,
      color: "amber",
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-7 h-7 text-gray-500 hover:text-[#DD522C] hover:bg-gray-100 rounded-full transition-all duration-200"
        title="View Product Statistics"
        aria-label="View Product Statistics"
      >
        <Info className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl border border-gray-100 relative animate-slideUp">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all"
              aria-label="Close statistics"
              title="Close statistics"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Info className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Product Statistics
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Overview of your product catalog performance
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${
                          stat.color === "green"
                            ? "from-green-500 to-green-600"
                            : stat.color === "amber"
                            ? "from-amber-500 to-amber-600"
                            : "from-blue-500 to-blue-600"
                        }`}
                      >
                        <stat.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p
                          className={`text-4xl font-bold ${
                            stat.color === "green"
                              ? "text-green-600"
                              : stat.color === "amber"
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        >
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      stat.color === "green"
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : stat.color === "amber"
                        ? "bg-gradient-to-r from-amber-500 to-amber-600"
                        : "bg-gradient-to-r from-blue-500 to-blue-600"
                    }`} {...{ style: { width: stat.color === "amber" ? "82%" : "90%" } }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Last updated: Just now</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductStatsInfo;
