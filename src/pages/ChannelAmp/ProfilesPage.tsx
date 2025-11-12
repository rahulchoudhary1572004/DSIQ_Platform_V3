import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DateSelector from "../../components/ChannelAmp/DateSelector";
import KendoGrid from "../../components/ChannelAmp/KendoGrid";
import Tooltip from "../../components/Tooltip";
import { getLwaProfiles, fetchLwaProfiles, updateLwaProfileStatus } from "../../redux/slices/channelAmpSlice";
import { RefreshCw } from "lucide-react";

const ProfilesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profiles, loading, error } = useSelector((state: any) => state.channelAmp);
  const [gridDataState, setGridDataState] = useState({
    sort: [],
    filter: null,
    skip: 0,
    take: 20,
    group: [], // Enable grouping by default
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [profilesData, setProfilesData] = useState([]);

  // Fetch profiles on component mount
  useEffect(() => {
    dispatch(getLwaProfiles() as any);
  }, [dispatch]);

  // Parse profiles data when it changes
  useEffect(() => {
    if (profiles) {
      try {
        // Try to parse if it's a JSON string
        const parsedProfiles = typeof profiles === 'string' ? JSON.parse(profiles) : profiles;
        setProfilesData(Array.isArray(parsedProfiles) ? parsedProfiles : []);
      } catch (error) {
        console.error('Error parsing profiles:', error);
        setProfilesData([]);
      }
    } else {
      setProfilesData([]);
    }
  }, [profiles]);

  const handleRefreshProfiles = async () => {
    await dispatch(fetchLwaProfiles() as any);
    await dispatch(getLwaProfiles() as any);
  };

  // Aggregates configuration for numeric columns
  const aggregates = [
    { field: "impressions", aggregate: "sum" },
    { field: "clicks", aggregate: "sum" },
    { field: "conv", aggregate: "sum" },
    { field: "cost", aggregate: "sum" },
  ];

  // Fallback mock data if no profiles are loaded
  const mockProfilesData = [
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
        <div className="flex mb-4 items-center justify-between">
          <DateSelector />
          <button
            onClick={handleRefreshProfiles}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-md hover:bg-accent-magenta transition-colors disabled:bg-gray disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Profiles'}
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {loading && profilesData.length === 0 ? (
          <div className="flex justify-center items-center py-8 bg-white rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            <span className="ml-3 text-gray">Loading profiles...</span>
          </div>
        ) : profilesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Amazon Ads Profiles Found</h3>
            <p className="text-gray-600 mb-4">No Amazon account is linked yet or no profiles are available.</p>
            <button
              onClick={handleRefreshProfiles}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-orange text-white rounded-md hover:bg-accent-magenta transition-colors disabled:bg-gray disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Fetch Profiles from Amazon'}
            </button>
            <button
              onClick={() => navigate('/channelamp')}
              className="mt-3 text-blue-600 hover:text-blue-800 hover:underline"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ProfilesPage;