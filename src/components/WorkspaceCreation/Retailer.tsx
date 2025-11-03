// src/components/WorkspaceCreation/Retailer.jsx
import { useState, useEffect, useRef } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import SelectionTag from "./SelectionTag";
import { fetchRetailers } from "../../../utils/workspaceApi";

export default function Retailer({ selectedRetailers, setSelectedRetailers }) {
  const [retailerSearch, setRetailerSearch] = useState("");
  const [retailersByCountry, setRetailersByCountry] = useState({});
  const [expandedCountries, setExpandedCountries] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch retailers and group by country
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await fetchRetailers();
      if (result.success) {
        const grouped = result.data.reduce((acc, retailer) => {
          const country = retailer.country;
          if (!acc[country]) {
            acc[country] = [];
          }
          acc[country].push(retailer);
          return acc;
        }, {});

        const sortedGrouped = Object.keys(grouped)
          .sort()
          .reduce((acc, country) => {
            acc[country] = grouped[country].sort((a, b) => a.name.localeCompare(b.name));
            return acc;
          }, {});

        setRetailersByCountry(sortedGrouped);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRetailerChange = (retailerId) => {
    setSelectedRetailers((prev) =>
      prev.includes(retailerId)
        ? prev.filter((id) => id !== retailerId)
        : [...prev, retailerId]
    );
  };

  const handleCountryToggle = (country) => {
    setExpandedCountries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return newSet;
    });
  };

  const removeRetailerTag = (retailerId) => {
    setSelectedRetailers((prev) => prev.filter((id) => id !== retailerId));
  };

  const filteredCountries = Object.keys(retailersByCountry).filter(
    (country) =>
      country.toLowerCase().includes(retailerSearch.toLowerCase()) ||
      retailersByCountry[country].some((retailer) =>
        retailer.name.toLowerCase().includes(retailerSearch.toLowerCase())
      )
  );

  const shouldExpandCountry = (country) => {
    if (expandedCountries.has(country)) return true;
    if (retailerSearch.trim() !== "") {
      return retailersByCountry[country].some((retailer) =>
        retailer.name.toLowerCase().includes(retailerSearch.toLowerCase())
      );
    }
    return false;
  };

  const allRetailers = Object.values(retailersByCountry).flat();

  const getCountryCodeForRetailer = (retailerId) => {
    const retailer = allRetailers.find((r) => r.id === retailerId);
    return retailer?.country_iso3 || "US";
  };

  return (
    <div className="space-y-4 font-sans">
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Select Online Retailers</h2>
      {selectedRetailers.length === 0 && (
        <p className="text-sm text-danger-red">**Please select at least one retailer to proceed.**</p>
      )}
      {error && <p className="text-small text-danger-red">{error}</p>}
      {loading ? (
        <div className="text-center py-6 text-body text-gray-500">Loading retailers...</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-1">
            {selectedRetailers.map((retailerId) => {
              const retailer = allRetailers.find((r) => r.id === retailerId);
              const countryCode = getCountryCodeForRetailer(retailerId);
              return (
                <SelectionTag
                  key={retailerId}
                  label={retailer?.name || retailerId}
                  countryCode={countryCode}
                  onRemove={() => removeRetailerTag(retailerId)}
                  className="bg-peach text-accent-magenta border border-light-gray hover:bg-cream"
                />
              );
            })}
          </div>
          <div className="relative mb-2">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray h-4 w-4" />
            <input
              placeholder="Search retailers or countries..."
              value={retailerSearch}
              onChange={(e) => setRetailerSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onInput={(e) => e.stopPropagation()}
              ref={searchInputRef}
              className="w-full pl-10 pr-3 py-1 rounded-md border border-light-gray bg-light-gray/20 text-body text-dark-gray placeholder-gray focus:ring-2 focus:ring-primary-orange focus:outline-none transition-all duration-300"
            />
          </div>
          <div className="space-y-2 min-h-[400px]">
            {filteredCountries.map((country) => {
              const isExpanded = shouldExpandCountry(country);
              const countryRetailers =
                retailersByCountry[country]?.filter((retailer) =>
                  retailer.name.toLowerCase().includes(retailerSearch.toLowerCase())
                ) || [];

              return (
                <div key={country} className="rounded-lg overflow-hidden">
                  <div
                    onClick={() => handleCountryToggle(country)}
                    className="flex items-center justify-between p-3 bg-white border-b border-light-gray hover:bg-light-gray/10 transition-all duration-300 cursor-pointer"
                  >
                    <span className="text-small font-semibold text-dark-gray">
                      {country} ({countryRetailers.length} retailers)
                    </span>
                    <FiChevronDown
                      className={`h-4 w-4 text-gray transform transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {isExpanded && (
                    <div className="p-2 bg-light-gray/10">
                      {countryRetailers.length === 0 ? (
                        <p className="text-small text-gray py-2">
                          No retailers found matching your search.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {countryRetailers.map((retailer) => {
                            const isSelected = selectedRetailers.includes(retailer.id);
                            return (
                              <div
                                key={retailer.id}
                                onClick={() => handleRetailerChange(retailer.id)}
                                className={`
                                  flex items-center p-2 rounded-md shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer
                                  ${
                                    isSelected
                                      ? "bg-primary-orange text-white border-primary-orange"
                                      : "bg-white hover:bg-light-gray/20"
                                  }`}
                              >
                                <span className="text-body font-medium select-none flex-grow truncate">
                                  {retailer.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}