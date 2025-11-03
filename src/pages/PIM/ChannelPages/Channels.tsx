import React from "react";
import { ShoppingCart, Plus } from "lucide-react";
import FloatingAddButton from "../../../../helper_Functions/FloatingAddButton";
import { useNavigate } from "react-router-dom";


const channels = [
  {
    name: "Amazon",
    status: "Connected",
    connectedDate: "2024-01-10",
    tokenExpires: "2024-06-10",
    color: "green",
  },
  {
    name: "Walmart",
    status: "Connected",
    connectedDate: "2024-01-12",
    tokenExpires: "2024-05-12",
    color: "green",
  },
  {
    name: "Target",
    status: "Disconnected",
    color: "gray",
  },
  {
    name: "Shopify",
    status: "Available",
    color: "blue",
  },
];

const Channels = () => {
    const navigate = useNavigate();
    const handleAddChannel = () => {
      console.log("Add new channel clicked");
    };
    const handleChannelClick = (channelName) => {
      navigate(`/pim/channels/${channelName}`);
    };
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Channels</h1>
      </div>
      <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div key={channel.name} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold cursor-pointer hover:underline" onClick={() => handleChannelClick(channel.name)}>{channel.name}</h3>
                  {channel.status === "Connected" && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
                  )}
                  {channel.status === "Disconnected" && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">Disconnected</span>
                  )}
                  {channel.status === "Available" && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">Available</span>
                  )}
                </div>
              </div>
              {channel.status === "Connected" && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Connected:</span>
                    <span className="font-medium">{channel.connectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Token Expires:</span>
                    <span className="font-medium">{channel.tokenExpires}</span>
                  </div>
                </div>
              )}
              {channel.status === "Disconnected" && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Connect to start syndicating products to {channel.name}</p>
                </div>
              )}
              {channel.status === "Available" && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Connect to start syndicating products to {channel.name}</p>
                </div>
              )}
              <div className="flex gap-2">
                {channel.status === "Connected" && (
                  <>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
                      Disconnect
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm">
                      Test Connection
                    </button>
                  </>
                )}
                {(channel.status === "Disconnected" || channel.status === "Available") && (
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-bold mb-4">Connection Guide</h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-2">Step 1: Connect Channels</h4>
              <p className="text-sm text-gray-600">
                Click "Connect" on each channel to authorize access. You'll be redirected to the channel's authorization page if required.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-2">Step 2: Configure Field Mappings</h4>
              <p className="text-sm text-gray-600">
                Go to the Field Mapping section to map your PIM fields to each channel's required fields.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-2">Step 3: Start Syndicating</h4>
              <p className="text-sm text-gray-600">
                Once connected and mapped, your products will automatically sync to the channels. Monitor progress in the Syndication Status section.
              </p>
            </div>
          </div>
        </div>
      </div>
      <FloatingAddButton 
        onClick={handleAddChannel}
        label="Add Channel"
        icon={Plus}
      />
    </div>
  );
};

export default Channels; 