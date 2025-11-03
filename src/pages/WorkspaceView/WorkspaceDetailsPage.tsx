import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Edit, Archive, Package, Settings, Calendar, Clock, 
  Briefcase, Globe, Tag, Activity, TrendingUp, ExternalLink,
  MoreVertical, Copy, Trash2, RefreshCw, Store, Hash
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchWorkspaceDetail } from "../../redux/slices/workspaceViewSlice";

const Tooltip = ({ content, position = "top", children, delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);
  const timeoutRef = useRef();

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
      right: [rect.top + scrollY + rect.height / 2, rect.right + scrollX + 8]
    };
    const [top, left] = positions[position];
    setTooltipPosition({ top, left });
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
    right: "translateY(-50%)"
  };

  const arrowStyles = {
    top: { top: "100%", left: "50%", transform: "translateX(-50%) translateY(-50%)" },
    bottom: { bottom: "100%", left: "50%", transform: "translateX(-50%) translateY(50%)" },
    left: { left: "100%", top: "50%", transform: "translateX(-50%) translateY(-50%)" },
    right: { right: "100%", top: "50%", transform: "translateX(50%) translateY(-50%)" }
  };

  const tooltipContent = isVisible && mounted ? (
    <div
      className="fixed z-[10000] px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
      style={{ top: tooltipPosition.top, left: tooltipPosition.left, transform: transforms[position] }}
    >
      {content}
      <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45" style={arrowStyles[position]} />
    </div>
  ) : null;

  return (
    <>
      <div ref={triggerRef} className="inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
      {mounted && createPortal(tooltipContent, document.body)}
    </>
  );
};

// Component to generate workspace avatar
const WorkspaceAvatar = ({ name, size = "large" }) => {
  const getInitials = (name) => name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);

  const getColorFromName = (name) => {
    const colors = ['bg-orange-600', 'bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-yellow-600', 'bg-red-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-12 h-12 text-base", 
    large: "w-16 h-16 text-xl"
  };

  return (
    <div className={`${getColorFromName(name)} ${sizeClasses[size]} rounded-lg flex items-center justify-center text-white font-semibold`}>
      {getInitials(name)}
    </div>
  );
};

export default function WorkspaceDetailPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');
  const [activeRetailerTab, setActiveRetailerTab] = useState('');
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsRef = useRef(null);
  const dispatch = useDispatch();
  const { workspaceDetail, detailStatus: loading, detailError: error } = useSelector((state) => state.workspaceView);

  useEffect(() => {
    if (id) dispatch(fetchWorkspaceDetail(id));
  }, [dispatch, id]); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) setIsActionsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleEdit = () => console.log(`Editing workspace ${workspaceDetail?.id}`);
  const handleDuplicate = () => { console.log(`Duplicating workspace ${workspaceDetail?.id}`); setIsActionsOpen(false); };
  const handleArchive = () => { console.log(`Archiving workspace ${workspaceDetail?.id}`); setIsActionsOpen(false); };
  const handleDelete = () => { console.log(`Deleting workspace ${workspaceDetail?.id}`); setIsActionsOpen(false); };

  // Function to organize workspace data by retailers
  const getRetailerData = () => {
    if (!workspaceDetail?.settings) return [];
    const retailerMap = new Map();

    workspaceDetail.settings.forEach(setting => {
      if (setting.retailer?.retailer_name) {
        const retailerName = setting.retailer.retailer_name;
        if (!retailerMap.has(retailerName)) {
          retailerMap.set(retailerName, {
            name: retailerName,
            url: setting.retailer.url,
            categories: new Map()
          });
        }

        const retailer = retailerMap.get(retailerName);
        const categoryName = setting.category?.name || 'Uncategorized';
        if (!retailer.categories.has(categoryName)) {
          retailer.categories.set(categoryName, {
            name: categoryName,
            brands: new Set()
          });
        }

        if (setting.brand) retailer.categories.get(categoryName).brands.add(setting.brand);
      }
    });

    return Array.from(retailerMap.values()).map(retailer => ({
      ...retailer,
      categories: Array.from(retailer.categories.values()).map(category => ({
        ...category,
        brands: Array.from(category.brands)
      }))
    }));
  };

  const retailers = getRetailerData();
  const mainTabs = [
    { id: 'overview', label: 'Overview', icon: <Globe className="h-4 w-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="h-4 w-4" /> }
  ];
  const activeRetailer = retailers.find(r => r.name === activeRetailerTab);

  useEffect(() => {
    if (retailers.length > 0 && !activeRetailerTab) setActiveRetailerTab(retailers[0].name);
  }, [retailers, activeRetailerTab]);

  if (loading === 'loading') return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
        <p className="mt-4 text-base text-gray-900">Loading workspace details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-100 p-4 rounded-full inline-flex">
          <Activity className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mt-4 text-2xl text-gray-900 font-semibold">Failed to load workspace</h2>
        <p className="mt-2 text-base text-gray-600">{error}</p>
        <button
          onClick={() => dispatch(fetchWorkspaceDetail(id))}
          className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!workspaceDetail) return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-gray-100 p-4 rounded-full inline-flex">
          <Package className="h-8 w-8 text-gray-600" />
        </div>
        <h2 className="mt-4 text-2xl text-gray-900 font-semibold">Workspace not found</h2>
        <p className="mt-2 text-base text-gray-600">The requested workspace could not be loaded.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col font-sans">
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <WorkspaceAvatar name={workspaceDetail.name} size="large" />
              <div>
                <h1 className="text-3xl text-white font-bold">{workspaceDetail.name}</h1>
                <div className="flex gap-4 text-base text-orange-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Created: {formatDate(workspaceDetail.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Updated: {formatDate(workspaceDetail.updated_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Tooltip content="Edit Workspace" position="bottom">
                <button onClick={handleEdit} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                  <Edit className="h-5 w-5" />
                </button>
              </Tooltip>
              
              <div className="relative" ref={actionsRef}>
                <Tooltip content="More Actions" position="bottom">
                  <button onClick={() => setIsActionsOpen(!isActionsOpen)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </Tooltip>
                
                {isActionsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button onClick={handleArchive} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors text-base">
                      <Archive className="h-4 w-4 text-yellow-600" /> Archive Workspace
                    </button>
                    <hr className="border-gray-200" />

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex space-x-8">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-8 px-8 w-full">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl text-gray-900 font-semibold mb-6">Retailer Details</h3>
              
              {retailers.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {retailers.map((retailer) => (
                        <button
                          key={retailer.name}
                          onClick={() => setActiveRetailerTab(retailer.name)}
                          className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeRetailerTab === retailer.name
                              ? 'border-orange-600 text-orange-600'
                              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200'
                          }`}
                        >
                          <Store className="h-4 w-4" />
                          {retailer.name}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {activeRetailer && (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Store className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-xl text-gray-900 font-semibold">{activeRetailer.name}</h4>
                            <p className="text-gray-600">
                              {activeRetailer.categories.length} categories, {' '}
                              {activeRetailer.categories.reduce((sum, cat) => sum + cat.brands.length, 0)} brands
                            </p>
                          </div>
                        </div>
                        {activeRetailer.url && (
                          <Tooltip content="Visit Website" position="left">
                            <a href={activeRetailer.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <ExternalLink className="h-4 w-4" /> Visit Store
                            </a>
                          </Tooltip>
                        )}
                      </div>

                      <div className="space-y-6">
                        {activeRetailer.categories.map((category, categoryIndex) => (
                          <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <Tag className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h5 className="text-lg font-semibold text-gray-900">{category.name}</h5>
                                <p className="text-sm text-gray-600">{category.brands.length} brands</p>
                              </div>
                            </div>
                            
                            {category.brands.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {category.brands.map((brand, brandIndex) => (
                                  <div key={brandIndex} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Hash className="h-4 w-4 text-purple-600" />
                                    <span className="font-medium text-gray-900">{brand}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No brands configured for this category</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Retailers Found</h4>
                  <p className="text-gray-600">This workspace doesn't have any retailers configured yet.</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl text-gray-900 font-semibold mb-4">Settings Configuration</h3>
              <div className="grid gap-6">
                {workspaceDetail.settings?.map((setting, index) => (
                  <div key={setting.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Briefcase className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-xl text-gray-900 font-semibold">Setting {index + 1}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-orange-100 text-purple-600">
                              {setting.category?.name || "No category"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {setting.retailer?.url && (
                        <Tooltip content="View Retailer Website" position="left">
                          <a href={setting.retailer.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-orange-100 transition-colors">
                            <ExternalLink className="h-4 w-4 text-gray-600" />
                          </a>
                        </Tooltip>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">Retailer</p>
                        <p className="text-base font-medium text-gray-900">
                          {setting.retailer?.retailer_name || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="text-base font-medium text-gray-900">
                          {setting.category?.name || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Brand</p>
                        <p className="text-base font-medium text-gray-900">
                          {setting.brand || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h3 className="text-2xl text-gray-900 font-semibold">Activity Log</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="text-xl text-gray-900 font-semibold">Recent Changes</h4>
                  <p className="text-base text-gray-600">
                    Workspace created on {formatDate(workspaceDetail.created_at)} and last updated on {formatDate(workspaceDetail.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}