
import React, { FC, useState, useRef, useEffect } from "react";
import { X, Upload, Save, User, FileText, Image as ImageIcon, Video, Check, ChevronDown } from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";

interface DAMAssetEditPanelProps {
  asset: DigitalAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetId: number, updates: {
    name: string;
    uploadedBy: string;
    file?: File;
  }) => void;
}

const DAMAssetEditPanel: FC<DAMAssetEditPanelProps> = ({
  asset,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editName, setEditName] = useState("");
  const [editUploadedBy, setEditUploadedBy] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("details");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (asset && isOpen) {
      setEditName(asset.name);
      setEditUploadedBy(asset.uploadedBy);
      setNewFile(null);
      setPreviewUrl(null);
      setExpandedSection("details");
    }
  }, [asset, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (file: File) => {
    setNewFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      handleFileChange(file);
    }
  };

  const handleSave = () => {
    if (!asset) return;
    
    onSave(asset.id, {
      name: editName,
      uploadedBy: editUploadedBy,
      file: newFile || undefined,
    });
    
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setNewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Don't return null - always render for transitions to work!
  // if (!asset) return null;

  return (
    <>
      {/* Backdrop - Smooth & Slow Fade */}
      <div
        className="fixed inset-0 bg-black/40"
        style={{
          zIndex: 9998,
          opacity: isOpen && asset ? 1 : 0,
          pointerEvents: isOpen && asset ? "auto" : "none",
          transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={handleCancel}
      />

      {/* Side Panel - Buttery Smooth Slide */}
      <div
        className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl"
        style={{
          zIndex: 9999,
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.12)",
          transform: isOpen && asset ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Asset</h2>
              <p className="text-xs text-gray-500">Update asset details and content</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-all duration-150 active:scale-95"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="h-[calc(100vh-128px)] overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Current Asset Preview - Collapsible */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("preview")}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Current Asset
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
                    expandedSection === "preview" ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                style={{
                  maxHeight: expandedSection === "preview" ? "400px" : "0px",
                  opacity: expandedSection === "preview" ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div className="p-4 border-t border-gray-100">
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 aspect-video border border-gray-200">
                    {asset && asset.type === "image" ? (
                      <img
                        src={asset.url || asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : asset && asset.type === "video" ? (
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : asset ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-200 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">{asset.format}</p>
                        </div>
                      </div>
                    ) : null}
                    {asset && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                        <span className="text-xs font-semibold text-white">{asset.format}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Details - Collapsible */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("details")}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Asset Details
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
                    expandedSection === "details" ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                style={{
                  maxHeight: expandedSection === "details" ? "500px" : "0px",
                  opacity: expandedSection === "details" ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div className="p-4 border-t border-gray-100 space-y-4">
                  {/* Asset Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      Asset Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:bg-white transition-all duration-150"
                      placeholder="Enter asset name"
                    />
                  </div>

                  {/* Uploaded By */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <User className="h-4 w-4 text-orange-600" />
                      Uploaded By
                    </label>
                    <input
                      type="text"
                      value={editUploadedBy}
                      onChange={(e) => setEditUploadedBy(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:bg-white transition-all duration-150"
                      placeholder="Enter uploader name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Replace File - Collapsible */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection("upload")}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
              >
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Replace File
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
                    expandedSection === "upload" ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <div
                style={{
                  maxHeight: expandedSection === "upload" ? "800px" : "0px",
                  opacity: expandedSection === "upload" ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div className="p-4 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Upload className="h-4 w-4 text-orange-600" />
                      New File Upload
                    </label>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? "border-orange-500 bg-orange-50 scale-[1.02]"
                          : newFile
                          ? "border-green-400 bg-green-50"
                          : "border-gray-300 hover:border-orange-400 hover:bg-orange-50/30"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      
                      <div className="flex flex-col items-center gap-3">
                        {newFile ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                              <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-900 mb-1">{newFile.name}</p>
                              <p className="text-xs text-gray-600">
                                {(newFile.size / 1024 / 1024).toFixed(2)} MB • {newFile.type.split('/')[0].toUpperCase()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewFile(null);
                                if (previewUrl) {
                                  URL.revokeObjectURL(previewUrl);
                                  setPreviewUrl(null);
                                }
                              }}
                              className="text-xs font-medium text-red-600 hover:text-red-700 underline transition-colors duration-150"
                            >
                              Remove file
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                              <Upload className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                Drop file here or click
                              </p>
                              <p className="text-xs text-gray-500">
                                Images and videos only
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {previewUrl && newFile && (
                      <div 
                        className="mt-4 rounded-xl overflow-hidden border-2 border-green-200 shadow-sm"
                        style={{
                          animation: "fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {newFile.type.startsWith('image/') ? (
                          <img
                            src={previewUrl}
                            alt="New preview"
                            className="w-full aspect-video object-cover"
                          />
                        ) : newFile.type.startsWith('video/') ? (
                          <video
                            src={previewUrl}
                            className="w-full aspect-video object-cover"
                            controls
                          />
                        ) : null}
                        <div className="px-3 py-2 bg-green-50 border-t border-green-200">
                          <p className="text-xs font-semibold text-green-800">✓ Ready to upload</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs text-blue-800 leading-relaxed">
                <span className="font-semibold">Note:</span> Changes will be saved immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-16 px-6 flex items-center gap-3 border-t border-gray-200 bg-white">
          <button
            onClick={handleCancel}
            className="flex-1 h-11 px-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-11 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-semibold text-sm transition-all duration-150 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default DAMAssetEditPanel;
