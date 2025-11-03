import { useState, useEffect } from "react";
import {
  Search,
  Edit,
  Save,
  Settings,
  Check,
  X,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function ProductViewMode({
  viewTemplates,
  productData,
  setProductData,
  picklistOptions,
  activeViewId,
  setActiveViewId,
  setCurrentPage,
  handleSaveChanges,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSku, setEditingSku] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempSku, setTempSku] = useState("");

  const currentViewTemplate =
    viewTemplates.find((v) => v.id === activeViewId) || viewTemplates[0];

  useEffect(() => {
    const initialExpanded = {};
    currentViewTemplate.sections.forEach((section) => {
      initialExpanded[section.id] = true;
    });
    setExpandedSections(initialExpanded);
    setTempTitle(productData[1] || "");
    setTempSku(productData[2] || "");
  }, [currentViewTemplate, productData]);

  const filteredSections = currentViewTemplate.sections
    .filter(
      (section) =>
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.attributes.some(
          (attr) =>
            attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (productData[attr.id] &&
              productData[attr.id]
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
        )
    )
    .sort((a, b) => a.order - b.order);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const updateProductData = (attributeId, newValue) => {
    setProductData((prev) => ({
      ...prev,
      [attributeId]: newValue,
    }));
  };

  const handleViewChange = (viewId) => {
    setActiveViewId(viewId);
    setShowViewDropdown(false);
  };

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderAttributeInput = (attribute) => {
    const baseClasses =
      "w-full h-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    const value = productData[attribute.id] || "";

    switch (attribute.type) {
      case "Boolean":
        return (
          <div className="flex items-center gap-2 h-7">
            <label className="relative inline-flex items-center cursor-pointer w-9 h-5">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) =>
                  updateProductData(attribute.id, e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-200 rounded-full peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors duration-200"></div>
              <div className="absolute left-[1.6px] top-[1.6px] w-4 h-4 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-4"></div>
            </label>
            <span className="text-xs font-medium text-gray-700">
              {value ? "Yes" : "No"}
            </span>
          </div>
        );
      case "Picklist":
        return (
          <select
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={`${baseClasses}`}
          >
            <option value="">Select an option</option>
            {(picklistOptions[attribute.id] || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "Number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
            step="any"
          />
        );
      case "Date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
          />
        );
      case "Text":
        return (
          <textarea
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={`${baseClasses} h-20 resize-none`}
            rows={3}
          />
        );
      case "Rich Text":
        return (
          <textarea
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={`${baseClasses} h-26 resize-none`}
            rows={5}
            placeholder="Enter rich text content..."
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateProductData(attribute.id, e.target.value)}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-4/5 min-w-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-xl font-bold text-gray-900 mb-5">
            Product Sections
          </h1>
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Search sections or attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-base text-gray-600 mb-3">
            Navigate through product information
          </p>

          <div className="space-y-2">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-gray-900 truncate">
                      {section.title}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {section.attributes.length}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="mb-2">
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-2xl font-bold border-2 border-blue-500 px-3 py-2 rounded-md focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        updateProductData(1, tempTitle);
                        setEditingTitle(false);
                      }}
                      className="h-8 w-8 p-0 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setTempTitle(productData[1] || "");
                        setEditingTitle(false);
                      }}
                      className="h-8 w-8 p-0 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {productData[1] || "Untitled Product"}
                    </h1>
                    <button
                      onClick={() => {
                        setEditingTitle(true);
                        setTempTitle(productData[1] || "");
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-gray-100 rounded-md"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-5 text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">SKU:</span>
                  {editingSku ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={tempSku}
                        onChange={(e) => setTempSku(e.target.value)}
                        className="h-6 px-2 border border-blue-500 rounded-md focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateProductData(2, tempSku);
                            setEditingSku(false);
                          }
                          if (e.key === "Escape") {
                            setTempSku(productData[2] || "");
                            setEditingSku(false);
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          updateProductData(2, tempSku);
                          setEditingSku(false);
                        }}
                        className="h-6 w-6 p-0 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          setTempSku(productData[2] || "");
                          setEditingSku(false);
                        }}
                        className="h-6 w-6 p-0 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <span className="font-semibold">
                        {productData[2] || "No SKU"}
                      </span>
                      <button
                        onClick={() => {
                          setEditingSku(true);
                          setTempSku(productData[2] || "");
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 hover:bg-gray-100 rounded-md"
                      >
                        <Edit className="w-2.4 h-2.4" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-gray-400">•</span>
                <span>
                  Last updated: <span className="font-medium">2 hours ago</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                  className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
                >
                  <Layers className="w-3 h-3" />
                  <span>{currentViewTemplate.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showViewDropdown && (
                  <div className="absolute top-full right-0 mt-0.8 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-52">
                    <div className="p-2 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-700">
                        Product Views
                      </span>
                    </div>
                    {viewTemplates.map((view) => (
                      <button
                        key={view.id}
                        onClick={() => handleViewChange(view.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2">
                            {view.name}
                            {view.isDefault && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                                Default
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.8">
                            {view.description}
                          </span>
                        </div>
                        {activeViewId === view.id && (
                          <Check className="w-3 h-3 text-blue-600" />
                        )}
                      </button>
                    ))}
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={() => setCurrentPage("views")}
                        className="w-full flex items-center gap-2 px-2 py-1.6 text-xs text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Settings className="w-3 h-3" />
                        Manage All Views
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setCurrentPage("config")}
                className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium"
              >
                <Settings className="w-3 h-3" />
                Configure
              </button>
              <button
                onClick={() => {
                  console.log(
                    "Product View Data:",
                    JSON.stringify(
                      {
                        viewName: currentViewTemplate.name,
                        structure: currentViewTemplate.sections.map(
                          (section) => ({
                            title: section.title,
                            attributes: section.attributes.map((attr) => {
                              const attributeData = {
                                name: attr.name,
                                value: productData[attr.id] || null,
                              } as any;
                              if (attr.type === "Picklist") {
                                attributeData.options = picklistOptions[attr.id] || [];
                              }
                              return attributeData;
                            }),
                          })
                        ),
                      },
                      null,
                      2
                    )
                  );
                  handleSaveChanges();
                }}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Save className="w-3 h-3" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="p-5">
          <div className="space-y-5">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                id={`section-${section.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1.6 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        {expandedSections[section.id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <h3 className="text-lg font-bold text-gray-900">
                        {section.title}
                      </h3>
                    </div>
                    <span className="text-xs px-2 py-0.8 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {section.attributes.length} fields
                    </span>
                  </div>
                </div>

                {expandedSections[section.id] && (
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {section.attributes.map((attribute) => (
                        <div key={attribute.id} className="space-y-1.6">
                          <label className="block text-xs font-semibold text-gray-700">
                            {attribute.name}
                            {attribute.required && (
                              <span className="text-red-500 ml-0.8">*</span>
                            )}
                          </label>
                          {renderAttributeInput(attribute)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}