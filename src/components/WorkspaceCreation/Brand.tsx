// src/components/WorkspaceCreation/Brand.jsx
import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiAlertCircle } from "react-icons/fi";
import SelectionTag from "./SelectionTag";
import { fetchBrandsByCategories } from "../../../utils/workspaceApi";

export default function Brand({
  selectedCategories,
  selectedBrands,
  setSelectedBrands,
  retailers,
  categoriesByRetailer,
}) {
  const [activeBrandCategory, setActiveBrandCategory] = useState(null);
  const [expandedRetailers, setExpandedRetailers] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [brandSearches, setBrandSearches] = useState({});
  const [brandsByCategory, setBrandsByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedCategoriesFlat = useMemo(
    () => Object.values(selectedCategories).flat(),
    [selectedCategories]
  );

  const cache = {};

  useEffect(() => {
    const fetchBrands = async () => {
      if (!selectedCategoriesFlat.length) {
        setBrandsByCategory({});
        setActiveBrandCategory(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const cacheKey = JSON.stringify(selectedCategoriesFlat);

      if (cache[cacheKey]) {
        setBrandsByCategory(cache[cacheKey]);
        setLoading(false);
        if (!activeBrandCategory && selectedCategoriesFlat.length > 0) {
          setActiveBrandCategory(selectedCategoriesFlat[0]);
        }
        return;
      }

      const result = await fetchBrandsByCategories(selectedCategoriesFlat as any);
      if (result.success) {
        cache[cacheKey] = result.data;
        setBrandsByCategory(result.data);
        if (!activeBrandCategory && selectedCategoriesFlat.length > 0) {
          setActiveBrandCategory(selectedCategoriesFlat[0]);
        }
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    fetchBrands();
  }, [selectedCategoriesFlat, activeBrandCategory]);

  const handleBrandChange = (categoryId: any, brand: any) => {
    setSelectedBrands((prev) => {
      const categoryBrands = (prev as any)[categoryId] || [];
      const newBrands = { ...prev };
      if (categoryBrands.includes(brand)) {
        (newBrands as any)[categoryId] = categoryBrands.filter((b: any) => b !== brand);
      } else {
        (newBrands as any)[categoryId] = [...categoryBrands, brand];
      }
      return newBrands;
    });
  };

  const removeBrandTag = (categoryId, brand) => {
    setSelectedBrands((prev) => {
      const categoryBrands = prev[categoryId] || [];
      const newBrands = { ...prev };
      newBrands[categoryId] = categoryBrands.filter((b) => b !== brand);
      return newBrands;
    });
  };

  const hasIncompleteBrands = (categoryId) => {
    return (
      selectedCategoriesFlat.includes(categoryId) &&
      (!selectedBrands[categoryId] || selectedBrands[categoryId].length === 0)
    );
  };

  const getCategoryName = (categoryId, retailerId) => {
    const category = categoriesByRetailer[retailerId]?.flat.find((c) => c.id === categoryId);
    return category?.name || `Category ${categoryId}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Brands</h2>
      {selectedCategoriesFlat.some(
        (categoryId: any) =>
          !(selectedBrands as any)[categoryId] || (selectedBrands as any)[categoryId].length === 0
      ) && (
        <p className="text-sm text-red-500">
          **You must select at least one brand from each category.**
        </p>
      )}

      <div className="flex space-x-8">
        <div className="w-1/3 p-6 rounded-xl bg-white shadow-sm border border-light-gray">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Selection Summary</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {Object.entries(selectedCategories).map(([retailerId, categoryIds]) => {
              const retailer = retailers.find((r) => r.id === retailerId);
              return (
                <div key={retailerId}>
                  <div
                    className="flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-300"
                    onClick={() =>
                      setExpandedRetailers((prev) => ({
                        ...prev,
                        [retailerId]: !prev[retailerId],
                      }))
                    }
                  >
                    <span className="text-gray-800 font-medium">
                      {retailer?.name || "Unknown Retailer"}
                    </span>
                    {expandedRetailers[retailerId] ? (
                      <FiChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  {expandedRetailers[retailerId] && (
                    <div className="pl-5 mt-2 space-y-2">
                      {(categoryIds as any).map((categoryId: any) => {
                        const brandCount = ((selectedBrands as any)[categoryId] || []).length;
                        return (
                          <div key={categoryId}>
                            <div
                              className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                activeBrandCategory === categoryId
                                  ? "bg-blue-50 border border-blue-100"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                setActiveBrandCategory(categoryId);
                                setExpandedCategories((prev) => ({
                                  ...prev,
                                  [categoryId]: !prev[categoryId],
                                }));
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-700">
                                  {getCategoryName(categoryId, retailerId)}
                                </span>
                                {brandCount > 0 && (
                                  <span className="inline-block bg-green-200 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {brandCount}
                                  </span>
                                )}
                                {hasIncompleteBrands(categoryId) && (
                                  <FiAlertCircle className="ml-2 h-3 w-3 text-red-500" />
                                )}
                              </div>
                              {expandedCategories[categoryId] ? (
                                <FiChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <FiChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            {expandedCategories[categoryId] && (
                              <div className="pl-5 mt-2 space-y-1">
                                {(selectedBrands[categoryId] || []).map((brand) => (
                                  <div
                                    key={brand}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                  >
                                    <span className="text-gray-700 text-sm">{brand}</span>
                                  </div>
                                ))}
                              </div>
                            )}
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

        {activeBrandCategory && (
          <div className="w-2/3 p-6 rounded-xl bg-white shadow-sm border border-light-gray">
            <div className="flex flex-wrap gap-2 mb-4">
              {((selectedBrands as any)[activeBrandCategory] || []).map((brand: any) => (
                <SelectionTag
                  label={brand}
                  onRemove={() => removeBrandTag(activeBrandCategory, brand)}
                  {...{key: brand, className: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"} as any}
                />
              ))}
            </div>

            <div className="relative mb-6">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                placeholder={`Search brands for Category ${getCategoryName(
                  activeBrandCategory,
                  Object.keys(selectedCategories).find((r) =>
                    selectedCategories[r].includes(activeBrandCategory)
                  ) || "Unknown"
                )}`}
                value={brandSearches[activeBrandCategory] || ""}
                onChange={(e) =>
                  setBrandSearches((prev) => ({
                    ...prev,
                    [activeBrandCategory]: e.target.value,
                  }))
                }
                className="w-full pl-12 py-3 rounded-xl border border-light-gray shadow-sm focus:ring-2 focus:ring-primary-orange focus:outline-none transition-all duration-300"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading brands...</div>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto scrollbar-thin">
                {(brandsByCategory[activeBrandCategory] || [])
                  .filter((brand) =>
                    brand
                      .toLowerCase()
                      .includes((brandSearches[activeBrandCategory] || "").toLowerCase())
                  )
                  .map((brand) => {
                    const isSelected = (selectedBrands[activeBrandCategory] || []).includes(brand);
                    return (
                      <div
                        key={brand}
                        onClick={() => handleBrandChange(activeBrandCategory, brand)}
                        className={`flex items-center space-x-3 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-primary-orange text-white border border-orange-500"
                            : "bg-white border border-light-gray hover:bg-cream"
                        }`}
                      >
                        <span className="text-base font-medium select-none flex-grow">
                          {brand}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}