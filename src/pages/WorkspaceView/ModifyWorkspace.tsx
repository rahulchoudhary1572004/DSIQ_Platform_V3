import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  Store,
  Tag,
  Hash,
  Settings,
  Edit3
} from "lucide-react";

const Tooltip = ({ content, position = "top", children, delay = 200 }: any) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    const positions = {
      top: [rect.top + scrollY - 35, rect.left + scrollX + rect.width / 2],
      bottom: [rect.bottom + scrollY + 8, rect.left + scrollX + rect.width / 2],
      left: [rect.top + scrollY + rect.height / 2, rect.left + scrollX - 8],
      right: [rect.top + scrollY + rect.height / 2, rect.right + scrollX + 8],
    };
    setTooltipPosition({
      top: positions[position][0],
      left: positions[position][1],
    });
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const transforms = {
    top: "translateX(-50%)",
    bottom: "translateX(-50%)",
    left: "translateX(-100%) translateY(-50%)",
    right: "translateY(-50%)",
  };

  const arrowStyles = {
    top: {
      top: "100%",
      left: "50%",
      transform: "translateX(-50%) translateY(-50%)",
    },
    bottom: {
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%) translateY(50%)",
    },
    left: {
      left: "100%",
      top: "50%",
      transform: "translateX(-50%) translateY(-50%)",
    },
    right: {
      right: "100%",
      top: "50%",
      transform: "translateX(50%) translateY(-50%)",
    },
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {mounted &&
        isVisible &&
        createPortal(
          <div
            className="fixed z-[10000] px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: transforms[position],
            }}
          >
            {content}
            <div
              className="absolute w-2 h-2 bg-gray-800 transform rotate-45"
              style={arrowStyles[position]}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default function ModifyWorkspacePage() {
  // Mock workspace ID for demo
  const workspaceId = "workspace-123";
  
  // Form state
  const [workspaceName, setWorkspaceName] = useState("");
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Mock data for dropdowns (in real app, these would come from API)
  const availableRetailers = [
    { id: 1, name: "Amazon", url: "https://amazon.com" },
    { id: 2, name: "Walmart", url: "https://walmart.com" },
    { id: 3, name: "Target", url: "https://target.com" },
    { id: 4, name: "Best Buy", url: "https://bestbuy.com" },
    { id: 5, name: "Home Depot", url: "https://homedepot.com" }
  ];

  const availableCategories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Home & Garden" },
    { id: 3, name: "Clothing & Accessories" },
    { id: 4, name: "Sports & Outdoors" },
    { id: 5, name: "Books & Media" },
    { id: 6, name: "Health & Beauty" }
  ];

  // Mock initial data load
  useEffect(() => {
    const loadWorkspaceData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock workspace data
        setWorkspaceName("Sample E-commerce Workspace");
        setSettings([
          {
            id: 1,
            retailer: { id: 1, retailer_name: "Amazon", url: "https://amazon.com" },
            category: { id: 1, name: "Electronics" },
            brand: "Samsung"
          },
          {
            id: 2,
            retailer: { id: 2, retailer_name: "Walmart", url: "https://walmart.com" },
            category: { id: 2, name: "Home & Garden" },
            brand: "Black+Decker"
          }
        ]);
      } catch (err) {
        setError("Failed to load workspace data");
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      loadWorkspaceData();
    }
  }, [workspaceId]);

  const addNewSetting = () => {
    const newSetting = {
      id: Date.now(),
      retailer: null,
      category: null,
      brand: ""
    };
    setSettings([...settings, newSetting]);
    setHasChanges(true);
  };

  const removeSetting = (settingId) => {
    setSettings(settings.filter(s => s.id !== settingId));
    setHasChanges(true);
  };

  const updateSetting = (settingId, field, value) => {
    setSettings(settings.map(setting => {
      if (setting.id === settingId) {
        return { ...setting, [field]: value };
      }
      return setting;
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!workspaceName.trim()) {
      setError("Workspace name is required");
      return;
    }

    if (settings.length === 0) {
      setError("At least one setting configuration is required");
      return;
    }

    // Validate settings
    for (let setting of settings) {
      if (!setting.retailer || !setting.category) {
        setError("All settings must have a retailer and category selected");
        return;
      }
    }

    setIsSaving(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage("Workspace updated successfully!");
      setHasChanges(false);
      
      // Auto-hide success message and simulate navigation
      setTimeout(() => {
        setSuccessMessage("");
        alert("Would navigate back to workspaces page");
      }, 2000);
    } catch (err) {
      setError("Failed to update workspace. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        alert("Would navigate back to workspaces page");
      }
    } else {
      alert("Would navigate back to workspaces page");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tooltip content="Back to Workspaces" position="bottom">
                <button
                  onClick={handleCancel}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </Tooltip>
              <div>
                <h1 className="text-3xl text-white font-bold">Modify Workspace</h1>
                <p className="text-orange-100">Edit workspace configuration and settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto py-8 px-8 w-full">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Edit3 className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => {
                    setWorkspaceName(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="Enter workspace name"
                />
              </div>
            </div>
          </div>

          {/* Settings Configuration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Settings Configuration</h2>
                  <p className="text-sm text-gray-600">Configure retailers, categories, and brands</p>
                </div>
              </div>
              
              <button
                onClick={addNewSetting}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Setting
              </button>
            </div>

            <div className="space-y-4">
              {settings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No settings configured. Add your first setting to get started.</p>
                </div>
              ) : (
                settings.map((setting, index) => (
                  <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Setting {index + 1}</h3>
                      <Tooltip content="Remove Setting" position="left">
                        <button
                          onClick={() => removeSetting(setting.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Retailer Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Store className="h-4 w-4 inline mr-1" />
                          Retailer *
                        </label>
                        <select
                          value={setting.retailer?.id || ""}
                          onChange={(e) => {
                            const retailer = availableRetailers.find(r => r.id === parseInt(e.target.value));
                            updateSetting(setting.id, 'retailer', retailer ? {
                              id: retailer.id,
                              retailer_name: retailer.name,
                              url: retailer.url
                            } : null);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                        >
                          <option value="">Select Retailer</option>
                          {availableRetailers.map((retailer) => (
                            <option key={retailer.id} value={retailer.id}>
                              {retailer.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Tag className="h-4 w-4 inline mr-1" />
                          Category *
                        </label>
                        <select
                          value={setting.category?.id || ""}
                          onChange={(e) => {
                            const category = availableCategories.find(c => c.id === parseInt(e.target.value));
                            updateSetting(setting.id, 'category', category ? {
                              id: category.id,
                              name: category.name
                            } : null);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                        >
                          <option value="">Select Category</option>
                          {availableCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Brand Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Hash className="h-4 w-4 inline mr-1" />
                          Brand
                        </label>
                        <input
                          type="text"
                          value={setting.brand || ""}
                          onChange={(e) => updateSetting(setting.id, 'brand', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                          placeholder="Enter brand name"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}