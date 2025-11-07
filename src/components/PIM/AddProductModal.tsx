import { useState, useEffect, useRef } from "react";
import { X, Plus, Package, Upload, ChevronRight, ChevronLeft, Check, ShoppingBag, Sparkles } from "lucide-react";
import { useProductData } from "../../context/ProductDataContext";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductModalData) => void;
}

interface ProductModalData {
  type: "single" | "bulk";
  productName?: string;
  category?: string;
  viewTemplateId?: string;
  selectedRetailers?: string[];
}

interface NewProduct {
  name: string;
  category: string;
  viewTemplateId: string;
}

const AddProductModal = ({ isOpen, onClose, onSubmit }: AddProductModalProps) => {
  const { viewTemplates, picklistOptions } = useProductData();
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [productType, setProductType] = useState<"single" | "bulk" | "">("");
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    category: "",
    viewTemplateId: "",
  });
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [availableRetailers, setAvailableRetailers] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get categories from picklist options
  const categories = picklistOptions?.Category || [
    "Electronics",
    "Automotive",
    "Fashion",
    "Home & Garden",
    "Sports & Outdoors",
    "Toys & Games",
    "Books",
    "Health & Beauty"
  ];

  // Retailer details
  const retailerDetails: Record<string, { name: string; color: string }> = {
    amazon: { name: "Amazon", color: "bg-orange-500" },
    walmart: { name: "Walmart", color: "bg-blue-600" },
    target: { name: "Target", color: "bg-red-600" },
    shopify: { name: "Shopify", color: "bg-green-600" },
    ebay: { name: "eBay", color: "bg-yellow-500" },
    etsy: { name: "Etsy", color: "bg-orange-600" },
  };

  useEffect(() => {
    if (newProduct.viewTemplateId) {
      const selectedView = viewTemplates.find((v) => v.id === newProduct.viewTemplateId);
      if (selectedView?.defaultFieldMapping?.enabledRetailers) {
        setAvailableRetailers(selectedView.defaultFieldMapping.enabledRetailers);
      } else {
        setAvailableRetailers([]);
      }
    }
  }, [newProduct.viewTemplateId, viewTemplates]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentStep(1);
    setProductType("");
    setNewProduct({ name: "", category: "", viewTemplateId: "" });
    setSelectedRetailers([]);
    setCategoryInput("");
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 1 && productType) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsAnimating(false);
      }, 300);
    } else if (currentStep === 2 && newProduct.name && newProduct.category && newProduct.viewTemplateId) {
      if (availableRetailers.length > 0) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(3);
          setIsAnimating(false);
        }, 300);
      } else {
        handleSubmit();
      }
    } else if (currentStep === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      type: productType as "single" | "bulk",
      productName: newProduct.name,
      category: newProduct.category,
      viewTemplateId: newProduct.viewTemplateId,
      selectedRetailers: selectedRetailers.length > 0 ? selectedRetailers : undefined,
    });
    handleClose();
  };

  const handleRetailerToggle = (retailerId: string) => {
    setSelectedRetailers((prev) =>
      prev.includes(retailerId)
        ? prev.filter((id) => id !== retailerId)
        : [...prev, retailerId]
    );
  };

  const handleSelectAllRetailers = () => {
    setSelectedRetailers(availableRetailers);
  };

  const handleDeselectAllRetailers = () => {
    setSelectedRetailers([]);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categoryInput.toLowerCase())
  );

  const canProceed = () => {
    if (currentStep === 1) return productType !== "";
    if (currentStep === 2) return newProduct.name && newProduct.category && newProduct.viewTemplateId;
    if (currentStep === 3) return true; // Can skip retailer selection
    return false;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(60, 61, 61, 0.5)] backdrop-blur-[2px] animate-fadeIn" >
      <div ref={modalRef} className="bg-white rounded-2xl p-8 w-full max-w-7xl shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-slideUp">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all z-10"
          aria-label="Close modal"
          title="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#DD522C] rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
            <p className="text-sm text-gray-500">Create product in just a few steps</p>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className={`flex items-center ${index < 2 ? 'progress-step-flex' : 'progress-step-last'}`}>
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-[#DD522C] text-white shadow-lg scale-110"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {currentStep === step && (
                    <div className="absolute inset-0 rounded-full bg-[#DD522C] animate-ping opacity-20" />
                  )}
                </div>
                {index < 2 && (
                  <div className="flex-1 h-1 mx-3 rounded-full overflow-hidden bg-gray-200">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        currentStep > step ? "bg-[#DD522C] w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium progress-labels">
            <span className={currentStep >= 1 ? "text-[#DD522C]" : "text-gray-500"}>
              Product Type
            </span>
            <span className={currentStep >= 2 ? "text-[#DD522C]" : "text-gray-500"}>
              Basic Info
            </span>
            <span className={currentStep >= 3 ? "text-[#DD522C]" : "text-gray-500"}>
              Retailers
            </span>
          </div>
        </div>

        {/* Content Area with Animation */}
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>

        {/* Step 1: Product Type Selection */}
        {currentStep === 1 && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                What would you like to add?
              </h3>
              <p className="text-gray-600">
                Choose whether to add a single product or import multiple products at once
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <button
                onClick={() => setProductType("single")}
                className={`group relative p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  productType === "single"
                    ? "border-[#DD522C] bg-[#FDE2CF] shadow-lg"
                    : "border-gray-200 hover:border-[#F27A56] hover:shadow-md bg-white"
                }`}
              >
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all ${
                  productType === "single"
                    ? "border-[#DD522C] bg-[#DD522C]"
                    : "border-gray-300"
                }`}>
                  {productType === "single" && (
                    <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                  productType === "single"
                    ? "bg-[#DD522C] shadow-lg"
                    : "bg-gray-100 group-hover:bg-[#FDE2CF]"
                }`}>
                  <Package className={`h-8 w-8 transition-all ${
                    productType === "single" ? "text-white" : "text-gray-600 group-hover:text-[#DD522C]"
                  }`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Single Product</h3>
                <p className="text-sm text-gray-600">Perfect for adding individual products with detailed information</p>
              </button>
              <button
                onClick={() => setProductType("bulk")}
                className={`group relative p-8 border-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  productType === "bulk"
                    ? "border-[#DD522C] bg-[#FDE2CF] shadow-lg"
                    : "border-gray-200 hover:border-[#F27A56] hover:shadow-md bg-white"
                }`}
              >
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all ${
                  productType === "bulk"
                    ? "border-[#DD522C] bg-[#DD522C]"
                    : "border-gray-300"
                }`}>
                  {productType === "bulk" && (
                    <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                  productType === "bulk"
                    ? "bg-[#DD522C] shadow-lg"
                    : "bg-gray-100 group-hover:bg-[#FDE2CF]"
                }`}>
                  <Upload className={`h-8 w-8 transition-all ${
                    productType === "bulk" ? "text-white" : "text-gray-600 group-hover:text-[#DD522C]"
                  }`} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Bulk Import</h3>
                <p className="text-sm text-gray-600">Import multiple products at once using CSV files</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Information */}
        {currentStep === 2 && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Product Details
              </h3>
              <p className="text-gray-600">
                Tell us about your product
              </p>
            </div>
            <div className="space-y-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Package className="h-4 w-4 text-[#DD522C]" />
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="e.g., Premium Wireless Headphones"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] transition-all group-hover:border-gray-300"
                  required
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="h-4 w-4 text-[#DD522C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={categoryInput || newProduct.category}
                    onChange={(e) => {
                      setCategoryInput(e.target.value);
                      setNewProduct({ ...newProduct, category: e.target.value });
                      setShowCategoryDropdown(true);
                    }}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                    placeholder="Select or type a category"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] transition-all group-hover:border-gray-300"
                    required
                  />
                  {showCategoryDropdown && filteredCategories.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-slideDown">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setNewProduct({ ...newProduct, category: cat });
                            setCategoryInput(cat);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-[#FDE2CF] transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-900">{cat}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {newProduct.category && !showCategoryDropdown && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Category selected
                  </p>
                )}
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="h-4 w-4 text-[#DD522C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Template <span className="text-red-500">*</span>
                </label>
                <select
                  value={newProduct.viewTemplateId}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, viewTemplateId: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C] transition-all group-hover:border-gray-300 bg-white"
                  required
                  aria-label="View template"
                  title="View template"
                >
                  <option value="" disabled>
                    Choose a template for your product
                  </option>
                  {viewTemplates.map((view) => (
                    <option key={view.id} value={view.id}>
                      {view.name}
                    </option>
                  ))}
                </select>
                {newProduct.viewTemplateId && (
                  <div className="mt-3 p-4 bg-[#FDE2CF] border border-[#F27A56] rounded-xl">
                    <p className="text-sm text-gray-900 font-medium mb-1">
                      📋 {viewTemplates.find((v) => v.id === newProduct.viewTemplateId)?.name}
                    </p>
                    <p className="text-xs text-gray-700">
                      {viewTemplates.find((v) => v.id === newProduct.viewTemplateId)?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Retailer Selection */}
        {currentStep === 3 && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Retailers
              </h3>
              <p className="text-gray-600">
                Select where you want to sell this product
              </p>
            </div>
            
            {availableRetailers.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#DD522C] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{selectedRetailers.length}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      of {availableRetailers.length} retailers selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllRetailers}
                      className="px-3 py-1.5 text-sm text-[#DD522C] hover:text-[#F27A56] hover:bg-[#FDE2CF] rounded-lg font-medium transition-all"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllRetailers}
                      className="px-3 py-1.5 text-sm text-[#DD522C] hover:text-[#F27A56] hover:bg-[#FDE2CF] rounded-lg font-medium transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {availableRetailers.map((retailerId) => {
                    const retailer = retailerDetails[retailerId];
                    if (!retailer) return null;
                    
                    return (
                      <label
                        key={retailerId}
                        className={`group relative flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          selectedRetailers.includes(retailerId)
                            ? "border-[#DD522C] bg-[#FDE2CF] shadow-lg"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRetailers.includes(retailerId)}
                          onChange={() => handleRetailerToggle(retailerId)}
                          className="mr-4 h-5 w-5 text-[#DD522C] focus:ring-[#DD522C] border-gray-300 rounded transition-all"
                        />
                        <div className="flex items-center flex-1">
                          <div className={`w-12 h-12 rounded-xl ${retailer.color} mr-3 flex items-center justify-center shadow-md`}>
                            <span className="text-white font-bold text-sm">
                              {retailer.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">{retailer.name}</span>
                        </div>
                        {selectedRetailers.includes(retailerId) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#DD522C] rounded-full flex items-center justify-center shadow-lg">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>

              </>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium mb-2">No retailers available</p>
                <p className="text-sm text-gray-500">This view template doesn't have any retailers mapped yet.<br />You can add retailers later from the product details page.</p>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex justify-between gap-4 pt-8 mt-8 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={currentStep === 1 ? handleClose : handleBack}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105"
          >
            {currentStep === 1 ? (
              <>
                <X className="h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" /> Back
              </>
            )}
          </button>
          <div className="flex gap-3">
            {currentStep === 3 && availableRetailers.length > 0 && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105"
              >
                Skip for now
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg ${
                canProceed()
                  ? "bg-[#DD522C] hover:bg-[#F27A56] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {currentStep === 3 || (currentStep === 2 && availableRetailers.length === 0) ? (
                <>
                  <Plus className="h-4 w-4" /> Create Product
                </>
              ) : (
                <>
                  Continue <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
