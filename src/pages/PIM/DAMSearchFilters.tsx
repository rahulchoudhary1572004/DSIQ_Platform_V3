import { FC, useEffect, useState, useCallback, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";
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

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// MEMOIZED COLLAPSIBLE SECTION - OUTSIDE COMPONENT
const CollapsibleSection: FC<CollapsibleSectionProps> = ({ 
  title, 
  count, 
  isExpanded, 
  onToggle, 
  children 
}) => (
  <div className="border-b border-slate-200">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-slate-900">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            {count}
          </span>
        )}
      </div>
      <ChevronDown
        className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
      />
    </button>
    {isExpanded && (
      <div className="px-4 py-3 bg-slate-50 space-y-2 border-t border-slate-200">
        {children}
      </div>
    )}
  </div>
);

// MAIN COMPONENT
const DAMSearchFilters: FC<DAMSearchFiltersProps> = ({ 
  assets, 
  onFilterChange, 
  isOpen, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assetType, setAssetType] = useState<AssetType | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [fileSize, setFileSize] = useState<"small" | "medium" | "large" | "all">("all");
  const [views, setViews] = useState<"popular" | "recent" | "all">("all");
  const [hasDownloads, setHasDownloads] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    search: true,
    type: true,
    date: false,
    member: false,
    tags: false,
    size: false,
    stats: false,
  });

  const uniqueUploaders = useMemo(
    () => Array.from(new Set(assets.map((a) => a.uploadedBy))).filter(Boolean),
    [assets]
  );

  const uniqueTags = useMemo(
    () => Array.from(new Set(assets.flatMap((a) => a.tags || []))).filter(Boolean),
    [assets]
  );

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

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

  const hasFilters = searchTerm || assetType !== "all" || startDate || endDate || uploadedBy || tags.length > 0 || isFavorite || fileSize !== "all" || views !== "all" || hasDownloads;

  const countActiveFilters = useMemo(() => {
    return Object.entries({
      searchTerm: searchTerm ? 1 : 0,
      assetType: assetType !== "all" ? 1 : 0,
      startDate: startDate ? 1 : 0,
      endDate: endDate ? 1 : 0,
      uploadedBy: uploadedBy ? 1 : 0,
      tags: tags.length,
      isFavorite: isFavorite ? 1 : 0,
      fileSize: fileSize !== "all" ? 1 : 0,
      views: views !== "all" ? 1 : 0,
      hasDownloads: hasDownloads ? 1 : 0,
    }).reduce((acc, [, v]) => acc + v, 0);
  }, [searchTerm, assetType, startDate, endDate, uploadedBy, tags, isFavorite, fileSize, views, hasDownloads]);

  return (
    <>
      {/* BACKDROP */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20 z-30 pointer-events-auto"
        />
      )}

      {/* RIGHT SIDEBAR */}
      <aside
        className={`fixed top-0 right-0 h-screen w-96 bg-white border-l border-slate-200 shadow-2xl z-40 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-hidden`}
      >
        {/* HEADER */}
        <div className="px-4 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900">Filters</h2>
              {hasFilters && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  {countActiveFilters} Active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {/* 1. SEARCH */}
          <CollapsibleSection
            title="Search"
            isExpanded={expandedSections.search}
            onToggle={() => toggleSection("search")}
          >
            <input
              type="text"
              placeholder="Asset name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            />
          </CollapsibleSection>

          {/* 2. ASSET TYPE */}
          <CollapsibleSection
            title="Asset Type"
            count={assetType !== "all" ? 1 : 0}
            isExpanded={expandedSections.type}
            onToggle={() => toggleSection("type")}
          >
            <div className="space-y-1.5">
              {[
                { value: "all", label: "All Types" },
                { value: "image", label: "Images" },
                { value: "video", label: "Videos" },
                { value: "document", label: "Documents" },
                { value: "archive", label: "Archives" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAssetType(opt.value as AssetType | "all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    assetType === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-900 hover:border-blue-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* 3. DATE RANGE */}
          <CollapsibleSection
            title="Upload Date"
            count={startDate || endDate ? 1 : 0}
            isExpanded={expandedSections.date}
            onToggle={() => toggleSection("date")}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* 4. UPLOADER */}
          <CollapsibleSection
            title="Uploaded By"
            count={uploadedBy ? 1 : 0}
            isExpanded={expandedSections.member}
            onToggle={() => toggleSection("member")}
          >
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              <button
                onClick={() => setUploadedBy("")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  uploadedBy === ""
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-900 hover:border-blue-300"
                }`}
              >
                All Members
              </button>
              {uniqueUploaders.map((uploader) => (
                <button
                  key={uploader}
                  onClick={() => setUploadedBy(uploader)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    uploadedBy === uploader
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-900 hover:border-blue-300"
                  }`}
                >
                  {uploader}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* 5. TAGS */}
          <CollapsibleSection
            title="Tags"
            count={tags.length}
            isExpanded={expandedSections.tags}
            onToggle={() => toggleSection("tags")}
          >
            <div className="flex flex-wrap gap-2">
              {uniqueTags.length === 0 ? (
                <p className="text-xs text-slate-500">No tags available</p>
              ) : (
                uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      tags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:border-blue-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
          </CollapsibleSection>

          {/* 6. FILE SIZE */}
          <CollapsibleSection
            title="File Size"
            count={fileSize !== "all" ? 1 : 0}
            isExpanded={expandedSections.size}
            onToggle={() => toggleSection("size")}
          >
            <div className="space-y-1.5">
              {[
                { value: "all", label: "All Sizes" },
                { value: "small", label: "Small (< 5MB)" },
                { value: "medium", label: "Medium (5-50MB)" },
                { value: "large", label: "Large (> 50MB)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFileSize(opt.value as "small" | "medium" | "large" | "all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    fileSize === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-900 hover:border-blue-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* 7. STATISTICS */}
          <CollapsibleSection
            title="Statistics"
            count={isFavorite || views !== "all" || hasDownloads ? 1 : 0}
            isExpanded={expandedSections.stats}
            onToggle={() => toggleSection("stats")}
          >
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-900">Favorites only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={hasDownloads}
                  onChange={(e) => setHasDownloads(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-900">Downloaded</span>
              </label>

              <div>
                <span className="text-xs font-semibold text-slate-600 block mb-1.5">Sort by:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "popular", label: "Popular" },
                    { value: "recent", label: "Recent" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setViews(opt.value as "popular" | "recent" | "all")}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        views === opt.value
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-300 hover:border-blue-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* FOOTER */}
        {hasFilters && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <button
              onClick={handleClearFilters}
              className="w-full px-3 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default DAMSearchFilters;
