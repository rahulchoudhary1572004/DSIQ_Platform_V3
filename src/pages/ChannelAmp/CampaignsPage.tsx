import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import KendoGrid from "../../components/ChannelAmp/KendoGrid";
import CampaignCreationFlow from "../../components/ChannelAmp/CampaignCreation/CampaignCreationFlow";
import Tooltip from "../../components/Tooltip";
import DateSelector from "../../components/ChannelAmp/DateSelector";

const CampaignsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCampaignCreation, setShowCampaignCreation] = useState(false);
  const [gridDataState, setGridDataState] = useState({
    sort: [],
    filter: null,
    skip: 0,
    take: 20,
    group: [], // Enable grouping by default
  });
  const [selectedRows, setSelectedRows] = useState([]);
  
  // TODO: Replace with actual access token from authentication
  const accessToken = "your-access-token";

  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
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

  // State for campaigns data
  const [allCampaignsData, setAllCampaignsData] = useState([
    {
      id: 1,
      campaignName: "Holiday Campaign",
      profileName: "Philips Avent - US - Criteo",
      campaignType: "SP",
      campaignStatusText: "Active",
      targetingType: "AUTO",
      dailyBudget: 100.00,
      bidStrategy: "DYNAMIC_BID_DOWN_ONLY",
      portfolioId: "PORT_001",
      startDate: "2024-11-01",
      endDate: "2024-12-31",
      spend: 2500.00,
      impressions: 125000,
      clicks: 875,
      ctr: 0.70,
      cpc: 2.86,
      orders: 105,
      sales: 10500.00,
      acos: 23.8,
      roas: 4.2,
      attributedConversions1d: 98,
      attributedConversions7d: 105,
      attributedConversions14d: 108,
      attributedConversions30d: 112,
      lastUpdate: "2025-07-04",
    },
    {
      id: 2,
      campaignName: "Brand Defense Q4",
      profileName: "Philips Avent - US - WMT",
      campaignType: "SB",
      campaignStatusText: "Active",
      targetingType: "MANUAL",
      dailyBudget: 75.00,
      bidStrategy: "FIXED_BID",
      portfolioId: "PORT_002",
      startDate: "2024-10-01",
      endDate: "2024-12-31",
      spend: 1800.00,
      impressions: 95000,
      clicks: 650,
      ctr: 0.68,
      cpc: 2.77,
      orders: 68,
      sales: 6840.00,
      acos: 26.3,
      roas: 3.8,
      attributedConversions1d: 65,
      attributedConversions7d: 68,
      attributedConversions14d: 70,
      attributedConversions30d: 73,
      lastUpdate: "2025-07-04",
    },
  ]);

  const campaignsData = useMemo(() => {
    console.log("Campaigns Data:", allCampaignsData);
    if (selectedProfile) {
      return allCampaignsData.filter(campaign => campaign.profileName === selectedProfile);
    }
    return allCampaignsData;
  }, [selectedProfile, allCampaignsData]);

  const allColumns = [
    {
      field: "campaignName",
      title: "Campaign Name",
      filter: "text",
      locked: true,
      className: "cursor-pointer text-blue-600 hover:text-blue-800 hover:underline",
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
      field: "campaignStatusText",
      title: "Status",
      filter: "text",
    },
    {
      field: "targetingType",
      title: "Targeting",
      filter: "text",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value === "AUTO" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      field: "dailyBudget",
      title: "Daily Budget",
      filter: "numeric",
      format: "${0:n2}",
    },
    {
      field: "bidStrategy",
      title: "Bid Strategy",
      filter: "text",
      render: (value) => (
        <span className="text-xs">{value.replace(/_/g, " ")}</span>
      ),
    },
    {
      field: "portfolioId",
      title: "Portfolio",
      filter: "text",
    },
    {
      field: "startDate",
      title: "Start Date",
      filter: "date",
      format: "{0:MM/dd/yyyy}",
    },
    {
      field: "endDate",
      title: "End Date",
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
        "campaignName",
        "campaignType",
        "campaignStatusText",
        "targetingType",
        "dailyBudget",
        "bidStrategy",
        "portfolioId",
        "startDate",
        "endDate",
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
        "campaignName",
        "campaignType",
        "campaignStatusText",
        "targetingType",
        "dailyBudget",
        "bidStrategy",
        "portfolioId",
        "startDate",
        "endDate",
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

  const nonRemovableColumns = ["campaignName"];

  const handleCampaignClick = (campaignName) => {
    const params = new URLSearchParams();
    params.set('campaign', campaignName);
    if (selectedProfile) {
      params.set('profile', selectedProfile);
    }
    navigate(`/channelamp/ad-groups?${params.toString()}`);
  };

  const createAdGroup = async (campaignId, defaultBid) => {
    const response = await fetch("https://advertising-api.amazon.com/sp/adGroups", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": "your-client-id",
        "Amazon-Advertising-API-Scope": "your-profile-id",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Ad Group 1 - Electronics",
        campaignId: campaignId,
        defaultBid: defaultBid || 0.50,
        state: "enabled"
      })
    });
    const adGroup = await response.json();
    console.log("Ad Group created:", adGroup);
    return adGroup.adGroupId;
  };

  const createProductAd = async (adGroupId, asin) => {
    const response = await fetch("https://advertising-api.amazon.com/sp/productAds", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": "your-client-id",
        "Amazon-Advertising-API-Scope": "your-profile-id",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        adGroupId: adGroupId,
        state: "enabled",
        asin: asin || "B08XYZ1234"
      })
    });
    const productAd = await response.json();
    console.log("Product Ad created:", productAd);
  };

  const addKeywords = async (adGroupId, keywords) => {
    for (const keyword of keywords) {
      await fetch("https://advertising-api.amazon.com/sp/keywords", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Amazon-Advertising-API-ClientId": "your-client-id",
          "Amazon-Advertising-API-Scope": "your-profile-id",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adGroupId: adGroupId,
          keywordText: keyword.text,
          matchType: keyword.matchType.toLowerCase(),
          bid: parseFloat(keyword.bid) || 0.50,
          state: "enabled"
        })
      });
      console.log(`Keyword added: ${keyword.text}`);
    }
  };

  const addNegativeKeywords = async (adGroupId, negativeKeywords) => {
    for (const keyword of negativeKeywords) {
      await fetch("https://advertising-api.amazon.com/sp/negativeKeywords", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Amazon-Advertising-API-ClientId": "your-client-id",
          "Amazon-Advertising-API-Scope": "your-profile-id",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adGroupId: adGroupId,
          keywordText: keyword.text,
          matchType: "negativeExact",
          state: "enabled"
        })
      });
      console.log(`Negative keyword added: ${keyword.text}`);
    }
  };

  const handleCampaignCreated = async (campaignData) => {
    console.log("New campaign created:", campaignData);
    try {
      const response = await fetch("https://advertising-api.amazon.com/sp/campaigns", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Amazon-Advertising-API-ClientId": "your-client-id",
          "Amazon-Advertising-API-Scope": "your-profile-id",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: campaignData.campaignName,
          campaignType: "sponsoredProducts",
          targetingType: campaignData.targetingType.toLowerCase(),
          state: "enabled",
          dailyBudget: parseFloat(campaignData.dailyBudget) || 50.00,
          startDate: campaignData.startDate || new Date().toISOString().split("T")[0],
          endDate: campaignData.endDate || null,
          portfolioId: campaignData.portfolioId || "PORT_001",
          bidOptimization: campaignData.bidStrategy.toLowerCase().replace(/_/g, "-")
        })
      });
      const newCampaign = await response.json();
      console.log("Campaign created:", newCampaign);

      const adGroupId = await createAdGroup(newCampaign.campaignId, 0.50);
      await createProductAd(adGroupId, "B08XYZ1234");

      if (campaignData.targetingType === "MANUAL") {
        await addKeywords(adGroupId, campaignData.keywords);
        await addNegativeKeywords(adGroupId, campaignData.negativeKeywords);
      }

      const updatedCampaign = {
        ...newCampaign,
        profileName: selectedProfile || "Philips Avent - US - Criteo",
        campaignType: "SP",
        campaignStatus: "▶️",
        targetingType: campaignData.targetingType,
        dailyBudget: parseFloat(campaignData.dailyBudget) || 50.00,
        bidStrategy: campaignData.bidStrategy,
      };
      setAllCampaignsData((prev) => [updatedCampaign, ...prev]);
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
    setShowCampaignCreation(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 w-full">
      <div className="w-full">
        <div className="flex mb-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedProfile ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span
                  className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => navigate('/channelamp/profiles')}
                >
                  Profiles
                </span>
                <span>{'>'}</span>
                <span className="font-medium text-gray-900">{selectedProfile}</span>
              </div>
            ) : (
              <h1 className="text-xl font-semibold text-gray-900">Campaigns</h1>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCampaignCreation(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Plus size={16} />
              <span>Add Campaign</span>
            </button>
          </div>
        </div>
        <div className="flex mb-4 items-center">
          <DateSelector />
        </div>
        <KendoGrid
          data={campaignsData}
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
            if (cell && cell.classList.contains("k-grid-content-sticky") && allColumnsState.visible.find((col) => col.field === "campaignName")?.locked) {
              if (allColumnsState.visible[0].field === "campaignName") {
                handleCampaignClick(dataItem.campaignName);
              }
            }
          }}
        />
        {showCampaignCreation && (
          <CampaignCreationFlow
            onComplete={handleCampaignCreated}
            onCancel={() => setShowCampaignCreation(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;