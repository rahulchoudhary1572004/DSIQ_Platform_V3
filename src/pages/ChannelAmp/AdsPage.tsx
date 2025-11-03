import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import KendoGrid from "../../components/ChannelAmp/KendoGrid";
import Tooltip from "../../components/Tooltip";
import DateSelector from "../../components/ChannelAmp/DateSelector";

const AdsPage = () => {
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
  const selectedAdGroup = searchParams.get('adGroup');
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
    { field: "bid", aggregate: "average" },
  ];

  // Raw numeric data for proper calculations and charting
  const allAdsData = [
    {
      id: 1,
      adName: "iPhone 15 Pro Max Case",
      campaignName: "Holiday Campaign ",
      adGroupName: "Electronics - Headphones",
      campaignType: "SP",
      adStatusText: "Active",
      servingStatus: "SERVING",
      adType: "PRODUCT_AD",
      asin: "B0CKDG8J8X",
      sku: "CASE-IP15-PRO-MAX",
      productTitle: "Premium Leather Case for iPhone 15 Pro Max",
      bid: 1.25,
      bidType: "KEYWORD",
      matchType: "BROAD",
      keyword: "iphone 15 pro max case",
      negativeKeyword: "",
      impressions: 15000,
      clicks: 105,
      ctr: 0.70,
      cpc: 1.19,
      spend: 125.00,
      orders: 5,
      sales: 500.00,
      acos: 25.0,
      roas: 4.0,
      attributedConversions1d: 4,
      attributedConversions7d: 5,
      attributedConversions14d: 5,
      attributedConversions30d: 6,
      lastUpdate: "2025-07-04",
    },
    {
      id: 2,
      adName: "Bluetooth Headphones",
      campaignName: "Holiday Campaign ",
      adGroupName: "Electronics - Headphones",
      campaignType: "SP",
      adStatusText: "Active",
      servingStatus: "SERVING",
      adType: "PRODUCT_AD",
      asin: "B0CKDG8J9Y",
      sku: "HEADPHONES-BT-001",
      productTitle: "Wireless Bluetooth Headphones with Noise Cancellation",
      bid: 2.50,
      bidType: "KEYWORD",
      matchType: "PHRASE",
      keyword: "bluetooth headphones",
      negativeKeyword: "",
      impressions: 25000,
      clicks: 180,
      ctr: 0.72,
      cpc: 2.22,
      spend: 400.00,
      orders: 8,
      sales: 800.00,
      acos: 50.0,
      roas: 2.0,
      attributedConversions1d: 7,
      attributedConversions7d: 8,
      attributedConversions14d: 8,
      attributedConversions30d: 9,
      lastUpdate: "2025-07-04",
    },
    {
      id: 3,
      adName: "Anti-Aging Serum",
      campaignName: "Brand Defense Q4",
      adGroupName: "Beauty - Skincare",
      campaignType: "SB",
      adStatusText: "Paused",
      servingStatus: "PAUSED",
      adType: "HEADLINE_SEARCH_AD",
      asin: "B0CKDG8K0Z",
      sku: "SERUM-ANTI-AGE-001",
      productTitle: "Advanced Anti-Aging Serum with Vitamin C",
      bid: 3.00,
      bidType: "KEYWORD",
      matchType: "EXACT",
      keyword: "anti aging serum",
      negativeKeyword: "",
      impressions: 8000,
      clicks: 45,
      ctr: 0.56,
      cpc: 2.84,
      spend: 128.00,
      orders: 3,
      sales: 300.00,
      acos: 42.7,
      roas: 2.34,
      attributedConversions1d: 2,
      attributedConversions7d: 3,
      attributedConversions14d: 3,
      attributedConversions30d: 4,
      lastUpdate: "2025-07-04",
    },
    {
      id: 4,
      adName: "Garden Hose Set",
      campaignName: "Product Launch UK",
      adGroupName: "Home & Garden",
      campaignType: "SD",
      adStatusText: "Active",
      servingStatus: "SERVING",
      adType: "PRODUCT_AD",
      asin: "B0CKDG8L1A",
      sku: "HOSE-GARDEN-SET-001",
      productTitle: "50ft Expandable Garden Hose with Spray Gun",
      bid: 1.85,
      bidType: "PRODUCT_TARGETING",
      matchType: "TARGETING_EXPRESSION",
      keyword: "",
      negativeKeyword: "",
      impressions: 12000,
      clicks: 85,
      ctr: 0.71,
      cpc: 1.82,
      spend: 154.70,
      orders: 2,
      sales: 200.00,
      acos: 77.4,
      roas: 1.29,
      attributedConversions1d: 2,
      attributedConversions7d: 2,
      attributedConversions14d: 2,
      attributedConversions30d: 3,
      lastUpdate: "2025-07-04",
    },
    {
      id: 5,
      adName: "Running Shoes",
      campaignName: "Back to School ",
      adGroupName: "Sports & Outdoors",
      campaignType: "SP",
      adStatusText: "Stopped",
      servingStatus: "ENDED",
      adType: "PRODUCT_AD",
      asin: "B0CKDG8M2B",
      sku: "SHOES-RUNNING-001",
      productTitle: "Lightweight Running Shoes for Men",
      bid: 1.50,
      bidType: "KEYWORD",
      matchType: "BROAD",
      keyword: "running shoes men",
      negativeKeyword: "cheap, used",
      impressions: 35000,
      clicks: 245,
      ctr: 0.70,
      cpc: 1.47,
      spend: 360.15,
      orders: 12,
      sales: 1200.00,
      acos: 30.0,
      roas: 3.33,
      attributedConversions1d: 11,
      attributedConversions7d: 12,
      attributedConversions14d: 12,
      attributedConversions30d: 13,
      lastUpdate: "2025-07-04",
    },
    {
      id: 6,
      adName: "Coffee Maker",
      campaignName: "Holiday Campaign ",
      adGroupName: "Kitchen Appliances",
      campaignType: "SP",
      adStatusText: "Active",
      servingStatus: "SERVING",
      adType: "PRODUCT_AD",
      asin: "B0CKDG8N3C",
      sku: "COFFEE-MAKER-001",
      productTitle: "Programmable Coffee Maker with Thermal Carafe",
      bid: 1.75,
      bidType: "KEYWORD",
      matchType: "PHRASE",
      keyword: "coffee maker programmable",
      negativeKeyword: "",
      impressions: 18000,
      clicks: 130,
      ctr: 0.72,
      cpc: 1.68,
      spend: 218.40,
      orders: 6,
      sales: 600.00,
      acos: 36.4,
      roas: 2.75,
      attributedConversions1d: 5,
      attributedConversions7d: 6,
      attributedConversions14d: 6,
      attributedConversions30d: 7,
      lastUpdate: "2025-07-04",
    },
  ];

  const adsData = useMemo(() => {
    if (selectedAdGroup) {
      return allAdsData.filter(ad => ad.adGroupName === selectedAdGroup);
    }
    return allAdsData;
  }, [selectedAdGroup]);

  const allColumns = [
    {
      field: "adName",
      title: "Ad Name",
      filter: "text",
      className: "font-medium",
    },
    {
      field: "campaignName",
      title: "Campaign",
      filter: "text",
    },
    {
      field: "adGroupName",
      title: "Ad Group",
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
      field: "adStatusText",
      title: "Status",
      filter: "text",
    },
    {
      field: "servingStatus",
      title: "Serving Status",
      filter: "text",
      render: (value) => {
        const statusColors = {
          "SERVING": "bg-green-100 text-green-800",
          "PAUSED": "bg-yellow-100 text-yellow-800",
          "ENDED": "bg-red-100 text-red-800",
          "PENDING": "bg-blue-100 text-blue-800",
          "REJECTED": "bg-red-100 text-red-800",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
            {value}
          </span>
        );
      },
    },
    {
      field: "adType",
      title: "Ad Type",
      filter: "text",
      render: (value) => (
        <span className="text-xs">{value.replace(/_/g, " ")}</span>
      ),
    },
    {
      field: "asin",
      title: "ASIN",
      filter: "text",
      render: (value) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      field: "sku",
      title: "SKU",
      filter: "text",
      render: (value) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      field: "productTitle",
      title: "Product Title",
      filter: "text",
      render: (value) => (
        <Tooltip content={value} position="right">
          <span className="cursor-pointer truncate block">{value}</span>
        </Tooltip>
      ),
    },
    {
      field: "bid",
      title: "Bid",
      filter: "numeric",
      format: "${0:n2}",
    },
    {
      field: "bidType",
      title: "Bid Type",
      filter: "text",
      render: (value) => (
        <span className="text-xs">{value.replace(/_/g, " ")}</span>
      ),
    },
    {
      field: "matchType",
      title: "Match Type",
      filter: "text",
      render: (value) => {
        const matchColors = {
          "BROAD": "bg-blue-100 text-blue-800",
          "PHRASE": "bg-green-100 text-green-800",
          "EXACT": "bg-purple-100 text-purple-800",
          "TARGETING_EXPRESSION": "bg-orange-100 text-orange-800",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${matchColors[value] || "bg-gray-100 text-gray-800"}`}>
            {value.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      field: "keyword",
      title: "Keyword",
      filter: "text",
      render: (value) => (
        <span className="text-xs">{value || "N/A"}</span>
      ),
    },
    {
      field: "negativeKeyword",
      title: "Negative Keywords",
      filter: "text",
      render: (value) => (
        <span className="text-xs text-red-600">{value || "None"}</span>
      ),
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
        "adName",
        "campaignName",
        "adGroupName",
        "campaignType",
        "adStatusText",
        "servingStatus",
       "ProductTitle",
        "bid",
        "bidType",
        "matchType",
        "keyword",
        "negativeKeyword",
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
        "adName",
        "campaignName",
        "CampaignType",
        "adStatusText",
        "servingStatus",
        "adType",
        "asin",
        "sku",
        "productTitle",
        "bid",
        "bidType",
        "matchType",
        "keyword",
        "negativeKeyword",
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

  const nonRemovableColumns = ["adName"];

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
      const params = new URLSearchParams();
      params.set('campaign', selectedCampaign);
      if (selectedProfile) {
        params.set('profile', selectedProfile);
      }
      breadcrumbs.push({
        label: selectedCampaign,
        onClick: () => navigate(`/channelamp/ad-groups?${params.toString()}`)
      });
    }

    if (selectedAdGroup) {
      breadcrumbs.push({
        label: selectedAdGroup,
        current: true
      });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 w-full">
      <div className="w-full">
        {(selectedProfile || selectedCampaign || selectedAdGroup) && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {buildBreadcrumb().map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>{'>'}</span>}
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
          data={adsData}
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
          onRowClick={() => {}}
        />
      </div>
    </div>
  );
};

export default AdsPage;