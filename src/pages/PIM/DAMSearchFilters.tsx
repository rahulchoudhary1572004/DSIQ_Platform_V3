import { FC, useState, ChangeEvent, useMemo } from "react";
import {
  Search,
  X,
  Filter,
  Calendar,
  Users,
  Tag,
  RotateCcw,
} from "lucide-react";
import { SearchFilters, DigitalAsset } from "../../types/dam.types";

interface DAMSearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  assets: DigitalAsset[];
}

interface FilterTag {
  id: string;
  label: string;
  category: string;
}

const DAMSearchFilters: FC<DAMSearchFiltersProps> = ({ onFilterChange, assets }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    assetType: "all",
    dateRange: { startDate: "", endDate: "" },
    uploader: "",
  });

  const uploaders = useMemo(
    () => Array.from(new Set(assets.map((a) => a.uploadedBy))),
    [assets]
  );

  const assetTypes = [
    { value: "all", label: "All Types" },
    { value: "image", label: "📸 Images" },
    { value: "video", label: "🎬 Videos" },
    { value: "document", label: "📄 Documents" },
    { value: "audio", label: "🎵 Audio" },
    { value: "archive", label: "📦 Archives" },
  ];

  // Generate active filter tags
  const activeFilterTags: FilterTag[] = useMemo(() => {
    const tags: FilterTag[] = [];

    if (filters.searchTerm) {
      tags.push({
        id: "search",
        label: `"${filters.searchTerm}"`,
        category: "search",
      });
    }

    if (filters.assetType !== "all") {
      const typeLabel = assetTypes.find((t) => t.value === filters.assetType)?.label;
      tags.push({
        id: "type",
        label: typeLabel || filters.assetType,
        category: "type",
      });
    }

    if (filters.dateRange.startDate) {
      tags.push({
        id: "startDate",
        label: `From ${filters.dateRange.startDate}`,
        category: "date",
      });
    }

    if (filters.dateRange.endDate) {
      tags.push({
        id: "endDate",
        label: `To ${filters.dateRange.endDate}`,
        category: "date",
      });
    }

    if (filters.uploader) {
      tags.push({
        id: "uploader",
        label: `By ${filters.uploader}`,
        category: "uploader",
      });
    }

    return tags;
  }, [filters, assetTypes]);

  // Update filters
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  // Remove specific filter
  const removeFilterTag = (tagId: string) => {
    switch (tagId) {
      case "search":
        updateFilters({ searchTerm: "" });
        break;
      case "type":
        updateFilters({ assetType: "all" });
        break;
      case "startDate":
        updateFilters({ dateRange: { ...filters.dateRange, startDate: "" } });
        break;
      case "endDate":
        updateFilters({ dateRange: { ...filters.dateRange, endDate: "" } });
        break;
      case "uploader":
        updateFilters({ uploader: "" });
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: "",
      assetType: "all",
      dateRange: { startDate: "", endDate: "" },
      uploader: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = activeFilterTags.length > 0;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
        <Search className="h-5 w-5 text-gray-400 ml-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search assets..."
          value={filters.searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateFilters({ searchTerm: e.target.value })
          }
          className="flex-1 px-3 py-3 bg-transparent border-none focus:outline-none text-sm placeholder-gray-400"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 pr-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
              title="Clear all filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              isExpanded
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">
                {activeFilterTags.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-2">
          {activeFilterTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => removeFilterTag(tag.id)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors group"
            >
              <span className="truncate">{tag.label}</span>
              <X className="h-3 w-3 opacity-70 group-hover:opacity-100 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Side Filter Drawer - Overlay */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setIsExpanded(false)}
          />

          {/* Filter Panel - Right Drawer */}
          <div className="fixed top-0 right-0 h-screen w-80 bg-white shadow-2xl z-40 overflow-y-auto animate-in slide-in-from-right-full duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6">
              {/* Asset Type Filter Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">Asset Type</h3>
                </div>
                <div className="space-y-2 pl-6">
                  {assetTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      <input
                        type="radio"
                        name="assetType"
                        value={type.value}
                        checked={filters.assetType === type.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateFilters({ assetType: e.target.value as any })
                        }
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Uploader Filter Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-gray-900">Uploaded By</h3>
                </div>
                <div className="space-y-2 pl-6 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-colors">
                    <input
                      type="radio"
                      name="uploader"
                      value=""
                      checked={!filters.uploader}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateFilters({ uploader: e.target.value })
                      }
                      className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 truncate">
                      All Users
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      ({assets.length})
                    </span>
                  </label>

                  {uploaders.map((uploader) => (
                    <label
                      key={uploader}
                      className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      <input
                        type="radio"
                        name="uploader"
                        value={uploader}
                        checked={filters.uploader === uploader}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updateFilters({ uploader: e.target.value })
                        }
                        className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1 truncate">
                        {uploader}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({assets.filter((a) => a.uploadedBy === uploader).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Date Range Filter Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-bold text-gray-900">Upload Date</h3>
                </div>
                <div className="space-y-3 pl-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.startDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateFilters({
                          dateRange: {
                            ...filters.dateRange,
                            startDate: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.endDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateFilters({
                          dateRange: {
                            ...filters.dateRange,
                            endDate: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-3 space-y-2">
              <p className="text-xs text-gray-600">
                <span className="font-bold text-gray-900">{assets.length}</span> total assets
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DAMSearchFilters;
