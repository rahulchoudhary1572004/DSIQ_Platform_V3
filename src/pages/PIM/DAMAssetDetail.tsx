// components/DAM/DAMAssetDetail_Design10.tsx - Apple Mastery of Space (Taller)
import { FC, useState, useEffect, useRef } from "react";
import { X, Download, Trash2, File, FileText as DocumentIcon, Clock, User, Share2, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
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

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full h-full bg-black rounded-2xl overflow-hidden group cursor-pointer"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => showControls && setShowControls(false)}
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

      {/* Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button
          onClick={handlePlayPause}
          className="pointer-events-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8 text-white ml-1" fill="white" />
          ) : (
            <Play className="h-8 w-8 text-white ml-1" fill="white" />
          )}
        </button>
      </div>

      {/* Controls Bar - Bottom */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="px-6 pt-6 pb-2">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group/bar">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-100 group-hover/bar:h-1.5"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" fill="white" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" fill="white" />
              )}
            </button>

            <button className="p-2 hover:bg-white/20 rounded-lg transition-all text-white">
              <SkipBack className="h-4 w-4" />
            </button>

            <button className="p-2 hover:bg-white/20 rounded-lg transition-all text-white">
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-1 text-white text-xs font-medium">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/40">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Right Controls */}
          <button className="p-2 hover:bg-white/20 rounded-lg transition-all text-white">
            <Maximize className="h-4 w-4" />
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
      const timer = setTimeout(() => setIsVisible(false), 300);
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
        return (
          <PremiumVideoPlayer src={asset.url} />
        );
      case "document":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white">
            <div className="text-6xl font-light text-gray-300 mb-4">📄</div>
            <p className="text-gray-400 text-xs tracking-wide font-light">DOCUMENT</p>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white">
            <div className="text-6xl font-light text-gray-300 mb-4">📦</div>
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
      <div className="grid grid-cols-4 gap-4 py-5 border-b border-gray-100 last:border-0">
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
      className={`fixed inset-0 z-40 flex items-center justify-center p-4 transition-colors`}
      style={{
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        transitionDuration: "500ms",
        backdropFilter: `blur(${isVisible ? 30 : 0}px)`,
        WebkitBackdropFilter: `blur(${isVisible ? 30 : 0}px)`,
      }}
      onClick={onClose}
    >
      <div
        className={`relative z-50 bg-white rounded-3xl overflow-hidden w-full max-w-7xl h-[32rem] flex border border-gray-200/50 transition-all`}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0px) scale(1)" : "translateY(60px) scale(0.88)",
          transitionDuration: "600ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: isVisible
            ? "0 50px 100px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)"
            : "0 20px 40px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-white/70 hover:bg-white rounded-full transition-all duration-300 border border-gray-200/50"
        >
          <X className="h-5 w-5 font-light" strokeWidth={1.5} />
        </button>

        {/* LEFT: Image/Video - Expansive Taller */}
        <div className="w-2/5 h-full bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <div className="p-12 w-full h-full flex items-center justify-center">
            <DetailPreview />
          </div>
        </div>

        {/* RIGHT: Information - Spacious */}
        <div className="w-3/5 h-full flex flex-col overflow-hidden bg-white">
          {/* Header - Large Typography */}
          <div className="px-12 pt-10 pb-8 flex-shrink-0 border-b border-gray-100">
            <h1 className="text-3xl font-light text-gray-900 line-clamp-2 break-words leading-tight tracking-tight">
              {asset.name}
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-xs text-gray-600 uppercase font-medium tracking-wider">
                {asset.type ? asset.type.charAt(0).toUpperCase() + asset.type.slice(1) : "Asset"}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-600 uppercase font-medium tracking-wider">
                {asset.format?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Scrollable Content - Maximum Space */}
          <div className="flex-1 overflow-y-auto px-12 py-8 space-y-10">
            {/* Details Grid */}
            <div>
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-6">
                Details
              </p>
              <div className="space-y-0">
                <DetailRow label="Size" value={asset.size} />
                <DetailRow label="Dimensions" value={asset.dimensions} />
              </div>
            </div>

            {/* Upload Info */}
            <div>
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-6">
                Upload Information
              </p>
              <div className="space-y-0">
                <div className="grid grid-cols-4 gap-4 py-5 border-b border-gray-100">
                  <div className="col-span-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">By</p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900 font-medium">{asset.uploadedBy}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 py-5">
                  <div className="col-span-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-900 font-medium">{asset.uploadDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-6">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Minimalist */}
          <div className="px-12 py-8 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              onClick={() => onDownload(asset.id)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-all duration-300 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Get
            </button>
            <button
              onClick={() => {
                onDelete(asset.id);
                onClose();
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAMAssetDetail;
