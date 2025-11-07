// components/DAM/DAMSearchFilters.tsx - Enhanced & Structured
import { FC, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X, Search } from "lucide-react";
import { DigitalAsset, SearchFilters } from "../../types/dam.types";

type AssetType = "image" | "video" | "document" | "archive";

interface DAMSearchFiltersState extends SearchFilters {
  tags?: string[];
  isFavorite?: boolean;
  hasDownloads?: boolean;
  fileSize?: "small" | "medium" | "large" | "all";
  views?: "popular" | "recent" | "all";
  resolution?: "4k" | "hd" | "sd" | "all";
  duration?: "short" | "medium" | "long" | "all";
}

interface DAMSearchFiltersProps {
  assets: DigitalAsset[];
  onFilterChange: (filters: DAMSearchFiltersState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DAMSearchFilters: FC<DAMSearchFiltersProps> = ({ assets, onFilterChange, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assetType, setAssetType] = useState<AssetType | "all">("all");
  const [fileSize, setFileSize] = useState<"small" | "medium" | "large" | "all">("all");
  const [uploadedBy, setUploadedBy] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasDownloads, setHasDownloads] = useState(false);
  const [views, setViews] = useState<"popular" | "recent" | "all">("all");
  const [resolution, setResolution] = useState<"4k" | "hd" | "sd" | "all">("all");
  const [duration, setDuration] = useState<"short" | "medium" | "long" | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const lastNonEmptyAssetsRef = useRef<DigitalAsset[] | null>(null);

  useEffect(() => {
    if (assets && assets.length > 0) lastNonEmptyAssetsRef.current = assets;
  }, [assets]);

  const dataSource = useMemo(() => {
    return assets && assets.length > 0 ? assets : lastNonEmptyAssetsRef.current ?? [];
  }, [assets]);

  const uniqueUploaders = useMemo(
    () => Array.from(new Set(dataSource.map((a) => a.uploadedBy))).filter(Boolean),
    [dataSource]
  );
  const uniqueTags = useMemo(
    () => Array.from(new Set(dataSource.flatMap((a) => a.tags || []))).filter(Boolean),
    [dataSource]
  );

  useEffect(() => {
    const filters: DAMSearchFiltersState = {
      searchTerm,
      assetType,
      dateRange: { startDate, endDate },
      uploader: uploadedBy,
      tags,
      isFavorite,
      fileSize,
      views,
      hasDownloads,
      resolution,
      duration,
    };
    onFilterChange(filters);
  }, [searchTerm, assetType, startDate, endDate, uploadedBy, tags, isFavorite, fileSize, views, hasDownloads, resolution, duration, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setAssetType("all");
    setStartDate("");
    setEndDate("");
    setUploadedBy("");
    setTags([]);
    setIsFavorite(false);
    setFileSize("all");
    setViews("all");
    setHasDownloads(false);
    setResolution("all");
    setDuration("all");
  }, []);

  const hasFilters =
    Boolean(searchTerm) ||
    assetType !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(uploadedBy) ||
    tags.length > 0 ||
    isFavorite ||
    fileSize !== "all" ||
    views !== "all" ||
    hasDownloads ||
    resolution !== "all" ||
    duration !== "all";

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/20 z-30" />
      )}

      <div
        className={`fixed inset-x-0 top-20 mx-auto z-40 w-full max-w-4xl transition-all duration-300 px-4 sm:px-8 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, type, or filter..."
                className="flex-1 outline-none text-lg bg-transparent text-gray-900 placeholder-gray-400"
              />
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Filters Section */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Quick Access</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              <button
                onClick={() => setAssetType(assetType === "image" ? "all" : "image")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  assetType === "image"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setAssetType(assetType === "video" ? "all" : "video")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  assetType === "video"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isFavorite
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                Favorites
              </button>
              <button
                onClick={() => setViews(views === "recent" ? "all" : "recent")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  views === "recent"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setFileSize(fileSize === "large" ? "all" : "large")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  fileSize === "large"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                Large Files
              </button>
            </div>
          </div>

          {/* Main Filters Section */}
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Row 1: Type & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Asset Type</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "image", label: "Image" },
                    { value: "video", label: "Video" },
                    { value: "document", label: "Document" },
                    { value: "archive", label: "Archive" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAssetType(opt.value as AssetType | "all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        assetType === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">File Size</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "small", label: "Small" },
                    { value: "medium", label: "Medium" },
                    { value: "large", label: "Large" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFileSize(opt.value as "small" | "medium" | "large" | "all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        fileSize === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Resolution & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Resolution</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "4k", label: "4K" },
                    { value: "hd", label: "HD" },
                    { value: "sd", label: "SD" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setResolution(opt.value as "4k" | "hd" | "sd" | "all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        resolution === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Duration</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "short", label: "Short" },
                    { value: "medium", label: "Medium" },
                    { value: "long", label: "Long" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value as "short" | "medium" | "long" | "all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        duration === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Sort & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "popular", label: "Popular" },
                    { value: "recent", label: "Recent" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setViews(opt.value as "popular" | "recent" | "all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        views === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Date Range</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Tags Section */}
            {uniqueTags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueTags.slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        tags.includes(tag)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {hasFilters && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white px-4 py-2 rounded-lg transition-all border border-gray-300"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default DAMSearchFilters;
