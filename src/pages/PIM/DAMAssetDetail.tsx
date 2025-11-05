import { FC } from "react";
import { X, Download, Trash2, File, Archive as ArchiveIcon, FileText as DocumentIcon, Video as VideoIcon } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";

interface DAMAssetDetailProps {
  asset: DigitalAsset;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (assetId: number) => void;
  onDelete: (assetId: number, assetName: string) => void;
}

const DAMAssetDetail: FC<DAMAssetDetailProps> = ({
  asset,
  isOpen,
  onClose,
  onDownload,
  onDelete,
}) => {
  if (!isOpen) return null;

  const DetailPreview: FC = () => {
    switch (asset.type) {
      case "image":
        return (
          <img
            src={asset.url}
            alt={asset.name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/1200x800/F0F0F0/CCC?text=Image+Error")}
          />
        );
      case "video":
        return <video controls src={asset.url} className="max-w-full max-h-full object-contain" />;
      case "document":
        return (
          <div className="p-8 text-center">
            <DocumentIcon className="h-32 w-32 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Document preview not available.</p>
            <p className="text-sm text-slate-500">{asset.name}</p>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center">
            <File className="h-32 w-32 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Preview not available.</p>
            <p className="text-sm text-slate-500">{asset.name}</p>
          </div>
        );
    }
  };

  const DetailRow: FC<{ label: string; value: string | undefined }> = ({ label, value }) =>
    value ? (
      <div className="py-2.5">
        <span className="text-xs font-medium text-slate-500 uppercase">{label}</span>
        <p className="text-sm text-slate-900">{value}</p>
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative z-50 bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-6xl h-[90vh] flex transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-500 bg-white/50 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-all"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden">
          <DetailPreview />
        </div>

        <aside className="w-80 2xl:w-96 border-l border-slate-200 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4 break-words">{asset.name}</h2>
            <div className="divide-y divide-slate-100">
              <DetailRow label="Asset Type" value={asset.type} />
              <DetailRow label="File Format" value={asset.format} />
              <DetailRow label="File Size" value={asset.size} />
              <DetailRow label="Dimensions" value={asset.dimensions} />
              <DetailRow label="Uploaded By" value={asset.uploadedBy} />
              <DetailRow label="Upload Date" value={asset.uploadDate} />
              
              {/* FIX: Add null/undefined check for tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="py-2.5">
                  <span className="text-xs font-medium text-slate-500 uppercase">Tags</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-sm border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
            <button
              onClick={() => onDownload(asset.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all duration-150 active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={() => {
                onDelete(asset.id, asset.name);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-200 transition-all duration-150 active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DAMAssetDetail;
