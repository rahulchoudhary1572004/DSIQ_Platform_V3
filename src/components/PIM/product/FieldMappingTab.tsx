import { useState, useEffect } from "react";
import { MapPin, Plus, Save, Info, Settings, Check, ArrowRight, Search, X } from "lucide-react";
import { useProductData } from "../../../context/ProductDataContext";
import MappingInterface from "../FieldMapping/MappingInterface";

interface FieldMappingTabProps {
  viewTemplates: any[];
  activeViewId: string;
  productData: Record<number, any>;
  isReadOnly?: boolean;
  onSave?: (mappings: any) => void;
}

const FieldMappingTab = ({
  viewTemplates,
  activeViewId,
  productData,
  isReadOnly = false,
  onSave,
}: FieldMappingTabProps) => {
  const { fieldMappingTemplates, setFieldMappingTemplates } = useProductData();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [activeRetailerTab, setActiveRetailerTab] = useState<string>(""); // Current active retailer tab
  const [allMappings, setAllMappings] = useState<Record<string, Record<string, string | number>>>({});
  const [viewMode, setViewMode] = useState<"select" | "map" | "view">("select");
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [showAddRetailerModal, setShowAddRetailerModal] = useState(false);
  
  // Dropdown states
  const [templateInput, setTemplateInput] = useState("");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [retailerInput, setRetailerInput] = useState("");
  const [showRetailerDropdown, setShowRetailerDropdown] = useState(false);

  const categories = ["Automotive", "Electronics", "Fashion", "Home & Garden", "General", "Food & Beverage"];

  const selectedTemplate = fieldMappingTemplates.find((t) => t.id === selectedTemplateId);
  const currentView = viewTemplates.find((v) => v.id === activeViewId);

  // Get all PIM fields from the current view
  const pimFields = currentView
    ? currentView.sections.flatMap((section: any) => section.attributes)
    : [];

  useEffect(() => {
    if (selectedTemplate) {
      // Load existing mappings from template
      setAllMappings(selectedTemplate.mappings || {});
      setSelectedRetailers(selectedTemplate.retailers || []);
      if (selectedTemplate.retailers && selectedTemplate.retailers.length > 0) {
        setViewMode("map");
      }
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = fieldMappingTemplates.find((t) => t.id === templateId);
    if (template && template.mappings && Object.keys(template.mappings).length > 0) {
      setViewMode("view");
    } else {
      setViewMode("select");
    }
  };

  const handleMappingsChange = (retailerId: string, mappings: Record<string, string | number>) => {
    setAllMappings((prev) => ({
      ...prev,
      [retailerId]: mappings,
    }));
  };

  const handleSaveAll = () => {
    if (onSave) {
      onSave({
        templateId: selectedTemplateId,
        retailers: selectedRetailers,
        mappings: allMappings,
      });
    }
  };

  const handleCreateNewTemplate = () => {
    if (!newTemplateName || !newTemplateCategory) return;

    // Create the new template
    const newTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplateName,
      category: newTemplateCategory,
      categoryId: newTemplateCategory.toLowerCase().replace(/\s+/g, "_"),
      description: newTemplateDescription,
      retailers: selectedRetailers, // Use selected retailers
      mappings: {},
      lastModified: new Date().toISOString().split('T')[0],
      viewId: activeViewId,
    };

    // Add to context
    setFieldMappingTemplates((prev: any) => [...prev, newTemplate]);

    // Select the new template
    setSelectedTemplateId(newTemplate.id);
    setTemplateInput(newTemplateName);
    
    // Reset create mode
    setIsCreatingNewTemplate(false);
    setNewTemplateName("");
    setNewTemplateCategory("");
    setNewTemplateDescription("");
    // Keep selectedRetailers for the next step
  };

  const handleStartMapping = () => {
    if (selectedRetailers.length > 0) {
      setActiveRetailerTab(selectedRetailers[0]);
      setViewMode("map");
    }
  };

  const handleAddRetailer = (retailerId: string) => {
    if (!selectedRetailers.includes(retailerId)) {
      setSelectedRetailers([...selectedRetailers, retailerId]);
      setActiveRetailerTab(retailerId);
    }
  };

  const handleRemoveRetailer = (retailerId: string) => {
    const newRetailers = selectedRetailers.filter(id => id !== retailerId);
    setSelectedRetailers(newRetailers);
    if (activeRetailerTab === retailerId && newRetailers.length > 0) {
      setActiveRetailerTab(newRetailers[0]);
    }
    // Remove mappings for this retailer
    const newMappings = { ...allMappings };
    delete newMappings[retailerId];
    setAllMappings(newMappings);
  };

  const handleRetailerToggle = (retailerId: string) => {
    setSelectedRetailers((prev) =>
      prev.includes(retailerId) ? prev.filter((id) => id !== retailerId) : [...prev, retailerId]
    );
  };

  const retailerDetails: Record<string, { name: string; color: string }> = {
    amazon: { name: "Amazon", color: "bg-orange-500" },
    walmart: { name: "Walmart", color: "bg-blue-600" },
    target: { name: "Target", color: "bg-red-600" },
    shopify: { name: "Shopify", color: "bg-green-600" },
    ebay: { name: "eBay", color: "bg-yellow-500" },
    etsy: { name: "Etsy", color: "bg-orange-600" },
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#DD522C]" />
              Field Mapping Configuration
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure how this product's fields map to different retailers
            </p>
          </div>
          {!isReadOnly && viewMode === "view" && (
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-4 py-2 bg-[#DD522C] hover:bg-[#F27A56] text-white rounded-lg transition-all shadow-md"
            >
              <Save className="h-4 w-4" />
              Save Mappings
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Step 1: Create or Select Template Form */}
        {viewMode === "select" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create or Select Template</h3>
                <p className="text-sm text-gray-600">
                  Choose an existing mapping template or create a new one.
                </p>
              </div>

              <div className="space-y-6">
                {/* Select Template Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Template
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={isCreatingNewTemplate ? newTemplateName : (templateInput || (selectedTemplate?.name || ""))}
                      onChange={(e) => {
                        if (isCreatingNewTemplate) {
                          setNewTemplateName(e.target.value);
                        } else {
                          setTemplateInput(e.target.value);
                          setShowTemplateDropdown(true);
                        }
                      }}
                      onFocus={() => !isCreatingNewTemplate && setShowTemplateDropdown(true)}
                      onBlur={() => setTimeout(() => setShowTemplateDropdown(false), 200)}
                      placeholder={isCreatingNewTemplate ? "Enter new template name" : "Search or Create Template"}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] transition-all group-hover:border-gray-300"
                      readOnly={isCreatingNewTemplate ? false : undefined}
                    />
                    {showTemplateDropdown && !isCreatingNewTemplate && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-slideDown">
                        {/* Create New Template Option */}
                        {templateInput && !fieldMappingTemplates.find(t => t.name.toLowerCase() === templateInput.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingNewTemplate(true);
                              setNewTemplateName(templateInput);
                              setShowTemplateDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#FDE2CF] transition-colors border-b border-gray-100 text-[#DD522C] font-semibold flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Create new template "{templateInput}"
                          </button>
                        )}
                        {/* Existing Templates */}
                        {fieldMappingTemplates
                          .filter((template) =>
                            template.name.toLowerCase().includes(templateInput.toLowerCase())
                          )
                          .map((template) => (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => {
                                setSelectedTemplateId(template.id);
                                setTemplateInput(template.name);
                                setShowTemplateDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-[#FDE2CF] transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <span className="font-medium text-gray-900">{template.name}</span>
                              <span className="text-sm text-gray-500 ml-2">- {template.category}</span>
                            </button>
                          ))}
                        {fieldMappingTemplates.filter((template) =>
                          template.name.toLowerCase().includes(templateInput.toLowerCase())
                        ).length === 0 && !templateInput && (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No templates available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedTemplate && !showTemplateDropdown && !isCreatingNewTemplate && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Template selected
                    </p>
                  )}
                  {isCreatingNewTemplate && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      Creating new template
                    </p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={isCreatingNewTemplate ? (categoryInput || newTemplateCategory) : (selectedTemplate?.category || "")}
                      onChange={isCreatingNewTemplate ? (e) => {
                        setCategoryInput(e.target.value);
                        setNewTemplateCategory(e.target.value);
                        setShowCategoryDropdown(true);
                      } : undefined}
                      onFocus={isCreatingNewTemplate ? () => setShowCategoryDropdown(true) : undefined}
                      onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                      readOnly={!isCreatingNewTemplate}
                      disabled={!isCreatingNewTemplate && !selectedTemplateId}
                      placeholder={isCreatingNewTemplate ? "Select or type a category" : "Search and select Category"}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] transition-all group-hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    {showCategoryDropdown && isCreatingNewTemplate && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-slideDown">
                        {categories
                          .filter((cat) => cat.toLowerCase().includes(categoryInput.toLowerCase()))
                          .map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setNewTemplateCategory(cat);
                                setCategoryInput(cat);
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-[#FDE2CF] transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <span className="font-medium text-gray-900">{cat}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  {((selectedTemplate && !isCreatingNewTemplate) || (isCreatingNewTemplate && newTemplateCategory)) && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Category selected
                    </p>
                  )}
                </div>

                {/* Select Retailers - Multi-select */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Retailers
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={retailerInput}
                      onChange={(e) => {
                        setRetailerInput(e.target.value);
                        setShowRetailerDropdown(true);
                      }}
                      onFocus={() => setShowRetailerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowRetailerDropdown(false), 200)}
                      disabled={!isCreatingNewTemplate && !selectedTemplateId}
                      placeholder={`${selectedRetailers.length} retailer(s) selected`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] transition-all group-hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    {showRetailerDropdown && (selectedTemplate || isCreatingNewTemplate) && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-slideDown">
                        {(isCreatingNewTemplate 
                          ? Object.keys(retailerDetails)
                          : selectedTemplate.retailers
                        )
                          .filter((retailerId) =>
                            (retailerDetails[retailerId]?.name || retailerId)
                              .toLowerCase()
                              .includes(retailerInput.toLowerCase())
                          )
                          .map((retailerId) => (
                            <label
                              key={retailerId}
                              className="flex items-center px-4 py-3 hover:bg-[#FDE2CF] transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRetailers.includes(retailerId)}
                                onChange={() => handleRetailerToggle(retailerId)}
                                className="mr-3 h-4 w-4 text-[#DD522C] focus:ring-[#DD522C] border-gray-300 rounded"
                              />
                              <span className="font-medium text-gray-900">
                                {retailerDetails[retailerId]?.name || retailerId}
                              </span>
                            </label>
                          ))}
                        {(isCreatingNewTemplate 
                          ? Object.keys(retailerDetails)
                          : selectedTemplate.retailers
                        ).filter((retailerId) =>
                          (retailerDetails[retailerId]?.name || retailerId)
                            .toLowerCase()
                            .includes(retailerInput.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No retailers found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedRetailers.length > 0 && !showRetailerDropdown && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {selectedRetailers.length} retailer(s) selected
                    </p>
                  )}
                  {selectedRetailers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedRetailers.map((retailerId) => (
                        <span
                          key={retailerId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#FDE2CF] text-[#DD522C] rounded-full text-xs font-medium"
                        >
                          {retailerDetails[retailerId]?.name || retailerId}
                          <button
                            type="button"
                            onClick={() => handleRetailerToggle(retailerId)}
                            className="hover:bg-[#F27A56] hover:text-white rounded-full p-0.5"
                            aria-label={`Remove ${retailerDetails[retailerId]?.name || retailerId}`}
                            title={`Remove ${retailerDetails[retailerId]?.name || retailerId}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={isCreatingNewTemplate ? newTemplateDescription : (selectedTemplate?.description || "")}
                    onChange={isCreatingNewTemplate ? (e) => setNewTemplateDescription(e.target.value) : undefined}
                    disabled={!isCreatingNewTemplate && !selectedTemplateId}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] resize-none disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Enter description..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    if (isCreatingNewTemplate) {
                      setIsCreatingNewTemplate(false);
                      setNewTemplateName("");
                      setNewTemplateCategory("");
                      setNewTemplateDescription("");
                      setTemplateInput("");
                    }
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  {isCreatingNewTemplate ? "Cancel Creating" : "Cancel"}
                </button>
                {isCreatingNewTemplate ? (
                  <button
                    type="button"
                    onClick={handleCreateNewTemplate}
                    disabled={!newTemplateName || !newTemplateCategory}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Template
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartMapping}
                    disabled={!selectedTemplateId || selectedRetailers.length === 0}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Proceed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Mapping Interface with Tabs */}
        {viewMode === "map" && selectedRetailers.length > 0 && (
          <div className="max-w-full mx-auto">
            {/* Retailer Tabs */}
            <div className="bg-white rounded-t-xl border-2 border-b-0 border-gray-200 overflow-hidden">
              <div className="flex items-center border-b border-gray-200">
                {selectedRetailers.map((retailerId) => (
                  <button
                    key={retailerId}
                    onClick={() => setActiveRetailerTab(retailerId)}
                    className={`px-6 py-3 font-medium transition-all relative ${
                      activeRetailerTab === retailerId
                        ? "text-[#DD522C] border-b-2 border-[#DD522C] bg-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${retailerDetails[retailerId]?.color || 'bg-gray-400'}`}></span>
                      {retailerDetails[retailerId]?.name || retailerId}
                      {allMappings[retailerId] && Object.keys(allMappings[retailerId]).length > 0 && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
                {/* Add Retailer Button */}
                <button
                  onClick={() => setShowAddRetailerModal(true)}
                  className="px-4 py-3 text-gray-500 hover:text-[#DD522C] hover:bg-gray-50 transition-all flex items-center gap-1 border-l border-gray-200"
                  title="Add another retailer"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Active Retailer Mapping */}
            <div className="bg-white rounded-b-xl border-2 border-gray-200">
              {activeRetailerTab && (
                <MappingInterface
                  retailerId={activeRetailerTab}
                  retailerName={retailerDetails[activeRetailerTab]?.name || activeRetailerTab}
                  pimFields={pimFields}
                  existingMappings={allMappings[activeRetailerTab] || {}}
                  onMappingsChange={(mappings) => handleMappingsChange(activeRetailerTab, mappings)}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setViewMode("select")}
                className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Back to Selection
              </button>
              <button
                onClick={() => setViewMode("view")}
                className="px-6 py-3 bg-[#DD522C] hover:bg-[#F27A56] text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Save & Review
              </button>
            </div>
          </div>
        )}

        {/* Add Retailer Modal */}
        {showAddRetailerModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Retailer</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.keys(retailerDetails)
                  .filter((id) => !selectedRetailers.includes(id))
                  .map((retailerId) => (
                    <button
                      key={retailerId}
                      onClick={() => {
                        handleAddRetailer(retailerId);
                        setShowAddRetailerModal(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 hover:border-[#DD522C] hover:bg-[#FDE2CF] rounded-lg transition-all"
                    >
                      <span className={`w-3 h-3 rounded-full ${retailerDetails[retailerId]?.color}`}></span>
                      <span className="font-medium text-gray-900">
                        {retailerDetails[retailerId]?.name}
                      </span>
                    </button>
                  ))}
                {Object.keys(retailerDetails).filter((id) => !selectedRetailers.includes(id)).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    All available retailers have been added
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowAddRetailerModal(false)}
                className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Step 3: View Mappings with Tabs */}
        {viewMode === "view" && selectedRetailers.length > 0 && (
          <div className="max-w-full mx-auto">
            {/* Retailer Tabs for Viewing */}
            <div className="bg-white rounded-t-xl border-2 border-b-0 border-gray-200 overflow-hidden">
              <div className="flex items-center border-b border-gray-200">
                {selectedRetailers.map((retailerId) => (
                  <button
                    key={retailerId}
                    onClick={() => setActiveRetailerTab(retailerId)}
                    className={`px-6 py-3 font-medium transition-all relative ${
                      activeRetailerTab === retailerId
                        ? "text-[#DD522C] border-b-2 border-[#DD522C] bg-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${retailerDetails[retailerId]?.color || 'bg-gray-400'}`}></span>
                      {retailerDetails[retailerId]?.name || retailerId}
                      {allMappings[retailerId] && Object.keys(allMappings[retailerId]).length > 0 && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Retailer View */}
            <div className="bg-white rounded-b-xl border-2 border-gray-200 p-6">
              {activeRetailerTab && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {retailerDetails[activeRetailerTab]?.name || activeRetailerTab} Field Mapping
                    </h3>
                    <p className="text-sm text-gray-600">
                      Review the field mappings for this retailer
                    </p>
                  </div>
                  
                  {allMappings[activeRetailerTab] && Object.keys(allMappings[activeRetailerTab]).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Retailer Field</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">PIM Field</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(allMappings[activeRetailerTab]).map(([retailerField, pimFieldId]) => {
                            const pimField = pimFields.find((f: any) => f.id === pimFieldId);
                            const currentValue = pimField ? productData[0]?.[pimField.id] : '';
                            
                            return (
                              <tr key={retailerField} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{retailerField}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{pimField?.name || pimFieldId}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{currentValue || 'No mapping'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No mappings configured for this retailer yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setViewMode("select")}
                className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Change Template
              </button>
              <button
                onClick={() => setViewMode("map")}
                className="flex-1 px-6 py-3 bg-[#DD522C] hover:bg-[#F27A56] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Settings className="h-5 w-5" />
                Edit Mappings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldMappingTab;
