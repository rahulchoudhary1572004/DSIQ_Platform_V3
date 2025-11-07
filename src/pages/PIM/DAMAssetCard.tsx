// components/DAM/DAMAssetCard.tsx - Ultra Smooth with Hover Preview
import React, { FC, useState, useRef, useEffect } from "react";
import { Download, Trash2, Eye, Folder, MoreVertical } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";
import DAMAssetPreview from "./DAMAssetPreview";

interface DAMAssetCardProps {
  asset: DigitalAsset;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: (asset: DigitalAsset) => void;
  onDownload: (assetId: number) => void;
  onDelete: (assetId: number) => void;
  onAddToCollection?: (asset: DigitalAsset) => void;
  isDisabled?: boolean;
  onAddToFolderClick?: (asset: DigitalAsset) => void;
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
  onAddToFolderClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showHoverPreview, setShowHoverPreview] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Hover preview handlers
  const handleCardMouseEnter = () => {
    if (isDisabled || imageError) return;
    
    hoverTimerRef.current = setTimeout(() => {
      if (cardRef.current) {
        setCardRect(cardRef.current.getBoundingClientRect());
        setShowHoverPreview(true);
      }
    }, 1500); // 1.5 seconds delay
  };

  const handleCardMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowHoverPreview(false);
    setCardRect(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

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
      ref={cardRef}
      className={`w-full h-80 flex flex-col overflow-visible transition-opacity duration-150 relative ${
        isDisabled ? "opacity-50 pointer-events-none" : ""
      }`}
      style={{
        animation: "cardSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
    >
      {/* Hover Preview */}
      <DAMAssetPreview asset={asset} show={showHoverPreview} cardRect={cardRect} />
      {/* Image Container */}
      <div className="relative w-full h-48 overflow-hidden bg-slate-100 group flex-shrink-0">
        {!imageError ? (
          <img
            src={asset.thumbnail}
            alt={asset.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
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

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center justify-center gap-3">
          <button
            onClick={() => onPreview(asset)}
            className="p-2.5 bg-white/95 rounded-lg text-slate-700 hover:text-blue-600 transition-all duration-100 shadow-md active:scale-95"
            title="Preview"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDownload(asset.id)}
            className="p-2.5 bg-white/95 rounded-lg text-slate-700 hover:text-green-600 transition-all duration-100 shadow-md active:scale-95"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/90 text-slate-900 text-xs font-semibold rounded shadow-md">
          {asset.format.toUpperCase()}
        </div>
      </div>

      {/* Card Content */}
      <div className="w-full h-32 p-3 flex flex-col justify-between bg-white/40 backdrop-blur-sm">
        <div className="flex-1 flex flex-col justify-start">
          <h3 className="font-semibold text-slate-900 text-xs line-clamp-2 leading-tight">
            {asset.name}
          </h3>

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

        <div className="flex items-center gap-2 pt-2 border-t border-white/30">
          <button
            onClick={onSelect}
            className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all duration-100 ${
              isSelected
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white/60 text-slate-700 hover:bg-white/70"
            }`}
          >
            {isSelected ? "✓ Selected" : "Select"}
          </button>

          {onAddToFolderClick && (
            <button
              onClick={() => onAddToFolderClick(asset)}
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold transition-all duration-100 flex items-center gap-1 active:scale-95"
              title="Add to folder"
            >
              <Folder className="h-3 w-3" />
              <span>Add</span>
            </button>
          )}

          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-white/50 rounded text-slate-600 hover:text-slate-700 transition-all duration-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div
                className="absolute bottom-full right-0 mb-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/40 overflow-hidden z-30 min-w-[140px]"
                style={{
                  animation: "menuSlideUp 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {onAddToCollection && (
                  <button
                    onClick={() => {
                      onAddToCollection(asset);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-2 transition-all duration-100 border-b border-white/20"
                  >
                    <Folder className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    <span className="truncate">Collection</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(asset.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-slate-700 text-xs flex items-center gap-2 transition-all duration-100"
                >
                  <Trash2 className="h-3 w-3 text-red-600 flex-shrink-0" />
                  <span className="truncate">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes menuSlideUp {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DAMAssetCard;
