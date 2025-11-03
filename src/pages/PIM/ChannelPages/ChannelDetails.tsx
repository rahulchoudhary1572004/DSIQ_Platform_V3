import React, { useState } from "react";
import ListedProductsTab from "./ListedProductsTab";
import ReadinessTab from "./ReadinessTab";
import { useParams } from "react-router-dom";

const ChannelDetails = () => {
  const { channelName } = useParams();
  const [activeTab, setActiveTab] = useState("listed");

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">{channelName} Channel</h1>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-t ${activeTab === "listed" ? "bg-white border-b-2 border-blue-600 font-semibold" : "bg-gray-100"}`}
          onClick={() => setActiveTab("listed")}
        >
          Listed Products
        </button>
        <button
          className={`px-4 py-2 rounded-t ${activeTab === "readiness" ? "bg-white border-b-2 border-blue-600 font-semibold" : "bg-gray-100"}`}
          onClick={() => setActiveTab("readiness")}
        >
          Readiness
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === "listed" ? <ListedProductsTab channelName={channelName} /> : <ReadinessTab channelName={channelName} />}
      </div>
    </div>
  );
};

export default ChannelDetails; 