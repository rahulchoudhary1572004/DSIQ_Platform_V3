import { FC } from "react";
import { Download, Trash2, Search, File, Archive as ArchiveIcon, FileText as DocumentIcon, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";
import { digitalAssets } from "./dam.data";

type AssetType = "image" | "video" | "document" | "archive";

interface DAMAssetCardProps {
  asset: DigitalAsset;
  isSelected: boolean;
  onSelect: (assetId: number) => void;
  onPreview: (asset: DigitalAsset) => void;
  onDownload: (assetId: number) => void;
  onDelete: (assetId: number) => void;
  isDisabled?: boolean;
}

const getAssetTypeStyle = (type: AssetType): { icon: React.ReactNode; style: string } => {
  switch (type) {
    case "image":
      return { icon: <ImageIcon className="h-4 w-4" />, style: "bg-blue-100 text-blue-700 border border-blue-200" };
    case "video":
      return { icon: <VideoIcon className="h-4 w-4" />, style: "bg-purple-100 text-purple-700 border border-purple-200" };
    case "document":
      return { icon: <DocumentIcon className="h-4 w-4" />, style: "bg-green-100 text-green-700 border border-green-200" };
    case "archive":
      return { icon: <ArchiveIcon className="h-4 w-4" />, style: "bg-orange-100 text-orange-700 border border-orange-200" };
    default:
      return { icon: <File className="h-4 w-4" />, style: "bg-slate-100 text-slate-700 border border-slate-200" };
  }
};

const DAMAssetCard: FC<DAMAssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
  isDisabled = false,
}) => {
  const { icon, style } = getAssetTypeStyle(asset.type as AssetType);

  // Get asset data from dam.data.ts
  const assetName = asset.name || "Untitled";
  const assetId = asset.id || 0;
  const assetUrl = asset.thumbnail || "https://placehold.co/400x300/F0F0F0/CCC?text=No+Image";
  const assetType = asset.type || "document";
  const assetFormat = asset.format || "???";
  const assetSize = asset.size || "0 MB";
  const assetUploadedBy = asset.uploadedBy || "Unknown";
  const assetUploadDate = asset.uploadDate || "---";

  const AssetPreview: FC = () => {
    switch (assetType) {
      case "image":
        return (
          <img
            src={assetUrl}
            alt={assetName}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/400x300/F0F0F0/CCC?text=Image+Error")}
          />
        );
      case "video":
        return (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <VideoIcon className="h-12 w-12 text-slate-500" />
          </div>
        );
      case "document":
        return (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <DocumentIcon className="h-12 w-12 text-slate-400" />
          </div>
        );
      case "archive":
        return (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <ArchiveIcon className="h-12 w-12 text-slate-400" />
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <File className="h-12 w-12 text-slate-400" />
          </div>
        );
    }
  };

  return (
    <div
      className={`relative group bg-white border rounded-lg shadow-sm overflow-hidden transition-all duration-200 ease-in-out ${
        isSelected ? "border-blue-500 ring-2 ring-blue-500 shadow-md" : "border-slate-200 hover:shadow-lg"
      } ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* TYPE BADGE */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-medium ${style}`}>
        {icon}
        <span className="uppercase">{assetType}</span>
      </div>

      {/* PREVIEW AREA */}
      <div
        className="aspect-video w-full overflow-hidden cursor-pointer"
        onClick={() => onPreview(asset)}
      >
        <AssetPreview />
      </div>

      {/* HOVER ACTIONS */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 ">
        <button
          onClick={() => onPreview(asset)}
          className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all hover:scale-105 active:scale-95"
          title="Preview"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDownload(assetId)}
          className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all hover:scale-105 active:scale-95"
          title="Download"
        >
          <Download className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(assetId)}
          className="p-3 bg-white/20 text-white rounded-full hover:bg-red-500/50 transition-all hover:scale-105 active:scale-95"
          title="Delete"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* CHECKBOX */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(assetId)}
          className="w-5 h-5 rounded cursor-pointer accent-blue-600"
        />
      </div>

      {/* INFO */}
      <div className="p-4">
        <h3
          className="font-semibold text-sm text-slate-900 truncate mb-1.5 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => onPreview(asset)}
          title={assetName}
        >
          {assetName}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium text-slate-600 uppercase">{assetFormat}</span>
          <span>{assetSize}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="truncate" title={`Uploaded by ${assetUploadedBy}`}>
            {assetUploadedBy}
          </span>
          <span>{assetUploadDate}</span>
        </div>
      </div>
    </div>
  );
};

export default DAMAssetCard;
