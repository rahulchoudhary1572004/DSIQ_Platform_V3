import { useState, useMemo, useCallback } from "react"
import { Search, CheckCircle, Clock, XCircle } from "lucide-react"
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid"
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs"
import { process } from "@progress/kendo-data-query"

interface RelationshipViewerEmbeddedProps {
  productId: string
  productData: any
}

const RelationshipViewerEmbedded = ({ productId, productData }: RelationshipViewerEmbeddedProps) => {
  const [activeRelationType, setActiveRelationType] = useState<string>("accessories")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState({ skip: 0, take: 10 })
  const [sort, setSort] = useState([])
  const [filter, setFilter] = useState({ logic: "and", filters: [] })

  const availableChannels = [
    { id: "amazon", name: "Amazon", icon: "A", color: "#FF9900" },
    { id: "walmart", name: "Walmart", icon: "W", color: "#0071ce" },
    { id: "target", name: "Target", icon: "T", color: "#CC0000" },
    { id: "shopify", name: "Shopify", icon: "S", color: "#96bf48" },
  ]

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

  const relationships = [
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
  ]

  const filteredRelationships = useMemo(
    () => relationships.filter((r) => r.type === activeRelationType),
    [activeRelationType]
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

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg mb-6">
          <label className="font-semibold text-sm">Channel Filter:</label>
          <select className="px-3 py-2 border border-gray-300 rounded-md font-medium text-sm" aria-label="Channel Filter">
            <option>All Channels ({availableChannels.length})</option>
            {availableChannels.map((channel) => (
              <option key={channel.id} value={channel.id}>{channel.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            {availableChannels.map((channel) => (
              <span key={channel.id} className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm font-medium">{channel.name}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-shrink-0 w-56 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {relationshipTypes.map((type) => (
                <li key={type.id}>
                  <button onClick={() => setActiveRelationType(type.id)} className={`w-full text-left px-4 py-3 font-medium text-sm transition-colors ${activeRelationType === type.id ? "bg-[#FDE2CF] text-[#DD522C] border-l-4 border-[#DD522C]" : "hover:bg-gray-50"} ${type.custom ? "italic" : ""}`}>
                    {type.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">(Admin) <a href="#" className="text-[#DD522C] hover:underline">Manage Types...</a></p>
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{relationshipTypes.find((t) => t.id === activeRelationType)?.name || "Relationships"}</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder={`Search ${relationshipTypes.find((t) => t.id === activeRelationType)?.name.toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-64 text-sm focus:ring-2 focus:ring-[#DD522C] focus:border-[#DD522C]" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {processedData.data.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No relationships found
                    </h3>
                    <p>No relationships of this type have been added.</p>
                  </div>
                </div>
              ) : (
                <Grid
                  style={{ height: "auto", border: "none" }}
                  data={processedData}
                  dataItemKey="id"
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
                </Grid>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RelationshipViewerEmbedded
