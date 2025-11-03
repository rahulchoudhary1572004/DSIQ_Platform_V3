import { FC, useState } from "react";
import { X, Download, Edit, Trash2, Copy, Share2 } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";

interface DAMAssetDetailProps {
  asset: DigitalAsset;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (assetId: number) => void;
  onDelete?: (assetId: number) => void;
  onEdit?: (asset: DigitalAsset) => void;
}

const DAMAssetDetail: FC<DAMAssetDetailProps> = ({
  asset,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onEdit,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderPreview = () => {
    switch (asset.type) {
      case "image":
        return (
          <img
            src={asset.thumbnail || asset.url}
            alt={asset.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        );
      case "video":
        return (
          <video
            src={asset.url}
            controls
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        );
      case "document":
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium text-white">{asset.name}</p>
              <p className="text-sm text-gray-300 mt-2">{asset.format} Document</p>
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎵</div>
              <audio
                src={asset.url}
                controls
                className="mt-4"
              />
              <p className="text-lg font-medium text-white mt-4">{asset.name}</p>
            </div>
          </div>
        );
      case "archive":
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg font-medium text-white">{asset.name}</p>
              <p className="text-sm text-gray-300 mt-2">{asset.files} files • {asset.size}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-6xl">📁</div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-neutral-200 focus:outline-none bg-black/30 hover:bg-black/50 rounded-full p-2 backdrop-blur-sm transition-all"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Preview Section */}
          <div className="lg:w-2/3 bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center p-8 min-h-[300px] lg:min-h-[500px]">
            {renderPreview()}
          </div>

          {/* Details Section */}
          <div className="lg:w-1/3 p-8 flex flex-col overflow-y-auto">
            {/* Type Badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                asset.type === "image" ? "bg-blue-100 text-blue-700" :
                asset.type === "video" ? "bg-purple-100 text-purple-700" :
                asset.type === "document" ? "bg-green-100 text-green-700" :
                asset.type === "audio" ? "bg-orange-100 text-orange-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                <span className="mr-1.5">
                  {asset.type === "image" ? "🖼️" :
                   asset.type === "video" ? "🎬" :
                   asset.type === "document" ? "📄" :
                   asset.type === "audio" ? "🎵" :
                   "📦"}
                </span>
                {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
              </span>
            </div>

            {/* Asset Name */}
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 break-words pr-8">
              {asset.name}
            </h2>

            {/* Metadata */}
            <div className="space-y-4 flex-1">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">File Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Format</span>
                    <span className="text-sm font-medium text-gray-900">{asset.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Size</span>
                    <span className="text-sm font-medium text-gray-900">{asset.size}</span>
                  </div>
                </div>
              </div>

              {/* Dimensions (for images/videos) */}
              {asset.dimensions && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Dimensions</h3>
                  <p className="text-sm font-mono text-gray-900">{asset.dimensions}</p>
                </div>
              )}

              {/* Duration (for videos/audio) */}
              {asset.duration && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Duration</h3>
                  <p className="text-sm font-mono text-gray-900">{asset.duration}</p>
                </div>
              )}

              {/* Pages (for documents) */}
              {asset.pages && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Pages</h3>
                  <p className="text-sm font-mono text-gray-900">{asset.pages}</p>
                </div>
              )}

              {/* Files (for archives) */}
              {asset.files && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Archive Contents</h3>
                  <p className="text-sm font-mono text-gray-900">{asset.files} files</p>
                </div>
              )}

              {/* Upload Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600 block mb-1">Uploaded By</span>
                    <p className="text-sm font-medium text-gray-900">{asset.uploadedBy}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 block mb-1">Date</span>
                    <p className="text-sm font-medium text-gray-900">{asset.uploadDate}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Copy */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Asset URL</span>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    {isCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => onDownload?.(asset.id)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title="Download asset"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
              <button
                onClick={() => onEdit?.(asset)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title="Edit asset metadata"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => onDelete?.(asset.id)}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                title="Delete asset"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAMAssetDetail;
