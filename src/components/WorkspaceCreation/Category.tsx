// src/components/WorkspaceCreation/Category.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiAlertCircle, FiX } from "react-icons/fi";
import { fetchCategoriesByRetailers } from "../../../utils/workspaceApi";

export default function Category({
  selectedRetailers,
  selectedCategories,
  setSelectedCategories,
  retailers,
  setCategoriesByRetailer,
}) {
  const [activeRetailer, setActiveRetailer] = useState(null);
  const [expandedRetailers, setExpandedRetailers] = useState({});
  const [categoryInputs, setCategoryInputs] = useState({});
  const [categorySearches, setCategorySearches] = useState({});
  const [categoriesByRetailer, setLocalCategoriesByRetailer] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  const debouncedSetCategorySearches = useCallback(
    debounce((retailerId, value) => {
      setCategorySearches((prev) => ({ ...prev, [retailerId]: value }));
      setSearchLoading(false);
    }, 0),
    []
  );

  const handleSearchInputChange = (retailerId, value) => {
    setCategoryInputs((prev) => ({ ...prev, [retailerId]: value }));
    setSearchLoading(true);
    debouncedSetCategorySearches(retailerId, value);
    if (value.trim()) {
      autoExpandMatchingCategories(retailerId, value.trim());
    } else {
      setExpandedCategories({});
    }
  };

  const autoExpandMatchingCategories = useCallback(
    (retailerId, searchTerm) => {
      const hierarchy = categoriesByRetailer[retailerId]?.hierarchy || {};
      const pathsToExpand = new Set();

      const findMatchingPaths = (categories: any, currentPath: any = []) => {
        Object.entries(categories).forEach(([name, { children, data }]: [string, any]) => {
          const fullPath = [...currentPath, name];
          const pathString = fullPath.join(">");

          const currentMatches = categoryMatchesSearch(name, data, searchTerm);
          const hasMatchingChildren = hasMatchingDescendant(children, searchTerm);

          if (currentMatches || hasMatchingChildren) {
            for (let i = 1; i <= fullPath.length; i++) {
              pathsToExpand.add(fullPath.slice(0, i).join(">"));
            }
          }

          if (Object.keys(children).length > 0) {
            findMatchingPaths(children, fullPath);
          }
        });
      };

      findMatchingPaths(hierarchy);

      if (pathsToExpand.size > 0) {
        setExpandedCategories((prev) => ({
          ...prev,
          ...Object.fromEntries([...pathsToExpand].map((path) => [path, true])),
        }));
      }
    },
    [categoriesByRetailer]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      if (selectedRetailers.length > 0) {
        const result = await fetchCategoriesByRetailers(selectedRetailers);
        if (result.success) {
          setLocalCategoriesByRetailer(result.data);
          setCategoriesByRetailer(result.data);
          if (!activeRetailer || !selectedRetailers.includes(activeRetailer)) {
            setActiveRetailer(selectedRetailers[0]);
          }
        } else {
          setError(result.message);
        }
      } else {
        setLocalCategoriesByRetailer({});
        setCategoriesByRetailer({});
        setActiveRetailer(null);
      }
      setLoading(false);
    };

    fetchCategories();
  }, [selectedRetailers, setCategoriesByRetailer, activeRetailer]);

  const handleCategoryChange = (retailerId, categoryId) => {
    setSelectedCategories((prev) => {
      const retailerCategories = prev[retailerId] || [];
      const newCategories = { ...prev };
      if (retailerCategories.includes(categoryId)) {
        newCategories[retailerId] = retailerCategories.filter((id) => id !== categoryId);
      } else {
        newCategories[retailerId] = [...retailerCategories, categoryId];
      }
      return newCategories;
    });
  };

  const removeCategoryTag = (retailerId, categoryId) => {
    setSelectedCategories((prev) => {
      const retailerCategories = prev[retailerId] || [];
      const newCategories = { ...prev };
      newCategories[retailerId] = retailerCategories.filter((id) => id !== categoryId);
      return newCategories;
    });
  };

  const toggleCategoryExpansion = (path) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const hasIncompleteCategories = (retailerId) => {
    return (
      selectedRetailers.includes(retailerId) &&
      (!selectedCategories[retailerId] || selectedCategories[retailerId].length === 0)
    );
  };

  const categoryMatchesSearch = (name, data, searchTerm) => {
    if (searchTerm === "") return true;
    const searchLower = searchTerm.toLowerCase();
    if (name.toLowerCase().includes(searchLower)) return true;
    if (data?.breadcrumbParts) {
      return data.breadcrumbParts.some((part) => part.toLowerCase().includes(searchLower));
    }
    if (data?.breadcrumb) {
      return data.breadcrumb.toLowerCase().includes(searchLower);
    }
    return false;
  };

  const hasMatchingDescendant = (categories: any, searchTerm: string) => {
    if (searchTerm === "") return true;
    return Object.entries(categories).some(([name, { children, data }]: [string, any]) => {
      const currentMatches = categoryMatchesSearch(name, data, searchTerm);
      const childrenMatch =
        Object.keys(children).length > 0 && hasMatchingDescendant(children, searchTerm);
      return currentMatches || childrenMatch;
    });
  };

  const filteredCategories = useMemo(() => {
    if (!activeRetailer || !categoriesByRetailer[activeRetailer]) return {};
    const hierarchy = categoriesByRetailer[activeRetailer].hierarchy;
    const searchTerm = categorySearches[activeRetailer] || "";
    if (!searchTerm) return hierarchy;

    const filtered: any = {};
    const filterCategories = (categories: any, parentPath: any = []) => {
      Object.entries(categories).forEach(([name, { children, data }]: [string, any]) => {
        const currentPath = [...parentPath, name].join(">");
        const matchesSearch = categoryMatchesSearch(name, data, searchTerm);
        const hasMatchingChildren = hasMatchingDescendant(children, searchTerm);

        if (matchesSearch || hasMatchingChildren) {
          let current = filtered;
          parentPath.forEach((p) => {
            if (!current[p]) current[p] = { children: {}, data: null };
            current = current[p].children;
          });
          current[name] = { children: {}, data };
          if (Object.keys(children).length > 0) {
            filterCategories(children, [...parentPath, name]);
          }
        }
      });
    };

    filterCategories(hierarchy);
    return filtered;
  }, [activeRetailer, categoriesByRetailer, categorySearches]);

  const renderCategoryLevel = (categories: any, retailerId: any, level = 0, path: any = [], searchTerm = "") => {
    return Object.entries(categories)
      .map(([name, { children, data }]: [string, any]) => {
        const currentPath = [...path, name].join(">");
        const isExpanded = expandedCategories[currentPath];
        const hasChildren = Object.keys(children).length > 0;
        const matchesSearch = categoryMatchesSearch(name, data, searchTerm);
        const hasMatchingDescendants = hasChildren && hasMatchingDescendant(children, searchTerm);

        if (!matchesSearch && !hasMatchingDescendants) return null;

        const isSelectable = !!data;
        const levelStyles = {
          0: "font-semibold text-gray-900 border border-gray-200 hover:bg-peach hover:shadow-md",
          1: "font-medium text-gray-800 border-l-2 border-gray-300 hover:bg-peach hover:shadow-sm",
          2: "font-normal text-gray-700 border-l-2 border-dashed border-gray-200 hover:bg-peach hover:shadow-sm",
          3: "font-normal text-gray-700 border-b border-gray-200 hover:bg-peach hover:shadow-sm",
        };
        const iconSize = level === 0 ? "h-6 w-6" : level === 1 ? "h-5 w-5" : "h-4 w-4";

        return (
          <div key={currentPath} className={`ml-${level * 3}`}>
            <div
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                data && (selectedCategories[retailerId] || []).includes(data.id)
                  ? "bg-peach border border-primary-orange"
                  : levelStyles[level] || "hover:bg-gray-50"
              }`}
              onClick={() => {
                if (hasChildren && !isSelectable) {
                  toggleCategoryExpansion(currentPath);
                } else {
                  handleCategoryChange(retailerId, data.id);
                  if (hasChildren) {
                    toggleCategoryExpansion(currentPath);
                  }
                }
              }}
            >
              <span className="truncate flex-grow">{name}</span>
              {hasChildren &&
                (isExpanded ? (
                  <FiChevronUp
                    className={`${iconSize} text-gray-500 opacity-${level === 0 ? 80 : 60}`}
                  />
                ) : (
                  <FiChevronDown
                    className={`${iconSize} text-gray-500 opacity-${level === 0 ? 80 : 60}`}
                  />
                ))}
            </div>
            {isExpanded && hasChildren && (
              <div className="ml-3 space-y-1">
                {renderCategoryLevel(children, retailerId, level + 1, [...path, name], searchTerm)}
              </div>
            )}
          </div>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Categories</h2>
      {(Object.keys(selectedCategories).length === 0 ||
        selectedRetailers.some(
          (retailerId) =>
            !selectedCategories[retailerId] || selectedCategories[retailerId].length === 0
        )) && (
        <p className="text-sm text-red-500">
          **You must select at least one category from each selected retailer.**
        </p>
      )}

      <div className="flex space-x-5">
        <div className="w-1/4 p-4 rounded-xl bg-white shadow-md border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-900 mb-4">Retailers</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {selectedRetailers.map((retailerId) => {
              const retailer = retailers.find((r) => r.id === retailerId);
              const categoryCount = (selectedCategories[retailerId] || []).length;

              return (
                <div
                  key={retailerId}
                  className="rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div
                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeRetailer === retailerId
                        ? "bg-cream border-l-4 border-primary-orange"
                        : "border-l-4 border-transparent hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setActiveRetailer(retailerId);
                      setExpandedRetailers((prev) => ({
                        ...prev,
                        [retailerId]: !prev[retailerId],
                      }));
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-semibold text-gray-900">
                        {retailer?.name || "Unknown Retailer"}
                      </span>
                      {categoryCount > 0 && (
                        <span className="inline-block bg-primary-orange text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {categoryCount}
                        </span>
                      )}
                      {hasIncompleteCategories(retailerId) && (
                        <span
                          title="Please select at least one category"
                          className="flex items-center"
                        >
                          <FiAlertCircle className="h-5 w-5 text-red-500" />
                        </span>
                      )}
                    </div>
                    {expandedRetailers[retailerId] ? (
                      <FiChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  {expandedRetailers[retailerId] && (
                    <div className="pl-4 pt-2 pb-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                      {(selectedCategories[retailerId] || []).map((categoryId) => {
                        const category = categoriesByRetailer[retailerId]?.flat.find(
                          (c) => c.id === categoryId
                        );
                        return (
                          <div
                            key={categoryId}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-all duration-200 max-w-full"
                          >
                            <span
                              className="text-sm text-gray-700 whitespace-normal leading-relaxed flex-grow"
                              title={category?.breadcrumb || categoryId}
                            >
                              {category?.breadcrumbParts ? (
                                category.breadcrumbParts.map((part, index, arr) => (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center ${
                                      index === 0
                                        ? "text-gray-500 font-medium"
                                        : index === arr.length - 1
                                        ? "text-gray-800 font-bold"
                                        : "text-gray-600 font-medium"
                                    }`}
                                  >
                                    {part}
                                    {index < arr.length - 1 && (
                                      <span className="mx-1.5 text-gray-400 font-normal">&gt;</span>
                                    )}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-700">
                                  {category?.breadcrumb || categoryId}
                                </span>
                              )}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCategoryTag(retailerId, categoryId);
                              }}
                              className="ml-2 relative group flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-600 transition-all duration-300 transform hover:scale-110 hover:bg-red-100 rounded-full"
                            >
                              <FiX className="w-4 h-4" />
                              <span className="absolute right-full mr-1 text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                Remove
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {activeRetailer && (
          <div
            className="w-full p-3 rounded-xl bg-white shadow-sm border border-light-gray"
            key={`categories-${activeRetailer}`}
          >
            <div className="relative mb-3">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                placeholder={`Search ${
                  retailers.find((r) => r.id === activeRetailer)?.name || "retailer"
                } categories...`}
                value={categoryInputs[activeRetailer] || ""}
                onChange={(e) => handleSearchInputChange(activeRetailer, e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onInput={(e) => e.stopPropagation()}
                ref={searchInputRef}
                className="w-full pl-12 py-3 rounded-xl border border-light-gray shadow-sm focus:ring-2 focus:ring-primary-orange focus:outline-none transition-all duration-300"
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">Loading categories...</div>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin">
                {renderCategoryLevel(
                  filteredCategories,
                  activeRetailer,
                  0,
                  [],
                  categorySearches[activeRetailer] || ""
                )}
              </div>
            )}
            {error && <div className="text-center py-4 text-red-500">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}