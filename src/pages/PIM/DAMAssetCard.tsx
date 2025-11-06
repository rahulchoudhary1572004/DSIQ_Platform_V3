// components/DAM/DAMAssetCard.tsx - Design 1: Modern Glassmorphism Clean UI
import React, { FC, useState } from "react";
import { Download, Trash2, Eye, Folder, MoreVertical } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";

interface DAMAssetCardProps {
  asset: DigitalAsset;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: (asset: DigitalAsset) => void;
  onDownload: (assetId: number) => void;
  onDelete: (assetId: number) => void;
  onAddToCollection?: (asset: DigitalAsset) => void;
  isDisabled?: boolean;
}

const DAMAssetCard: FC<DAMAssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
  onAddToCollection,
  isDisabled = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      image: "bg-blue-100",
      video: "bg-purple-100",
      document: "bg-orange-100",
      audio: "bg-green-100",
    };
    return colors[type?.toLowerCase() || "image"] || "bg-slate-100";
  };

  const getTypeText = (type?: string) => {
    const textColors: Record<string, string> = {
      image: "text-blue-700",
      video: "text-purple-700",
      document: "text-orange-700",
      audio: "text-green-700",
    };
    return textColors[type?.toLowerCase() || "image"] || "text-slate-700";
  };

  return (
    <div
      className={`w-full h-80 flex flex-col overflow-hidden transition-opacity duration-200 ${
        isDisabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Image Container - UNIFORM SIZE */}
      <div className="relative w-full h-48 overflow-hidden bg-slate-100 group flex-shrink-0">
        {/* Image - Always fills container uniformly */}
        {!imageError ? (
          <img
            src={asset.thumbnail}
            alt={asset.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full ${getTypeColor(asset.type)} flex items-center justify-center`}
          >
            <div className={`text-2xl font-bold opacity-40 ${getTypeText(asset.type)}`}>
              {asset.format.slice(0, 2).toUpperCase()}
            </div>
          </div>
        )}

        {/* Hover Overlay - Black Background */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            onClick={() => onPreview(asset)}
            className="p-2.5 bg-white/95 rounded-lg text-slate-700 hover:text-blue-600 transition-colors duration-150 shadow-md"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDownload(asset.id)}
            className="p-2.5 bg-white/95 rounded-lg text-slate-700 hover:text-green-600 transition-colors duration-150 shadow-md"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        {/* Format Badge - Bottom Right */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/90 text-slate-900 text-xs font-semibold rounded shadow-md">
          {asset.format.toUpperCase()}
        </div>
      </div>

      {/* Card Content - FIXED SIZE WITH UNIFORM PADDING */}
      <div className="w-full h-32 p-3 flex flex-col justify-between bg-white/40 backdrop-blur-sm">
        {/* Title and Info - UNIFORM SPACING */}
        <div className="flex-1 flex flex-col justify-start">
          {/* Title - FIXED SIZE */}
          <h3 className="font-semibold text-slate-900 text-xs line-clamp-2 leading-tight">
            {asset.name}
          </h3>
          
          {/* Info Section - UNIFORM SPACING */}
          <div className="mt-1.5 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <p className="text-xs text-slate-600 truncate">{asset.type || "Asset"}</p>
            </div>
            <p className="text-xs text-slate-500">
              {new Date(asset.uploadDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons - FIXED SIZE */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/30">
          <button
            onClick={onSelect}
            className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-colors duration-150 ${
              isSelected
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white/60 text-slate-700 hover:bg-white/70"
            }`}
          >
            {isSelected ? "✓ Selected" : "Select"}
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/50 rounded text-slate-600 hover:text-slate-700 transition-colors duration-150 relative flex-shrink-0"
          >
            <MoreVertical className="h-4 w-4" />

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute bottom-full right-0 mb-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/40 overflow-hidden z-30 min-w-[140px]">
                {onAddToCollection && (
                  <button
                    onClick={() => {
                      onAddToCollection(asset);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-2 transition-colors duration-150 border-b border-white/20"
                  >
                    <Folder className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    <span className="truncate">Add</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(asset.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-slate-700 text-xs flex items-center gap-2 transition-colors duration-150"
                >
                  <Trash2 className="h-3 w-3 text-red-600 flex-shrink-0" />
                  <span className="truncate">Delete</span>
                </button>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DAMAssetCard;
