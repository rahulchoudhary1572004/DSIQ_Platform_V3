import { useState } from "react";
import { ArrowRight, Check, X, Search, Info, Trash2, Plus } from "lucide-react";

interface ViewAttribute {
  id: string | number;
  name: string;
  type: string;
  required: boolean;
}

interface RetailerField {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}

interface MappingInterfaceProps {
  retailerId: string;
  retailerName: string;
  pimFields: ViewAttribute[];
  existingMappings?: Record<string, string | number>;
  onMappingsChange: (mappings: Record<string, string | number>) => void;
}

// Sample retailer field definitions
const retailerFieldsData: Record<string, RetailerField[]> = {
  amazon: [
    { id: "title", label: "Product Title", required: true, description: "Maximum 200 characters" },
    { id: "brand", label: "Brand Name", required: true },
    { id: "description", label: "Product Description", required: true },
    { id: "bulletPoints", label: "Bullet Points", required: false, description: "Key features" },
    { id: "price", label: "Price", required: true },
    { id: "sku", label: "SKU", required: true },
    { id: "weight", label: "Shipping Weight", required: false },
    { id: "dimensions", label: "Dimensions", required: false },
    { id: "color", label: "Color", required: false },
    { id: "material", label: "Material", required: false },
    { id: "image", label: "Main Image URL", required: true },
  ],
  walmart: [
    { id: "title", label: "Product Name", required: true },
    { id: "brand", label: "Brand", required: true },
    { id: "shortDescription", label: "Short Description", required: true },
    { id: "longDescription", label: "Long Description", required: false },
    { id: "price", label: "Price", required: true },
    { id: "sku", label: "Item Number", required: true },
    { id: "weight", label: "Weight", required: false },
  ],
  target: [
    { id: "productTitle", label: "Product Title", required: true },
    { id: "brandName", label: "Brand Name", required: true },
    { id: "description", label: "Description", required: true },
    { id: "sellingPrice", label: "Selling Price", required: true },
    { id: "itemNumber", label: "Item Number", required: true },
    { id: "weightPounds", label: "Weight (lbs)", required: false },
    { id: "productColor", label: "Color", required: false },
  ],
  shopify: [
    { id: "title", label: "Title", required: true },
    { id: "vendor", label: "Vendor", required: false },
    { id: "bodyHtml", label: "Description (HTML)", required: false },
    { id: "price", label: "Price", required: true },
    { id: "sku", label: "SKU", required: false },
    { id: "variantOption1", label: "Variant Option 1", required: false },
  ],
  ebay: [
    { id: "title", label: "Title", required: true },
    { id: "brand", label: "Brand", required: false },
    { id: "description", label: "Description", required: true },
    { id: "price", label: "Start Price", required: true },
    { id: "sku", label: "SKU", required: false },
    { id: "shippingWeight", label: "Shipping Weight", required: false },
  ],
  etsy: [
    { id: "title", label: "Title", required: true },
    { id: "shopSectionId", label: "Shop Section", required: false },
    { id: "description", label: "Description", required: true },
    { id: "price", label: "Price", required: true },
    { id: "sku", label: "SKU", required: false },
  ],
};

const MappingInterface = ({
  retailerId,
  retailerName,
  pimFields,
  existingMappings = {},
  onMappingsChange,
}: MappingInterfaceProps) => {
  const [mappings, setMappings] = useState<Record<string, string | number>>(existingMappings);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyMapped, setShowOnlyMapped] = useState(false);
  const [showOnlyRequired, setShowOnlyRequired] = useState(false);

  const retailerFields = retailerFieldsData[retailerId] || [];

  // Filter retailer fields based on search and filters
  const filteredRetailerFields = retailerFields.filter((field) => {
    const matchesSearch =
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMapped = !showOnlyMapped || mappings[field.id];
    const matchesRequired = !showOnlyRequired || field.required;

    return matchesSearch && matchesMapped && matchesRequired;
  });

  const handleMapping = (retailerFieldId: string, pimFieldId: string | number) => {
    const newMappings = { ...mappings };
    
    if (pimFieldId === "") {
      delete newMappings[retailerFieldId];
    } else {
      newMappings[retailerFieldId] = pimFieldId;
    }

    setMappings(newMappings);
    onMappingsChange(newMappings);
  };

  const handleClearMapping = (retailerFieldId: string) => {
    const newMappings = { ...mappings };
    delete newMappings[retailerFieldId];
    setMappings(newMappings);
    onMappingsChange(newMappings);
  };

  const handleAutoMap = () => {
    const autoMappings: Record<string, string | number> = {};
    
    retailerFields.forEach((retailerField) => {
      // Try to find a matching PIM field by name similarity
      const matchingPimField = pimFields.find((pimField) => {
        const retailerFieldName = retailerField.label.toLowerCase().replace(/[^a-z0-9]/g, "");
        const pimFieldName = pimField.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return retailerFieldName.includes(pimFieldName) || pimFieldName.includes(retailerFieldName);
      });

      if (matchingPimField) {
        autoMappings[retailerField.id] = matchingPimField.id;
      }
    });

    setMappings(autoMappings);
    onMappingsChange(autoMappings);
  };

  const mappedCount = Object.keys(mappings).length;
  const requiredCount = retailerFields.filter((f) => f.required).length;
  const requiredMappedCount = retailerFields.filter(
    (f) => f.required && mappings[f.id]
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{retailerName} Field Mapping</h3>
          <p className="text-sm text-gray-600 mt-1">
            Map your PIM fields to {retailerName}'s required fields
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Category:</span>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C]"
              aria-label="Select category"
              title="Select category"
            >
              <option>Electronics</option>
              <option>Automotive</option>
              <option>Fashion</option>
              <option>Home & Garden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Retailers fields"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] text-sm"
          />
        </div>
        <button
          type="button"
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          Filters
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-3">
            <div className="col-span-4">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {retailerName.toUpperCase()} FIELD
              </span>
            </div>
            <div className="col-span-4">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                PIM FIELD
              </span>
            </div>
            <div className="col-span-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                CURRENT VALUE
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                
              </span>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredRetailerFields.length > 0 ? (
            filteredRetailerFields.map((retailerField) => {
              const isMapped = !!mappings[retailerField.id];
              const mappedPimField = pimFields.find((f) => f.id === mappings[retailerField.id]);

              return (
                <div
                  key={retailerField.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Retailer Field Column */}
                  <div className="col-span-4 flex items-center">
                    <span className="text-sm text-gray-900 font-medium">
                      {retailerField.label}
                    </span>
                  </div>

                  {/* PIM Field Selector Column */}
                  <div className="col-span-4 flex items-center">
                    <select
                      value={mappings[retailerField.id] || ""}
                      onChange={(e) => handleMapping(retailerField.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] bg-white"
                      aria-label={`Map ${retailerField.label}`}
                      title={`Map ${retailerField.label}`}
                    >
                      <option value="">Select PIM field</option>
                      {pimFields.map((pimField) => (
                        <option key={pimField.id} value={pimField.id}>
                          {pimField.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Value Column */}
                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-gray-500">
                      {isMapped ? "Mapped" : "No mapping"}
                    </span>
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-1 flex items-center justify-end">
                    {isMapped && (
                      <button
                        type="button"
                        onClick={() => handleClearMapping(retailerField.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        aria-label="Delete mapping"
                        title="Delete mapping"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">No fields found matching your criteria</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setShowOnlyMapped(false);
                  setShowOnlyRequired(false);
                }}
                className="mt-3 px-4 py-2 text-sm text-[#DD522C] hover:text-[#F27A56] font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MappingInterface;
