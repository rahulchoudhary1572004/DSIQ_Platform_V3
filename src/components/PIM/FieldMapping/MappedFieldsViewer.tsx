import { useState } from "react";
import { ChevronDown, Check, MapPin, ShoppingCart, ArrowRight, Eye, Edit } from "lucide-react";

interface ViewAttribute {
  id: string | number;
  name: string;
  type: string;
  required: boolean;
}

interface FieldMappingTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  retailers: string[];
  mappings: Record<string, Record<string, string | number>>;
}

interface MappedFieldsViewerProps {
  template: FieldMappingTemplate;
  pimFields: ViewAttribute[];
  onEdit?: () => void;
  compact?: boolean;
}

const retailerDetails: Record<string, { name: string; color: string }> = {
  amazon: { name: "Amazon", color: "bg-orange-500" },
  walmart: { name: "Walmart", color: "bg-blue-600" },
  target: { name: "Target", color: "bg-red-600" },
  shopify: { name: "Shopify", color: "bg-green-600" },
  ebay: { name: "eBay", color: "bg-yellow-500" },
  etsy: { name: "Etsy", color: "bg-orange-600" },
};

const MappedFieldsViewer = ({
  template,
  pimFields,
  onEdit,
  compact = false,
}: MappedFieldsViewerProps) => {
  const [expandedRetailer, setExpandedRetailer] = useState<string | null>(
    !compact ? template.retailers[0] : null
  );

  const getPimFieldName = (fieldId: string | number): string => {
    const field = pimFields.find((f) => f.id.toString() === fieldId.toString());
    return field ? `${field.name} (${field.type})` : `Field ID: ${fieldId}`;
  };

  const getRetailerMappingStats = (retailerId: string) => {
    const mappings = template.mappings[retailerId] || {};
    const totalFields = Object.keys(mappings).length;
    return totalFields;
  };

  if (compact) {
    return (
      <div className="p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-[#DD522C] transition-all group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#DD522C]" />
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-[#DD522C] hover:bg-[#FDE2CF] rounded-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Edit template"
              title="Edit template"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
            {template.category}
          </span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-600">
            {template.retailers.length} retailer{template.retailers.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {template.retailers.map((retailerId) => {
            const retailer = retailerDetails[retailerId];
            if (!retailer) return null;

            const mappedCount = getRetailerMappingStats(retailerId);

            return (
              <div
                key={retailerId}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className={`w-6 h-6 rounded ${retailer.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-bold">
                    {retailer.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {retailer.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {mappedCount} field{mappedCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Template Header */}
      <div className="p-6 bg-gradient-to-r from-[#DD522C] to-[#F27A56] rounded-xl text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              {template.name}
            </h2>
            <p className="text-sm opacity-90 mb-3">{template.description}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                {template.category}
              </span>
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                {template.retailers.length} Retailer{template.retailers.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
              aria-label="Edit mappings"
              title="Edit mappings"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Retailers Mapping */}
      <div className="space-y-3">
        {template.retailers.map((retailerId) => {
          const retailer = retailerDetails[retailerId];
          if (!retailer) return null;

          const isExpanded = expandedRetailer === retailerId;
          const mappings = template.mappings[retailerId] || {};
          const mappedCount = Object.keys(mappings).length;

          return (
            <div
              key={retailerId}
              className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-[#DD522C] transition-all"
            >
              {/* Retailer Header */}
              <button
                type="button"
                onClick={() => setExpandedRetailer(isExpanded ? null : retailerId)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all"
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${retailer.name} mappings`}
                title={`${isExpanded ? "Collapse" : "Expand"} ${retailer.name} mappings`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${retailer.color} flex items-center justify-center shadow-md`}>
                    <span className="text-white font-bold text-sm">
                      {retailer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">{retailer.name}</h3>
                    <p className="text-sm text-gray-600">
                      {mappedCount} field{mappedCount !== 1 ? "s" : ""} mapped
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {mappedCount > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Configured</span>
                    </div>
                  )}
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Mappings List */}
              {isExpanded && (
                <div className="border-t-2 border-gray-200 bg-gray-50 p-4 animate-slideDown">
                  {mappedCount > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(mappings).map(([retailerField, pimFieldId]) => (
                        <div
                          key={retailerField}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {retailerField.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {retailer.name} Field
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-[#DD522C]">
                              {getPimFieldName(pimFieldId)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              PIM Field
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No fields mapped for this retailer</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Card */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Mapping Summary</p>
            <p className="text-sm text-blue-700 mt-1">
              This template defines how your PIM data maps to {template.retailers.length} different
              retailer{template.retailers.length !== 1 ? "s" : ""}. Each retailer has its own field
              requirements and naming conventions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappedFieldsViewer;
