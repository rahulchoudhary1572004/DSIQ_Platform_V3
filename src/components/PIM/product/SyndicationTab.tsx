import { useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { Slider, NumericTextBox } from "@progress/kendo-react-inputs";

const SyndicationTab = () => {
  const [syndPage, setSyndPage] = useState({ skip: 0, take: 10 });

  // Mock syndication data
  const syndicationRows = [
    {
      channel: "Amazon",
      status: "Success",
      lastSync: "2024-01-15 10:30",
      message: "Successfully synced",
    },
    {
      channel: "Walmart",
      status: "Failed",
      lastSync: "2024-01-15 09:15",
      message: "Missing required field: brand_name",
    },
    {
      channel: "Target",
      status: "In Progress",
      lastSync: "2024-01-15 11:00",
      message: "Sync in progress",
    },
  ];

  const statusColor = {
    Success: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
  };

  const statusCell = (props) => {
    const value = props.dataItem.status;
    const { status } = props.dataItem;
    return (
      <td className="flex justify-between">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            statusColor[value] || "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
        {status === "Failed" && (
          <div className="inline-flex">
            <button className="px-3 py-1 bg-brand-primary text-white rounded-md text-xs hover:bg-brand-hover transition-colors">
              Try Again
            </button>
          </div>
        )}
      </td>
    );
  };

  const messageCell = (props) => {
    const { message } = props.dataItem;
    return (
      <td className="align-top">
        <div>{message}</div>
      </td>
    );
  };

  const MyPager = (props) => {
    const currentPage = Math.floor(props.skip / props.take) + 1;
    const totalPages = Math.ceil((props.total || 0) / props.take) || 1;
    const handleChange = (event) =>
      props.onPageChange?.({
        target: { element: null, props },
        skip: ((event.value ?? 1) - 1) * props.take,
        take: props.take,
        syntheticEvent: event.syntheticEvent,
        nativeEvent: event.nativeEvent,
        targetEvent: { value: event.value },
      });
    return (
      <div
        className="k-pager k-pager-md k-grid-pager"
        style={{ borderTop: "1px solid", borderTopColor: "inherit" }}
      >
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
    );
  };

  const syndProcessedData = {
    data: syndicationRows.slice(syndPage.skip, syndPage.skip + syndPage.take),
    total: syndicationRows.length,
  };

  return (
    <div className="p-5">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Syndication Status</h2>
              <p className="text-gray-600">Monitor syndication status for this product</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </div>
        <div className="p-5">
          <Grid
            style={{ height: "400px", border: "none" }}
            data={syndProcessedData}
            filterable={true}
            pageable={true}
            sortable={true}
            skip={syndPage.skip}
            take={syndPage.take}
            total={syndicationRows.length}
            onPageChange={(e) => setSyndPage(e.page)}
            pager={MyPager}
            className="border-none"
          >
            <Column field="channel" title="Channel" />
            <Column field="status" title="Status" cell={statusCell} filterable={false} />
            <Column field="lastSync" title="Last Sync" />
            <Column field="message" title="Message" cell={messageCell} filterable={false} />
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default SyndicationTab;
