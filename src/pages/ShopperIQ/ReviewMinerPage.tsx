import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchWorkspaces } from "../../redux/slices/workspaceViewSlice"
import FilterBar from "../../components/ShopperIQ/Review-content-miner/FilterBar"
import WordCloudTree from "../../components/ShopperIQ/Review-content-miner/WordCloudTree"
import ReviewGrid from "../../components/ShopperIQ/Review-content-miner/ReviewGrid"

const ReviewMinerPage = () => {
  const dispatch = useDispatch()
  const currentWorkspace = useSelector((state) => state.workspaceView.currentWorkspace)

  const [filters, setFilters] = useState({
    retailer: "",
    brand: "",
    productTitle: "",
    rating: { min: 1, max: 5 },
    dateRange: { start: new Date("2025-01-01"), end: new Date("2025-12-31") },
    dateOption: "custom",
  })
  const [selectedWord, setSelectedWord] = useState(null)
  const [treeData, setTreeData] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isWordCloudExpanded, setIsWordCloudExpanded] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    dispatch(fetchWorkspaces())
  }, [dispatch])

  useEffect(() => {
    const retailerIds = currentWorkspace?.settings
      ?.map((setting) => setting.retailer?.retailer_id)
      ?.filter(Boolean)
      ?.join(",")
    console.log("Syncing retailer filter:", retailerIds)
    setFilters((prev) => ({
      ...prev,
      retailer: retailerIds || "",
    }))
  }, [currentWorkspace])

  useEffect(() => {
    console.log("ReviewMinerPage filters:", filters)
  }, [filters])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleWordCloud = () => {
    setIsWordCloudExpanded(!isWordCloudExpanded)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col w-full">
        <div className="flex-1 p-2 sm:p-3 md:p-4">
          <WordCloudTree
            selectedWord={selectedWord}
            setSelectedWord={setSelectedWord}
            filters={filters}
            treeData={treeData}
            setTreeData={setTreeData}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 w-full">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 z-40 lg:hidden transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl z-50 transition-all duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } w-56 sm:w-64 md:w-72 border-r border-gray-200`}
      >
        <div className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <svg
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-xs sm:text-sm md:text-base">
                Filters & Search
              </h2>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-2 sm:p-3 overflow-y-auto h-full pb-12 sm:pb-16">
          <FilterBar filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <div className="flex min-h-screen w-full">
        <div
          className={`hidden lg:flex flex-col bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out border-r border-gray-200 shadow-xl ${
            isSidebarOpen ? "w-56 lg:w-64 xl:w-64" : "w-0 overflow-hidden"
          }`}
        >
          <div className="p-2 lg:p-3  text-gray-800 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="p-1 lg:p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg
                    className="h-3.5 w-3.5  lg:h-4 lg:w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-xs lg:text-sm xl:text-base">
                    Filters & Search
                  </h2>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 lg:p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="h-3.5 w-3.5 hover:bg-gray-200 lg:h-4 lg:w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-2 lg:p-3 overflow-auto">
            <FilterBar filters={filters} setFilters={setFilters} />
          </div>
        </div>

        <div className="flex-1 flex flex-col w-full transition-all duration-300 ease-in-out">
          <header className="bg-white/95 backdrop-blur-xl px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {!isSidebarOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 sm:p-2 hover:bg-indigo-50 rounded-lg transition-all duration-200 hidden lg:flex group"
                  >
                    <svg
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 group-hover:text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 sm:p-2 hover:bg-indigo-50 rounded-lg transition-all duration-200 lg:hidden group"
                >
                  <svg
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 group-hover:text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </button>
                <div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                    Review Miner
                  </h1>
                  <p className="text-gray-600 mt-0.5 font-medium text-xs sm:text-sm">
                    Discover insights from customer reviews with intelligent sentiment analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded-full">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-700">
                    Live Data
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-2 sm:p-3 space-y-3 sm:space-y-4 overflow-auto w-full">
            <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-200 overflow-hidden w-full">
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="p-1 sm:p-1.5 bg-emerald-100 rounded-lg">
                      <svg
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                        {selectedWord ? "Sentiment Analysis Tree" : "Interactive Word Cloud"}
                      </h2>
                      <p className="text-xs text-gray-600">
                        {selectedWord
                          ? "Explore word relationships and sentiment patterns"
                          : "Click on words to analyze sentiment"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {selectedWord && (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <svg
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Analyzing: {selectedWord}
                      </span>
                    )}
                    <button
                      onClick={toggleWordCloud}
                      className="p-1 sm:p-1.5 hover:bg-white/50 rounded-lg transition-all duration-200 group"
                    >
                      <svg
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 group-hover:text-indigo-600 transition-all duration-300 ${
                          isWordCloudExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {isWordCloudExpanded && (
                <div className="p-2 sm:p-3">
                  <div className="h-[45vh] sm:h-[40vh] md:h-[56vh] rounded-lg bg-gradient-to-br from-gray-50 to-indigo-50 border border-gray-200 w-full">
                    <WordCloudTree
                      selectedWord={selectedWord}
                      setSelectedWord={setSelectedWord}
                      filters={filters}
                      treeData={treeData}
                      setTreeData={setTreeData}
                      isFullscreen={isFullscreen}
                      toggleFullscreen={toggleFullscreen}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-200 overflow-hidden w-full">
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-200">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="p-1 sm:p-1.5 bg-purple-100 rounded-lg">
                    <svg
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                      Review Analysis
                    </h2>
                    <p className="text-xs text-gray-600">
                      Detailed customer feedback and insights
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2 sm:p-3">
                <div className="rounded-lg bg-white border border-gray-200 w-full">
                  <ReviewGrid
                    filters={filters}
                    selectedWord={selectedWord}
                    treeData={treeData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewMinerPage