import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateSelector from "../../components/ChannelAmp/DateSelector";
import KendoGrid from "../../components/ChannelAmp/KendoGrid";
import Tooltip from "../../components/Tooltip";

const ProfilesPage = () => {
  const navigate = useNavigate();
  const [gridDataState, setGridDataState] = useState({
    sort: [],
    filter: null,
    skip: 0,
    take: 20,
    group: [], // Enable grouping by default
  });
  const [selectedRows, setSelectedRows] = useState([]);

  // Aggregates configuration for numeric columns
  const aggregates = [
    { field: "impressions", aggregate: "sum" },
    { field: "clicks", aggregate: "sum" },
    { field: "conv", aggregate: "sum" },
    { field: "cost", aggregate: "sum" },
  ];

  // Preprocess profilesData to convert lastUpdate to Date objects
  const profilesData = [
    {
      id: 1,
      profileName: "Philips Avent - US - Criteo",
      profileStatusText: "Paused",
      progress: "",
      profileManager: "Heena An",
      lastUpdate: "2025-06-01",
      unauthorizedAccount: "",
      impressions: 41872347,
      engagement: 0,
      clicks: 173667,
      conv: 0,
      cost: 173592,
      category: "Avent",
      region: "US",
    },
    {
      id: 2,
      profileName: "Philips Avent - US - WMT",
      profileStatusText: "Paused",
      progress: "",
      profileManager: "lauren.lane@philips.com",
      lastUpdate: "2025-06-15",
      unauthorizedAccount: "",
      impressions: 64293045,
      engagement: 0,
      clicks: 341291,
      conv: 0,
      cost: 367793,
      category: "Avent",
      region: "US",
    },
    {
      id: 3,
      profileName: "Philips Beauty - US - Criteo",
      profileStatusText: "Paused",
      progress: "",
      profileManager: "Heena An",
      lastUpdate: "2025-05-20",
      unauthorizedAccount: "",
      impressions: 0,
      engagement: 0,
      clicks: 0,
      conv: 0,
      cost: 0,
      category: "Beauty",
      region: "US",
    },
    {
      id: 4,
      profileName: "Philips Beauty - US - WMT",
      profileStatusText: "Paused",
      progress: "",
      profileManager: "alex.blatt@integer.com",
      lastUpdate: "2025-04-10",
      unauthorizedAccount: "",
      impressions: 0,
      engagement: 0,
      clicks: 0,
      conv: 0,
      cost: 0,
      category: "Beauty",
      region: "US",
    },
    {
      id: 5,
      profileName: "Philips Norelco - US - Criteo",
      profileStatusText: "Paused",
      progress: "",
      profileManager: "Heena An",
      lastUpdate: "2025-07-01",
      unauthorized : "",
      impressions: 955126474,
      engagement: 0,
      clicks: 513127,
      conv: 60156,
      cost: 748887,
      category: "Norelco",
      region: "US",
    },
    {
      id: 6,
      profileName: "Philips Norelco - US - WMT",
      profileStatusText: "Paused",
      progress: "",
      profileManager: "lauren.lane@philips.com",
      lastUpdate: "2025-06-25",
      unauthorizedAccount: "",
      impressions: 160824207,
      engagement: 0,
      clicks: 939860,
      conv: 119715,
      cost: 1592257,
      category: "Norelco",
      region: "US",
    },
  ];

  const allColumns = [
    {
      field: "profileName",
      title: "Profile Name",
      filter: "text",
      locked: true,
      className: "cursor-pointer text-blue-600 hover:text-blue-800 hover:underline",
    },
    {
      field: "profileStatusText",
      title: "Status",
      filter: "text",
    },
    {
      field: "profileManager",
      title: "Profile Manager",
      filter: "text",
    },
    {
      field: "category",
      title: "Category",
      filter: "text",
    },
    {
      field: "region",
      title: "Region",
      filter: "text",
    },
    {
      field: "lastUpdate",
      title: "Last Update",
      filter: "date",
      format: "{0:MM/dd/yyyy}",
    },
    {
      field: "impressions",
      title: "Impressions",
      filter: "numeric",
      format: "{0:n0}",
    },
    {
      field: "clicks",
      title: "Clicks",
      filter: "numeric",
      format: "{0:n0}",
    },
    {
      field: "conv",
      title: "Conversions",
      filter: "numeric",
      format: "{0:n0}",
    },
    {
      field: "cost",
      title: "Cost",
      filter: "numeric",
      format: "${0:n0}",
    },
    {
      field: "progress",
      title: "Progress",
      filter: "text",
    },
    {
      field: "unauthorizedAccount",
      title: "Unauthorized Account",
      filter: "text",
    },
  ];

  const [allColumnsState, setAllColumnsState] = useState({
    visible: allColumns.filter((col) =>
      ["profileName", "profileStatusText", "profileManager", "category", "region", "lastUpdate", "impressions", "clicks", "conv", "cost"].includes(col.field)
    ),
    available: allColumns.filter(
      (col) => !["profileName", "profileStatusText", "profileManager", "category", "region", "lastUpdate", "impressions", "clicks", "conv", "cost"].includes(col.field)
    ),
  });

  const nonRemovableColumns = ["profileName"];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 w-full">
      <div className="w-full">
        <div className="flex mb-4 items-center">
          <DateSelector />
        </div>
        <KendoGrid
          data={profilesData}
          columns={allColumnsState.visible}
          setColumns={(newColumns) =>
            setAllColumnsState((prev) => ({
              ...prev,
              visible: Array.isArray(newColumns) ? newColumns : prev.visible,
            }))
          }
          allColumnsState={allColumnsState}
          setAllColumnsState={setAllColumnsState}
          gridDataState={gridDataState}
          setGridDataState={setGridDataState}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          nonRemovableColumns={nonRemovableColumns}
          aggregates={aggregates} // Pass aggregates to KendoGrid
          onRowClick={(event) => {
            const { nativeEvent, dataItem } = event;
            const target = nativeEvent.target;
            const cell = target.closest("td");
            if (cell && cell.classList.contains("k-grid-content-sticky") && allColumnsState.visible.find((col) => col.field === "profileName")?.locked) {
              if (allColumnsState.visible[0].field === "profileName") {
                navigate(`/channelamp/campaigns?profile=${encodeURIComponent(dataItem.profileName)}`);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default ProfilesPage;