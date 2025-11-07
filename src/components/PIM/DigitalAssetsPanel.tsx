import { X, Image as ImageIcon, FileText, Video, Download, Upload, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface DigitalAssetsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const DigitalAssetsPanel = ({ isOpen, onClose, productId, productName }: DigitalAssetsPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Mock assets data - replace with actual API call
  const mockAssets = [
    {
      id: "1",
      name: "product-image-main.jpg",
      type: "image",
      size: "2.4 MB",
      uploadedDate: "2024-11-01",
      url: "https://via.placeholder.com/300x300",
    },
    {
      id: "2",
      name: "product-image-side.jpg",
      type: "image",
      size: "1.8 MB",
      uploadedDate: "2024-11-01",
      url: "https://via.placeholder.com/300x300",
    },
    {
      id: "3",
      name: "product-spec-sheet.pdf",
      type: "document",
      size: "450 KB",
      uploadedDate: "2024-10-28",
      url: "#",
    },
    {
      id: "4",
      name: "product-demo-video.mp4",
      type: "video",
      size: "15.2 MB",
      uploadedDate: "2024-10-25",
      url: "#",
    },
  ];

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-600" />;
      case "video":
        return <Video className="h-5 w-5 text-purple-600" />;
      case "document":
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[rgba(60, 61, 61, 0.5)] backdrop-blur-[2px] z-40 transition-opacity" />

      {/* Side Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-[#DD522C]" />
              Digital Assets
            </h2>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            aria-label="Close panel"
            title="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Button */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <button className="w-full px-4 py-3 bg-[#DD522C] hover:bg-[#F27A56] text-white rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-md">
            <Upload className="h-5 w-5" />
            Upload New Assets
          </button>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {mockAssets.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No assets found</p>
                <p className="text-sm text-gray-400 mt-1">Upload digital assets for this product</p>
              </div>
            ) : (
              mockAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all bg-white group"
                >
                  {/* Asset Preview/Icon */}
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {asset.type === "image" ? (
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      getAssetIcon(asset.type)
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{asset.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{asset.type}</span>
                      <span>•</span>
                      <span>{asset.size}</span>
                      <span>•</span>
                      <span>{asset.uploadedDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 text-gray-400 hover:text-[#DD522C] hover:bg-[#FDE2CF] rounded-lg transition-all"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{mockAssets.length} asset{mockAssets.length !== 1 ? 's' : ''} total</span>
            <span className="text-gray-500">Product ID: {productId}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DigitalAssetsPanel;
