// components/DAM/DAMSearchFilters_Design5.tsx - AI Autocomplete Style
import { FC, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X, Search, Zap, Command } from "lucide-react";
import { DigitalAsset, SearchFilters } from "../../types/dam.types";

type AssetType = "image" | "video" | "document" | "archive";

interface DAMSearchFiltersState extends SearchFilters {
  tags?: string[];
  isFavorite?: boolean;
  hasDownloads?: boolean;
  fileSize?: "small" | "medium" | "large" | "all";
  views?: "popular" | "recent" | "all";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const suggestions = [
    { icon: "📦", label: "Images only", action: () => setAssetType("image") },
    { icon: "🎬", label: "Videos only", action: () => setAssetType("video") },
    { icon: "⭐", label: "Favorites", action: () => setIsFavorite(true) },
    { icon: "📥", label: "Downloaded only", action: () => setHasDownloads(true) },
    { icon: "💾", label: "Large files", action: () => setFileSize("large") },
  ];

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
    };
    onFilterChange(filters);
  }, [searchTerm, assetType, startDate, endDate, uploadedBy, tags, isFavorite, fileSize, views, hasDownloads, onFilterChange]);

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
    hasDownloads;

  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/20 z-30" />}

      <div
        className={`fixed inset-x-0 top-20 mx-auto z-40 w-full max-w-3xl transition-all duration-300 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Input */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search by name, type, or filter..."
              className="flex-1 outline-none text-lg bg-transparent text-gray-900 placeholder-gray-400"
            />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Quick Filters</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sug.action();
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-900 group"
                  >
                    <span>{sug.icon}</span>
                    {sug.label}
                  </button>
                ))}
              </div>

              {/* Advanced Options */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Filters</p>

                {/* Type Selector */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">TYPE</p>
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

                {/* Size Selector */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">SIZE</p>
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

                {/* Tags */}
                {uniqueTags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">TAGS</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTags.slice(0, 8).map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            tags.includes(tag)
                              ? "bg-gray-900 text-white"
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
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyboard Hint */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Command className="h-3 w-3" />
            <span>Press ESC to close</span>
          </div>
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
