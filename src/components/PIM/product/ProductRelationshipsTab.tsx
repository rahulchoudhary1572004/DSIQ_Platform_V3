import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
} from 'lucide-react';
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { process } from "@progress/kendo-data-query";

/**
 * ProductRelationshipsTab Component
 * 
 * A comprehensive relational hub for managing product relationships across channels.
 * Supports both predefined and custom relationship types with dynamic field mapping.
 */
const ProductRelationshipsTab = ({
  productSku,
  productName,
  availableChannels = [],
  relationTypes = [],
  onAddRelationship,
  onRemoveRelationship,
  onUpdateRelationship,
}) => {
  // State Management
  const [selectedChannels, setSelectedChannels] = useState(['all']);
  const [activeRelationType, setActiveRelationType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [relationshipsData, setRelationshipsData] = useState({});
  const [gridFilter, setGridFilter] = useState<any>({ logic: "and", filters: [] });
  const [sort, setSort] = useState([]);
  const [page, setPage] = useState({ skip: 0, take: 10 });
  
  // Modal State
  const [modalStep, setModalStep] = useState(1);
  const [modalProductSearch, setModalProductSearch] = useState('');
  const [modalSelectedProduct, setModalSelectedProduct] = useState(null);
  const [modalSelectedChannels, setModalSelectedChannels] = useState([]);
  const [modalFieldMappings, setModalFieldMappings] = useState({});

  // Default relation types if not provided
  const defaultRelationTypes = [
    { id: 'bundles', name: 'Bundles / Kits', custom: false },
    { id: 'accessories', name: 'Accessories', custom: false },
    { id: 'replacement-parts', name: 'Replacement Parts', custom: false },
    { id: 'upsells', name: 'Upsells', custom: false },
    { id: 'cross-sells', name: 'Cross-sells', custom: false },
    { id: 'variants', name: 'Variants', custom: false },
    { id: 'substitutes', name: 'Substitutes', custom: false },
  ];

  const allRelationTypes = relationTypes.length > 0 ? relationTypes : defaultRelationTypes;

  // Default available channels
  const defaultChannels = [
    { id: 'amazon', name: 'Amazon', icon: 'A', color: '#FF9900' },
    { id: 'walmart', name: 'Walmart', icon: 'W', color: '#0071ce' },
    { id: 'target', name: 'Target', icon: 'T', color: '#CC0000' },
    { id: 'shopify', name: 'Shopify', icon: 'S', color: '#96bf48' },
  ];

  const channels = availableChannels.length > 0 ? availableChannels : defaultChannels;

  // Initialize active relation type
  useEffect(() => {
    if (!activeRelationType && allRelationTypes.length > 0) {
      setActiveRelationType(allRelationTypes[0].id);
    }
  }, [allRelationTypes, activeRelationType]);

  // Mock data for relationships (replace with API call)
  useEffect(() => {
    // Simulate fetching relationships data
    const mockData = {
      accessories: [
        {
          id: '1',
          sku: 'SKU-98765',
          name: 'Power Adapter 150W',
          channels: ['amazon', 'walmart', 'target'],
          readiness: 'ready',
          thumbnail: null,
        },
        {
          id: '2',
          sku: 'SKU-45678',
          name: 'Pro Protective Case',
          channels: ['amazon'],
          readiness: 'warning',
          missingFields: 1,
          thumbnail: null,
        },
      ],
      'styled-with': [
        {
          id: '3',
          sku: 'SKU-BELT-01',
          name: "Men's Leather Belt",
          channels: ['shopify'],
          readiness: 'ready',
          thumbnail: null,
        },
      ],
    };
    setRelationshipsData(mockData);
  }, []);

  // Get current relationships based on active type
  const getCurrentRelationships = () => {
    const relationships = relationshipsData[activeRelationType] || [];
    
    // Filter by selected channels
    if (!selectedChannels.includes('all')) {
      return relationships.filter(rel =>
        rel.channels.some(ch => selectedChannels.includes(ch))
      );
    }
    
    return relationships;
  };

  // Process data for Kendo Grid
  const processedRelationships = useMemo(() => {
    const relationships = getCurrentRelationships();
    
    // Apply search filter
    const filtered = searchQuery
      ? relationships.filter(rel =>
          rel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rel.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : relationships;

    return process(filtered, {
      filter: gridFilter,
      sort,
      skip: page.skip,
      take: page.take,
    });
  }, [activeRelationType, relationshipsData, selectedChannels, searchQuery, gridFilter, sort, page]);

  // Get active relation type details
  const getActiveRelationType = () => {
    return allRelationTypes.find(rt => rt.id === activeRelationType);
  };

  // Channel Filter Change
  const handleChannelFilterChange = (event) => {
    const value = event.target.value;
    if (value === 'all') {
      setSelectedChannels(['all']);
    } else {
      setSelectedChannels([value]);
    }
  };

  // Handle opening modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setModalStep(1);
    setModalProductSearch('');
    setModalSelectedProduct(null);
    setModalSelectedChannels([]);
    setModalFieldMappings({});
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle product search in modal
  const handleModalProductSearch = (searchTerm) => {
    setModalProductSearch(searchTerm);
    // TODO: Implement actual product search API call
  };

  // Handle product selection in modal
  const handleSelectProduct = (product) => {
    setModalSelectedProduct(product);
  };

  // Handle channel selection in modal
  const handleModalChannelToggle = (channelId) => {
    setModalSelectedChannels(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      }
      return [...prev, channelId];
    });
  };

  // Handle field mapping changes
  const handleFieldMappingChange = (channelId, fieldName, value) => {
    setModalFieldMappings(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        [fieldName]: value,
      },
    }));
  };

  // Get required fields for selected channels
  const getRequiredFieldsForChannels = () => {
    // Mock required fields based on channel and relation type
    const fieldRequirements = {
      amazon: {
        accessories: [
          { name: 'Compatible_Model_SKU', defaultValue: '{product.sku}' },
          { name: 'Accessory_Type_ID', defaultValue: '' },
        ],
        bundles: [
          { name: 'Bundle_SKU', defaultValue: '{product.sku}' },
          { name: 'Component_SKUs', defaultValue: '' },
        ],
      },
      walmart: {
        accessories: [
          { name: 'Accessory_For_SKU', defaultValue: '{product.sku}' },
        ],
        bundles: [
          { name: 'Bundle_Parent_SKU', defaultValue: '{product.sku}' },
        ],
      },
    };

    const fields = {};
    modalSelectedChannels.forEach(channelId => {
      const channelFields = fieldRequirements[channelId]?.[activeRelationType] || [];
      if (channelFields.length > 0) {
        fields[channelId] = channelFields;
      }
    });

    return fields;
  };

  // Handle adding relationship
  const handleAddRelationship = () => {
    const newRelationship = {
      product: modalSelectedProduct,
      channels: modalSelectedChannels,
      fieldMappings: modalFieldMappings,
      relationType: activeRelationType,
    };

    if (onAddRelationship) {
      onAddRelationship(newRelationship);
    }

    // Update local state (in real app, this would be done after API success)
    setRelationshipsData(prev => ({
      ...prev,
      [activeRelationType]: [
        ...(prev[activeRelationType] || []),
        {
          id: Date.now().toString(),
          sku: modalSelectedProduct.sku,
          name: modalSelectedProduct.name,
          channels: modalSelectedChannels,
          readiness: 'ready',
          thumbnail: null,
        },
      ],
    }));

    handleCloseModal();
  };

  // Handle removing relationship
  const handleRemoveRelationship = (relationshipId) => {
    if (onRemoveRelationship) {
      onRemoveRelationship(relationshipId, activeRelationType);
    }

    // Update local state
    setRelationshipsData(prev => ({
      ...prev,
      [activeRelationType]: prev[activeRelationType].filter(r => r.id !== relationshipId),
    }));
  };

  // Render readiness badge
  const renderReadinessBadge = (relationship) => {
    switch (relationship.readiness) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Ready
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Missing ({relationship.missingFields || 0} field{relationship.missingFields !== 1 ? 's' : ''})
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" />
            Failed Sync
          </span>
        );
      default:
        return null;
    }
  };

  // Kendo Grid Cell Renderers
  const productNameCell = useCallback((props) => {
    if (!props.dataItem?.id) return <td>N/A</td>;
    return (
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{props.dataItem.name}</div>
          <div className="text-sm text-gray-500">{props.dataItem.sku}</div>
        </div>
      </td>
    );
  }, []);

  const channelsCell = useCallback((props) => {
    if (!props.dataItem?.channels) return <td>N/A</td>;
    return (
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {props.dataItem.channels.map(channelId => {
            const channel = channels.find(ch => ch.id === channelId);
            if (!channel) return null;
            return (
              <div
                key={channelId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border"
                style={{ 
                  backgroundColor: `${channel.color}15`,
                  borderColor: `${channel.color}40`,
                  color: channel.color
                }}
                title={channel.name}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: channel.color }}
                >
                  {channel.icon}
                </div>
                {channel.name}
              </div>
            );
          })}
        </div>
      </td>
    );
  }, [channels]);

  const readinessCell = useCallback((props) => {
    if (!props.dataItem?.readiness) return <td>N/A</td>;
    return (
      <td className="px-6 py-4">
        {renderReadinessBadge(props.dataItem)}
      </td>
    );
  }, []);

  const actionsCell = useCallback((props) => {
    if (!props.dataItem?.id) return <td></td>;
    return (
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRemoveRelationship(props.dataItem.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    );
  }, []);

  const activeTypeDetails = getActiveRelationType();
  const requiredFields = getRequiredFieldsForChannels();
  const totalRelationships = getCurrentRelationships().length;

  return (
    <div className="h-full flex flex-col space-y-5">
      {/* Channel Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Channel Filter:
            </label>
            <select
              value={selectedChannels[0] || 'all'}
              onChange={handleChannelFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white font-medium min-w-[180px]"
            >
              <option value="all">All Channels ({channels.length})</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Active Channels:</span>
            {channels.map(channel => (
              <span
                key={channel.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-gray-300 transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                {channel.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Hub Layout */}
      <div className="flex gap-5 flex-1 overflow-hidden">
        {/* Left Column: Vertical Relation Types */}
        <div className="w-64 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Relationship Types</h3>
            <p className="text-xs text-gray-600 mt-0.5">Select a type to view</p>
          </div>
          <div className="flex-1 overflow-auto">
            {allRelationTypes.map((relationType, index) => (
              <React.Fragment key={relationType.id}>
                <button
                  onClick={() => setActiveRelationType(relationType.id)}
                  className={`w-full px-4 py-3 text-left text-sm font-medium transition-all ${
                    activeRelationType === relationType.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300'
                  } ${relationType.custom ? 'italic' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{relationType.name}</span>
                    {activeRelationType === relationType.id && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  {relationType.custom && (
                    <span className="text-xs text-gray-500 mt-0.5 block">Custom Type</span>
                  )}
                </button>
                {index < allRelationTypes.length - 1 && (
                  <div className="border-b border-gray-100" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="px-4 py-3 text-xs text-gray-600 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span className="text-gray-500">Admin:</span>{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                Manage Types
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden space-y-5">
          {/* Content Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeTypeDetails?.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {totalRelationships} relationship{totalRelationships !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search ${activeTypeDetails?.name?.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80 text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add {activeTypeDetails?.name}
                </button>
              </div>
            </div>
          </div>

          {/* Data Grid with Kendo */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm" style={{ minHeight: '500px' }}>
            {processedRelationships.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <div className="text-gray-400 mb-3">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No relationships found
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search criteria'
                    : `No ${activeTypeDetails?.name?.toLowerCase()} have been added yet`}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add First {activeTypeDetails?.name}
                  </button>
                )}
              </div>
            ) : (
              <>
                <style>{`
                  .k-grid {
                    border: none !important;
                    font-family: inherit;
                  }
                  .k-grid-header {
                    border: none !important;
                  }
                  .k-grid-header th.k-header {
                    background-color: #f9fafb;
                    font-weight: 600;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #6b7280;
                    padding: 0.75rem 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    border-right: none;
                    border-left: none;
                    border-top: none;
                  }
                  .k-grid-content {
                    overflow-y: auto;
                  }
                  .k-grid td {
                    padding: 0;
                    vertical-align: middle;
                    border-bottom: 1px solid #f3f4f6;
                    border-right: none;
                    border-left: none;
                  }
                  .k-grid tbody tr {
                    background-color: white;
                  }
                  .k-grid tbody tr:hover {
                    background-color: #f9fafb;
                  }
                  .k-grid tbody tr:last-child td {
                    border-bottom: none;
                  }
                  .k-pager-wrap {
                    border-top: 1px solid #e5e7eb;
                    padding: 0.75rem 1.5rem;
                    background-color: white;
                  }
                  .k-grid-aria-root {
                    height: 100% !important;
                  }
                `}</style>
                <Grid
                  style={{ height: "500px", border: "none" }}
                  data={processedRelationships}
                  filterable={true}
                  sortable={true}
                  filter={gridFilter}
                  sort={sort}
                  onFilterChange={(e) => setGridFilter(e.filter)}
                  onSortChange={(e) => setSort(e.sort)}
                  pageable={true}
                  skip={page.skip}
                  take={page.take}
                  total={getCurrentRelationships().length}
                  onPageChange={(e) => setPage(e.page)}
                  className="border-none"
                >
                  <Column 
                    field="name" 
                    title="Product Name / SKU" 
                    cell={productNameCell}
                    width="300px"
                  />
                  <Column 
                    field="channels" 
                    title="Channels" 
                    cell={channelsCell}
                    filterable={false}
                    width="250px"
                  />
                  <Column 
                    field="readiness" 
                    title="Readiness" 
                    cell={readinessCell}
                    width="200px"
                  />
                  <Column 
                    field="actions" 
                    title="Actions" 
                    cell={actionsCell}
                    filterable={false}
                    sortable={false}
                    width="120px"
                    headerCell={() => <span className="k-link">Actions</span>}
                  />
                </Grid>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Relationship Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(60, 61, 61, 0.5)" }}
        >
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add {activeTypeDetails?.name} Relationship
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Create a new relationship connection
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Step 1: Select Product */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  1. Select Product
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Search and select the product you want to relate
                </p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={modalProductSearch}
                    onChange={(e) => handleModalProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {modalSelectedProduct && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {modalSelectedProduct.name}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({modalSelectedProduct.sku})
                        </span>
                      </div>
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Assign to Channels */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  2. Assign to Channels
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Select which channels this relationship should apply to
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {channels.map(channel => (
                    <label 
                      key={channel.id} 
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        modalSelectedChannels.includes(channel.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={modalSelectedChannels.includes(channel.id)}
                        onChange={() => handleModalChannelToggle(channel.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: channel.color }}
                        >
                          {channel.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{channel.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Map Required Fields */}
              {modalSelectedChannels.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    3. Map Relational Fields
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    Configure the required fields for each selected channel
                  </p>
                  <div className="space-y-3">
                    {Object.entries(requiredFields).map(([channelId, fields]) => {
                      const channel = channels.find(ch => ch.id === channelId);
                      const [isExpanded, setIsExpanded] = useState(true);
                      return (
                        <div key={channelId} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                                style={{ backgroundColor: channel?.color }}
                              >
                                {channel?.icon}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {channel?.name}
                              </span>
                              <span className="text-xs text-gray-600">
                                ({(fields as any).length} field{(fields as any).length !== 1 ? 's' : ''} required)
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="p-4 space-y-3 bg-white border-t border-gray-200">
                              {(fields as any).map((field: any) => (
                                <div key={field.name} className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">
                                      {field.name}
                                    </label>
                                    <span className="text-xs text-gray-500">Required</span>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder={field.defaultValue || `Enter ${field.name}`}
                                    value={modalFieldMappings[channelId]?.[field.name] || ''}
                                    onChange={(e) =>
                                      handleFieldMappingChange(channelId, field.name, e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600">
                {modalSelectedProduct && modalSelectedChannels.length > 0
                  ? `Ready to create relationship with ${modalSelectedChannels.length} channel${modalSelectedChannels.length !== 1 ? 's' : ''}`
                  : 'Please complete all required steps'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRelationship}
                  disabled={!modalSelectedProduct || modalSelectedChannels.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                >
                  Add Relationship
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRelationshipsTab;
