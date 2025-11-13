import { useState, useMemo, useCallback } from "react"
import { X, Search, ChevronDown, CheckCircle, Clock, XCircle } from "lucide-react"
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid"
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs"
import { process } from "@progress/kendo-data-query"

interface RelationshipEditorProps {
  productId: string
  productData: any
  onSave: (relationships: any) => void
  onCancel: () => void
}

const RelationshipEditor = ({ productId, productData, onSave, onCancel }: RelationshipEditorProps) => {
  const [activeRelationType, setActiveRelationType] = useState<string>("accessories")
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["amazon", "walmart", "target", "shopify"])
  const [page, setPage] = useState({ skip: 0, take: 10 })
  const [sort, setSort] = useState([])
  const [filter, setFilter] = useState({ logic: "and", filters: [] })

  // Available channels
  const availableChannels = [
    { id: "amazon", name: "Amazon", icon: "A", color: "#FF9900" },
    { id: "walmart", name: "Walmart", icon: "W", color: "#0071ce" },
    { id: "target", name: "Target", icon: "T", color: "#CC0000" },
    { id: "shopify", name: "Shopify", icon: "S", color: "#96bf48" },
  ]

  // Relationship types (vertical tabs)
  const relationshipTypes = [
    { id: "bundles", name: "Bundles / Kits", custom: false },
    { id: "accessories", name: "Accessories", custom: false },
    { id: "replacement-parts", name: "Replacement Parts", custom: false },
    { id: "upsells", name: "Upsells", custom: false },
    { id: "cross-sells", name: "Cross-sells", custom: false },
    { id: "variants", name: "Variants", custom: false },
    { id: "substitutes", name: "Substitutes", custom: false },
    { id: "styled-with", name: "Styled With", custom: true },
  ]

  const [relationships, setRelationships] = useState([
    {
      id: 1,
      type: "accessories",
      productName: "Power Adapter 150W",
      sku: "SKU-98765",
      channels: ["amazon", "walmart", "target"],
      readiness: "synced",
    },
    {
      id: 2,
      type: "accessories",
      productName: "Pro Protective Case",
      sku: "SKU-45678",
      channels: ["amazon"],
      readiness: "pending",
    },
    {
      id: 3,
      type: "accessories",
      productName: "USB-C Cable 6ft",
      sku: "SKU-12345",
      channels: ["amazon", "walmart"],
      readiness: "failed",
    },
  ])

  const filteredRelationships = useMemo(
    () => relationships.filter((r) => r.type === activeRelationType),
    [relationships, activeRelationType]
  )

  const processedData = useMemo(
    () => process(filteredRelationships, {
      filter: filter as any,
      sort,
      skip: page.skip,
      take: page.take,
    }),
    [filteredRelationships, filter, sort, page]
  )

  const handleRemoveRelationship = (id: number) => {
    setRelationships(relationships.filter((r) => r.id !== id))
  }

  const getChannelIcon = (channelId: string) => {
    const channel = availableChannels.find((c) => c.id === channelId)
    return channel ? { icon: channel.icon, color: channel.color, name: channel.name } : null
  }

  const getChannelStatusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getChannelStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <CheckCircle className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      case "failed":
        return <XCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const MyPager = (props: any) => {
    const currentPage = Math.floor(props.skip / props.take) + 1
    const totalPages = Math.ceil((props.total || 0) / props.take) || 1
    const handleChange = (event: any) =>
      props.onPageChange?.({
        target: { element: null, props },
        skip: ((event.value ?? 1) - 1) * props.take,
        take: props.take,
        syntheticEvent: event.syntheticEvent,
        nativeEvent: event.nativeEvent,
        targetEvent: { value: event.value },
      })
    return (
      <div className="k-pager k-pager-md k-grid-pager border-t border-gray-300">
        <div className="flex items-center justify-between p-2">
          <div className="flex-1">
            <Slider
              buttons={true}
              step={1}
              value={currentPage}
              min={1}
              max={totalPages}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1 flex justify-center">
            <NumericTextBox
              value={currentPage}
              onChange={handleChange}
              min={1}
              max={totalPages}
              width={60}
            />
          </div>
          <div className="flex-1 text-right text-sm text-gray-600">{`Page ${currentPage} of ${totalPages}`}</div>
        </div>
      </div>
    )
  }

  const productNameCell = useCallback((props: any) => {
    if (!props.dataItem?.id) return <td>N/A</td>
    return (
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">{props.dataItem.productName}</div>
          <div className="text-sm text-gray-500">{props.dataItem.sku}</div>
        </div>
      </td>
    )
  }, [])

  const channelsCell = useCallback((props: any) => {
    if (!props.dataItem?.channels) return <td>N/A</td>
    return (
      <td className="px-6 py-4">
        <div className="flex gap-1">
          {props.dataItem.channels.map((channelId: string) => {
            const channelInfo = getChannelIcon(channelId)
            return channelInfo ? (
              <span
                key={channelId}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-xs"
                style={{ backgroundColor: channelInfo.color }}
                title={channelInfo.name}
              >
                {channelInfo.icon}
              </span>
            ) : null
          })}
        </div>
      </td>
    )
  }, [])

  const readinessCell = useCallback((props: any) => {
    if (!props.dataItem?.readiness) return <td>N/A</td>
    const status = props.dataItem.readiness
    return (
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getChannelStatusColor(status)}`}>
          {getChannelStatusIcon(status)}
          {status === "synced" && "Ready"}
          {status === "pending" && "Pending"}
          {status === "failed" && "Missing (1 field)"}
        </span>
      </td>
    )
  }, [])

  const actionsCell = useCallback((props: any) => {
    if (!props.dataItem?.id) return <td></td>
    return (
      <td className="px-6 py-4">
        <button
          onClick={() => handleRemoveRelationship(props.dataItem.id)}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          Remove
        </button>
      </td>
    )
  }, [])

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-6">
        {/* Channel Filter */}
        <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg mb-6">
          <label className="font-semibold text-sm">Channel Filter:</label>
          <select 
            className="px-3 py-2 border border-gray-300 rounded-md font-medium text-sm"
            aria-label="Channel Filter"
          >
            <option>All Channels ({availableChannels.length})</option>
            {availableChannels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            {availableChannels.map((channel) => (
              <span
                key={channel.id}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm font-medium"
              >
                {channel.name}
              </span>
            ))}
          </div>
        </div>

        {/* Hub Layout: Vertical Tabs + Grid */}
        <div className="flex gap-6">
          {/* Vertical Relation Types */}
          <div className="flex-shrink-0 w-56 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {relationshipTypes.map((type) => (
                <li key={type.id}>
                  <button
                    onClick={() => setActiveRelationType(type.id)}
                    className={`w-full text-left px-4 py-3 font-medium text-sm transition-colors ${
                      activeRelationType === type.id
                        ? "bg-[#FDE2CF] text-[#DD522C] border-l-4 border-[#DD522C]"
                        : "hover:bg-gray-50"
                    } ${type.custom ? "italic" : ""}`}
                  >
                    {type.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                (Admin) <a href="#" className="text-[#DD522C] hover:underline">Manage Types...</a>
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow">
            {/* Content Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {relationshipTypes.find((t) => t.id === activeRelationType)?.name || "Relationships"}
              </h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${relationshipTypes.find((t) => t.id === activeRelationType)?.name.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-64 text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C]"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-[#DD522C] text-white rounded-md hover:bg-[#F27A56] transition-colors font-medium text-sm"
                >
                  + Add {relationshipTypes.find((t) => t.id === activeRelationType)?.name.replace(/s$/, "")}
                </button>
              </div>
            </div>

            {/* Kendo Data Grid */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {processedData.data.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No relationships found
                    </h3>
                    <p>Add a relationship to get started</p>
                  </div>
                </div>
              ) : (
                <Grid
                  style={{ height: "auto", border: "none" }}
                  data={processedData}
                  dataItemKey="id"
                  selectable={{
                    enabled: true,
                    drag: false,
                    cell: false,
                    mode: 'multiple'
                  }}
                  filterable={true}
                  sortable={true}
                  filter={filter as any}
                  sort={sort}
                  onFilterChange={(e) => setFilter(e.filter)}
                  onSortChange={(e) => setSort(e.sort)}
                  pageable={true}
                  skip={page.skip}
                  take={page.take}
                  total={filteredRelationships.length || 0}
                  onPageChange={(e) => setPage(e.page)}
                  pager={MyPager}
                  className="border-none"
                >
                  <Column field="productName" title="Product Name / SKU" cell={productNameCell} />
                  <Column field="channels" title="Channels" cell={channelsCell} filterable={false} />
                  <Column field="readiness" title="Readiness" cell={readinessCell} />
                  <Column field="actions" title="Actions" cell={actionsCell} filterable={false} width="120px" />
                </Grid>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Relationship Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Add {relationshipTypes.find((t) => t.id === activeRelationType)?.name.replace(/s$/, "")} Relationship
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 1. Select Product */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Select Product
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or SKU... 🔍"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C]"
                  />
                </div>
              </div>

              {/* 2. Assign to Channels */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Assign to Channels
                </label>
                <div className="flex gap-4">
                  {availableChannels.map((channel) => (
                    <label key={channel.id} className="flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        className="rounded"
                        defaultChecked={channel.id === "amazon" || channel.id === "walmart"}
                      />
                      {channel.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Map Relational Fields */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  3. Map Relational Fields (Powered by FieldMapping)
                </label>
                
                {/* Amazon Field Mapping */}
                <details className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-3" open>
                  <summary className="font-semibold cursor-pointer text-sm">
                    ▼ Amazon (2 fields required)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="compatible_model_sku" className="text-sm font-medium text-gray-700 w-48">Compatible_Model_SKU</label>
                      <span className="text-gray-400">←</span>
                      <input
                        id="compatible_model_sku"
                        type="text"
                        defaultValue="{product.sku}"
                        title="Compatible Model SKU"
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="accessory_type_id" className="text-sm font-medium text-gray-700 w-48">Accessory_Type_ID</label>
                      <span className="text-gray-400">←</span>
                      <input
                        id="accessory_type_id"
                        type="text"
                        placeholder="'HardCase' (Text)"
                        title="Accessory Type ID"
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C]"
                      />
                    </div>
                  </div>
                </details>

                {/* Walmart Field Mapping */}
                <details className="bg-gray-50 border border-gray-300 rounded-lg p-4" open>
                  <summary className="font-semibold cursor-pointer text-sm">
                    ▼ Walmart (1 field required)
                  </summary>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="accessory_for_sku" className="text-sm font-medium text-gray-700 w-48">Accessory_For_SKU</label>
                      <span className="text-gray-400">←</span>
                      <input
                        id="accessory_for_sku"
                        type="text"
                        defaultValue="{product.sku}"
                        title="Accessory For SKU"
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C]"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#DD522C] text-white rounded-md hover:bg-[#F27A56] transition-colors font-medium"
              >
                Add Relationship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RelationshipEditor
