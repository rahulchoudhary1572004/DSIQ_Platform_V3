
import { FC, useState, useEffect, useRef } from "react";
import { X, Download, Trash2, Clock, User, Share2, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";

interface DAMAssetDetailProps {
  asset: DigitalAsset;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (assetId: number) => void;
  onDelete: (assetId: number) => void;
}

const PremiumVideoPlayer: FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Auto play might fail without user interaction, catch the error
        videoRef.current.play().catch((error) => {
          console.warn('Video play failed:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      // Auto unmute when volume is increased
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative w-full h-full bg-orange-50 rounded-lg overflow-hidden group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button
          onClick={handlePlayPause}
          className="pointer-events-auto w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/15 transition-colors duration-100 active:scale-95"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-white ml-1" fill="white" />
          ) : (
            <Play className="h-6 w-6 text-white ml-1" fill="white" />
          )}
        </button>
      </div>

      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-100 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="px-4 pt-4 pb-1">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group/bar">
            <div
              className="h-full bg-orange-400 transition-all duration-50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePlayPause}
              className="p-1.5 hover:bg-white/10 transition-colors duration-100 text-white rounded"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" fill="white" />
              ) : (
                <Play className="h-3 w-3 ml-0.5" fill="white" />
              )}
            </button>

            <button className="p-1.5 hover:bg-white/10 transition-colors duration-100 text-white rounded">
              <SkipBack className="h-3 w-3" />
            </button>

            <button className="p-1.5 hover:bg-white/10 transition-colors duration-100 text-white rounded">
              <SkipForward className="h-3 w-3" />
            </button>

            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 hover:bg-white/10 transition-colors duration-100 text-white rounded"
              >
                {isMuted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-12 h-0.5 bg-white/10 rounded-full cursor-pointer accent-blue-400 appearance-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-white text-xs font-medium">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/30">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <button className="p-1.5 hover:bg-white/10 transition-colors duration-100 text-white rounded">
            <Maximize className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DAMAssetDetail: FC<DAMAssetDetailProps> = ({
  asset,
  isOpen,
  onClose,
  onDownload,
  onDelete,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const DetailPreview: FC = () => {
    switch (asset.type?.toLowerCase()) {
      case "image":
        return (
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-full object-contain"
            onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/FFFFFF/F0F0F0?text=")}
          />
        );
      case "video":
        return <PremiumVideoPlayer src={asset.url} />;
      case "document":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-5xl font-light text-gray-300 mb-3">📄</div>
            <p className="text-gray-400 text-xs tracking-wide font-light">DOCUMENT</p>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-5xl font-light text-gray-300 mb-3">📦</div>
            <p className="text-gray-400 text-xs tracking-wide font-light">FILE</p>
          </div>
        );
    }
  };

  const DetailRow: FC<{ label: string; value: string | undefined }> = ({
    label,
    value,
  }) =>
    value ? (
      <div className="grid grid-cols-4 gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="col-span-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        </div>
        <div className="col-span-3">
          <p className="text-sm text-gray-900 font-medium">{value}</p>
        </div>
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0)",
        transitionDuration: "40ms",
        transitionProperty: "background-color",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={onClose}
    >
      <div
        className="relative z-50 bg-white rounded-2xl overflow-hidden w-full max-w-6xl h-[30rem] flex border border-gray-200/40"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0px) scale(1)" : "translateY(20px) scale(0.97)",
          transitionDuration: "50ms",
          transitionProperty: "opacity, transform",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: isVisible
            ? "0 20px 60px rgba(0,0,0,0.08)"
            : "0 10px 30px rgba(0,0,0,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-100/70 hover:bg-gray-100 rounded-full transition-colors duration-100 border-0"
        >
          <X className="h-4 w-4 font-light" strokeWidth={1.5} />
        </button>

        <div className="w-2/5 h-full bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden border-r border-gray-100">
          <div className="p-8 w-full h-full flex items-center justify-center">
            <DetailPreview />
          </div>
        </div>

        <div className="w-3/5 h-full flex flex-col overflow-hidden bg-white">
          <div className="px-10 pt-8 pb-6 flex-shrink-0 border-b border-gray-100">
            <h1 className="text-2xl font-light text-gray-900 line-clamp-2 break-words leading-tight tracking-tight">
              {asset.name}
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs text-gray-600 uppercase font-medium tracking-wider">
                {asset.type ? asset.type.charAt(0).toUpperCase() + asset.type.slice(1) : "Asset"}
              </span>
              <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-600 uppercase font-medium tracking-wider">
                {asset.format?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 py-6 space-y-8">
            <div>
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-4">Details</p>
              <div className="space-y-0">
                <DetailRow label="Size" value={asset.size} />
                <DetailRow label="Dimensions" value={asset.dimensions} />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-4">Upload Information</p>
              <div className="space-y-0">
                <div className="grid grid-cols-4 gap-4 py-4 border-b border-gray-100">
                  <div className="col-span-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">By</p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <User className="h-3 w-3 text-gray-400" />
                    <p className="text-sm text-gray-900 font-medium">{asset.uploadedBy}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 py-4">
                  <div className="col-span-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <p className="text-sm text-gray-900 font-medium">{asset.uploadDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {asset.tags && asset.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-4">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium transition-colors duration-100 hover:bg-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-10 py-6 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <button
              onClick={() => onDownload(asset.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 transition-colors duration-100 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Get
            </button>
            <button
              onClick={() => {
                onDelete(asset.id);
                onClose();
              }}
              className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-100 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-100 active:scale-95">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          border-radius: 1px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #60a5fa;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #60a5fa;
          cursor: pointer;
          border: none;
          transition: background 0.15s, transform 0.15s;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
};

export default DAMAssetDetail;
