import { FC, useState } from "react";
import { Eye, Download, Trash2, Edit, Check, Plus, Clock, User } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";

interface DAMAssetCardProps {
  asset: DigitalAsset;
  isSelected: boolean;
  onSelect: (assetId: number) => void;
  onPreview: (asset: DigitalAsset) => void;
  onDownload: (assetId: number) => void;
  onDelete: (assetId: number) => void;
}

const getTypeIcon = (type: DigitalAsset["type"]) => {
  const icons: Record<string, string> = {
    image: "🖼️",
    video: "🎥",
    document: "📋",
    audio: "🎧",
    archive: "📦",
  };
  return icons[type] || "📁";
};

const getTypeColor = (type: DigitalAsset["type"]) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    image: { bg: "from-blue-500/20 to-cyan-500/20", text: "text-blue-700", border: "border-blue-300" },
    video: { bg: "from-purple-500/20 to-pink-500/20", text: "text-purple-700", border: "border-purple-300" },
    document: { bg: "from-green-500/20 to-emerald-500/20", text: "text-green-700", border: "border-green-300" },
    audio: { bg: "from-orange-500/20 to-yellow-500/20", text: "text-orange-700", border: "border-orange-300" },
    archive: { bg: "from-slate-500/20 to-gray-500/20", text: "text-slate-700", border: "border-slate-300" },
  };
  return colors[type] || colors.image;
};

const DAMAssetCard: FC<DAMAssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const typeColor = getTypeColor(asset.type);
  const hasImage = asset.thumbnail || asset.type === "image";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full group cursor-pointer transition-all duration-300 ${
        isSelected ? "scale-95" : ""
      }`}
    >
      {/* Main Card Container */}
      <div
        className={`flex flex-col h-full bg-white rounded-3xl overflow-hidden transition-all duration-300 ${
          isSelected
            ? "ring-2 ring-blue-500 shadow-2xl"
            : "shadow-md hover:shadow-2xl border border-gray-100"
        }`}
      >
        {/* Image Section */}
        <div className={`relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br ${typeColor.bg}`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          {/* Image or Icon */}
          {hasImage ? (
            <img
              src={asset.thumbnail || asset.url}
              alt={asset.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-7xl opacity-50">{getTypeIcon(asset.type)}</div>
            </div>
          )}

          {/* Overlay on Hover */}
          <div
            className={`absolute inset-0 bg-black/0 transition-all duration-300 flex items-center justify-center gap-3 ${
              isHovered ? "bg-black/40" : ""
            }`}
          >
            {isHovered && (
              <div className="flex gap-2 animate-in fade-in zoom-in-50 duration-200">
                <button
                  onClick={() => onPreview(asset)}
                  className="p-3 bg-white rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                  title="Preview"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDownload(asset.id)}
                  className="p-3 bg-white rounded-full hover:bg-green-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  className="p-3 bg-white rounded-full hover:bg-purple-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                  title="Edit"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(asset.id)}
                  className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Selection Checkbox - Top Left */}
          {/* <button
            onClick={() => onSelect(asset.id)}
            className={`absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-md z-10 ${
              isSelected
                ? "bg-blue-500 text-white scale-110"
                : "bg-white/80 text-gray-400 hover:bg-white hover:text-gray-600"
            }`}
          >
            {isSelected ? (
              <Check className="h-5 w-5" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button> */}

          {/* Type Badge - Top Right */}
          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/90 border ${typeColor.border} shadow-md z-10`}>
            <span className={`flex items-center gap-1.5 text-xs font-bold ${typeColor.text}`}>
              <span>{getTypeIcon(asset.type)}</span>
              <span className="uppercase tracking-wide">{asset.type}</span>
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4 space-y-3">
          {/* File Name */}
          <div>
            <h3
              className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 break-words"
              title={asset.name}
            >
              {asset.name}
            </h3>
          </div>

          {/* Quick Info - Format & Size */}
          <div className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
            <span className="font-semibold text-gray-700">{asset.format}</span>
            <span className="font-mono text-gray-600 font-bold">{asset.size}</span>
          </div>

          {/* Additional Details */}
          <div className="space-y-1.5 text-xs text-gray-600">
            {asset.dimensions && (
              <div className="flex justify-between">
                <span>📐</span>
                <span className="font-mono font-medium text-gray-700">{asset.dimensions}</span>
              </div>
            )}
            {asset.duration && (
              <div className="flex justify-between items-center">
                <span>⏱️</span>
                <span className="font-mono font-medium text-gray-700">{asset.duration}</span>
              </div>
            )}
            {asset.pages && (
              <div className="flex justify-between">
                <span>📄</span>
                <span className="font-mono font-medium text-gray-700">{asset.pages} pages</span>
              </div>
            )}
            {asset.files && (
              <div className="flex justify-between">
                <span>📦</span>
                <span className="font-mono font-medium text-gray-700">{asset.files} files</span>
              </div>
            )}
          </div>

          {/* Divider */}
          {(asset.dimensions || asset.duration || asset.pages || asset.files) && (
            <div className="h-px bg-gray-200"></div>
          )}

          {/* Footer - Upload Info */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1 text-gray-500 min-w-0">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate font-medium">{asset.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-mono text-gray-600">{asset.uploadDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Indicator Ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-3xl ring-2 ring-blue-400/30 pointer-events-none"></div>
      )}
    </div>
  );
};

export default DAMAssetCard;
