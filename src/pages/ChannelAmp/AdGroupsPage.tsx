import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import KendoGrid from "../../components/ChannelAmp/KendoGrid";
import Tooltip from "../../components/Tooltip";
import DateSelector from "../../components/ChannelAmp/DateSelector";

const AdGroupsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [gridDataState, setGridDataState] = useState({
    sort: [],
    filter: null,
    skip: 0,
    take: 20,
    group: [], // Enable grouping by default
  });
  const [selectedRows, setSelectedRows] = useState([]);

  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const selectedCampaign = searchParams.get('campaign');
  const selectedProfile = searchParams.get('profile');

  // Aggregates configuration for numeric columns
  const aggregates = [
    { field: "impressions", aggregate: "sum" },
    { field: "clicks", aggregate: "sum" },
    { field: "orders", aggregate: "sum" },
    { field: "spend", aggregate: "sum" },
    { field: "sales", aggregate: "sum" },
    { field: "ctr", aggregate: "average" },
    { field: "cpc", aggregate: "average" },
    { field: "acos", aggregate: "average" },
    { field: "roas", aggregate: "average" },
  ];

  // Raw numeric data for proper calculations and charting
  const allAdGroupsData = [
    {
      id: 1,
      adGroupName: "Electronics - Headphones",
      campaignName: "Holiday Campaign",
      campaignType: "SP",
      adGroupStatus: "▶️",
      adGroupStatusText: "Active",
      defaultBid: 1.25,
      bidMultiplier: 1.0,
      adGroupServingStatus: "SERVING",
      impressions: 45000,
      clicks: 320,
      ctr: 0.71,
      cpc: 1.25,
      spend: 400.00,
      orders: 15,
      sales: 1500.00,
      acos: 26.7,
      roas: 3.75,
      attributedConversions1d: 14,
      attributedConversions7d: 15,
      attributedConversions14d: 16,
      attributedConversions30d: 17,
      lastUpdate: "2025-07-04",
    },
    {
      id: 2,
      adGroupName: "Beauty - Skincare",
      campaignName: "Brand Defense Q4",
      campaignType: "SB",
      adGroupStatus: "⏸️",
      adGroupStatusText: "Paused",
      defaultBid: 2.10,
      bidMultiplier: 0.8,
      adGroupServingStatus: "PAUSED",
      impressions: 32000,
      clicks: 180,
      ctr: 0.56,
      cpc: 2.10,
      spend: 378.00,
      orders: 12,
      sales: 1200.00,
      acos: 31.5,
      roas: 3.17,
      attributedConversions1d: 11,
      attributedConversions7d: 12,
      attributedConversions14d: 13,
      attributedConversions30d: 14,
      lastUpdate: "2025-07-04",
    },
    {
      id: 3,
      adGroupName: "Home & Garden",
      campaignName: "Product Launch UK",
      campaignType: "SD",
      adGroupStatus: "▶️",
      adGroupStatusText: "Active",
      defaultBid: 1.85,
      bidMultiplier: 1.2,
      adGroupServingStatus: "SERVING",
      impressions: 28000,
      clicks: 210,
      ctr: 0.75,
      cpc: 1.85,
      spend: 388.50,
      orders: 8,
      sales: 800.00,
      acos: 48.6,
      roas: 2.06,
      attributedConversions1d: 7,
      attributedConversions7d: 8,
      attributedConversions14d: 8,
      attributedConversions30d: 9,
      lastUpdate: "2025-07-04",
    },
    {
      id: 4,
      adGroupName: "Sports & Outdoors",
      campaignName: "Back to School ",
      campaignType: "SP",
      adGroupStatus: "⏹️",
      adGroupStatusText: "Stopped",
      defaultBid: 1.50,
      bidMultiplier: 1.1,
      adGroupServingStatus: "ENDED",
      impressions: 65000,
      clicks: 450,
      ctr: 0.69,
      cpc: 1.50,
      spend: 675.00,
      orders: 28,
      sales: 2800.00,
      acos: 24.1,
      roas: 4.15,
      attributedConversions1d: 26,
      attributedConversions7d: 28,
      attributedConversions14d: 29,
      attributedConversions30d: 30,
      lastUpdate: "2025-07-04",
    },
    {
      id: 5,
      adGroupName: "Kitchen Appliances",
      campaignName: "Holiday Campaign ",
      campaignType: "SP",
      adGroupStatus: "▶️",
      adGroupStatusText: "Active",
      defaultBid: 1.75,
      bidMultiplier: 0.9,
      adGroupServingStatus: "SERVING",
      impressions: 52000,
      clicks: 385,
      ctr: 0.74,
      cpc: 1.75,
      spend: 673.75,
      orders: 22,
      sales: 2200.00,
      acos: 30.6,
      roas: 3.27,
      attributedConversions1d: 20,
      attributedConversions7d: 22,
      attributedConversions14d: 23,
      attributedConversions30d: 24,
      lastUpdate: "2025-07-04",
    },
  ];

  const adGroupsData = useMemo(() => {
    if (selectedCampaign) {
      return allAdGroupsData.filter(adGroup => adGroup.campaignName === selectedCampaign);
    }
    return allAdGroupsData;
  }, [selectedCampaign]);

  const allColumns = [
    {
      field: "adGroupName",
      title: "Ad Group Name",
      filter: "text",
      locked: true,
      className: "cursor-pointer text-blue-600 hover:text-blue-800 hover:underline",
    },
    {
      field: "campaignName",
      title: "Campaign Name",
      filter: "text",
    },
    {
      field: "campaignType",
      title: "Type",
      filter: "text",
      render: (value) => {
        const typeMap = {
          "SP": "Sponsored Products",
          "SB": "Sponsored Brands",
          "SD": "Sponsored Display",
        };
        return (
          <Tooltip content={typeMap[value] || ""} position="right">
            <span className="cursor-pointer font-medium">{value}</span>
          </Tooltip>
        );
      },
    },
    {
      field: "adGroupStatusText",
      title: "Status",
      filter: "text",
    },
    {
      field: "adGroupServingStatus",
      title: "Serving Status",
      filter: "text",
      render: (value) => {
        const statusColors = {
          "SERVING": "bg-green-100 text-green-800",
          "PAUSED": "bg-yellow-100 text-yellow-800",
          "ENDED": "bg-red-100 text-red-800",
          "PENDING": "bg-blue-100 text-blue-800",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
            {value}
          </span>
        );
      },
    },
    {
      field: "defaultBid",
      title: "Default Bid",
      filter: "numeric",
      format: "${0:n2}",
    },
    {
      field: "bidMultiplier",
      title: "Bid Multiplier",
      filter: "numeric",
      format: "{0:n1}",
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
      field: "ctr",
      title: "CTR",
      filter: "numeric",
      format: "{0:n2}%",
    },
    {
      field: "cpc",
      title: "CPC",
      filter: "numeric",
      format: "${0:n2}",
    },
    {
      field: "orders",
      title: "Orders",
      filter: "numeric",
      format: "{0:n0}",
    },
    {
      field: "sales",
      title: "Sales",
      filter: "numeric",
      format: "${0:n2}",
    },
    {
      field: "spend",
      title: "Spend",
      filter: "numeric",
      format: "${0:n2}",
    },
    {
      field: "acos",
      title: "ACoS",
      filter: "numeric",
      format: "{0:n1}%",
    },
    {
      field: "roas",
      title: "ROAS",
      filter: "numeric",
      format: "{0:n1}x",
    },
    {
      field: "attributedConversions7d",
      title: "7d Conv.",
      filter: "numeric",
      format: "{0:n0}",
    },
    {
      field: "lastUpdate",
      title: "Last Update",
      filter: "date",
      format: "{0:MM/dd/yyyy}",
    },
    {
      field: "attributedConversions1d",
      title: "1d Conv.",
      filter: "numeric",
      format: "{0:n0}",
    },
    {
      field: "attributedConversions14d",
      title: "14d Conv.",
      filter: "numeric",
      format: "{0:n0}",
    },
    {
      field: "attributedConversions30d",
      title: "30d Conv.",
      filter: "numeric",
      format: "{0:n0}",
    },
  ];

  const [allColumnsState, setAllColumnsState] = useState({
    visible: allColumns.filter((col) =>
      [
        "adGroupName",
        "campaignName",
        "campaignType",
        "adGroupStatusText",
        "adGroupServingStatus",
        "defaultBid",
        "bidMultiplier",
        "impressions",
        "clicks",
        "ctr",
        "cpc",
        "orders",
        "sales",
        "spend",
        "acos",
        "roas",
        "attributedConversions7d",
        "lastUpdate",
      ].includes(col.field)
    ),
    available: allColumns.filter(
      (col) => ![
        "adGroupName",
        "campaignName",
        "campaignType",
        "adGroupStatusText",
        "adGroupServingStatus",
        "defaultBid",
        "bidMultiplier",
        "impressions",
        "clicks",
        "ctr",
        "cpc",
        "orders",
        "sales",
        "spend",
        "acos",
        "roas",
        "attributedConversions7d",
        "lastUpdate",
      ].includes(col.field)
    ),
  });

  const nonRemovableColumns = ["adGroupName"];

  const handleAdGroupClick = (adGroupName) => {
    const params = new URLSearchParams();
    params.set('adGroup', adGroupName);
    if (selectedCampaign) {
      params.set('campaign', selectedCampaign);
    }
    if (selectedProfile) {
      params.set('profile', selectedProfile);
    }
    navigate(`/channelamp/ads?${params.toString()}`);
  };

  const buildBreadcrumb = () => {
    const breadcrumbs = [];
    
    breadcrumbs.push({
      label: "Profiles",
      onClick: () => navigate('/channelamp/profiles')
    });

    if (selectedProfile) {
      breadcrumbs.push({
        label: selectedProfile,
        onClick: () => navigate(`/channelamp/campaigns?profile=${encodeURIComponent(selectedProfile)}`)
      });
    }

    if (selectedCampaign) {
      breadcrumbs.push({
        label: selectedCampaign,
        current: true
      });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 w-full">
      <div className="w-full">
        {(selectedProfile || selectedCampaign) && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {buildBreadcrumb().map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>{'>'}</span> }
                  <span 
                    className={crumb.current ? "font-medium text-gray-900" : "cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"}
                    onClick={crumb.onClick}
                  >
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        <div className="flex mb-4 items-center">
          <DateSelector />
        </div>
        <KendoGrid
          data={adGroupsData}
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
          aggregates={aggregates}
          onRowClick={(event) => {
            const { nativeEvent, dataItem } = event;
            const target = nativeEvent.target;
            const cell = target.closest("td");
            if (cell && cell.classList.contains("k-grid-content-sticky") && allColumnsState.visible.find((col) => col.field === "adGroupName")?.locked) {
              if (allColumnsState.visible[0].field === "adGroupName") {
                handleAdGroupClick(dataItem.adGroupName);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default AdGroupsPage;