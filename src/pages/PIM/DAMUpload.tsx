import { FC, useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Plus,
  File,
  Trash2,
} from "lucide-react";
import { DigitalAsset } from "../../types/dam.types";
interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  metadata: {
    name: string;
    description: string;
    tags: string[];
    category: string;
  };
}

interface DAMUploadProps {
  onUpload?: (files: UploadFile[], collectionId?: number) => Promise<void>;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
}

const DAMUpload: FC<DAMUploadProps> = ({
  onUpload,
  acceptedFormats = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "application/pdf",
    "audio/mpeg",
    "application/zip",
  ],
  maxFileSize = 500, // 500MB
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const newFiles: UploadFile[] = Array.from(files)
      .filter(file => {
        if (!acceptedFormats.includes(file.type)) {
          alert(`File type ${file.type} not accepted`);
          return false;
        }
        if (file.size > maxFileSize * 1024 * 1024) {
          alert(`File ${file.name} exceeds max size of ${maxFileSize}MB`);
          return false;
        }
        return true;
      })
      .map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: "pending" as const,
        metadata: {
          name: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          tags: [],
          category: "",
        },
      }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileMetadata = (
    fileId: string,
    metadata: Partial<UploadFile["metadata"]>
  ) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileId ? { ...f, metadata: { ...f.metadata, ...metadata } } : f
      )
    );
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setIsUploading(true);

    // Simulate upload progress
    const uploadPromises = uploadedFiles.map(uploadFile => {
      return new Promise<void>(resolve => {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f
          )
        );

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Simulate success
            setTimeout(() => {
              setUploadedFiles(prev =>
                prev.map(f =>
                  f.id === uploadFile.id ? { ...f, status: "success" as const, progress: 100 } : f
                )
              );
              resolve();
            }, 500);
          } else {
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === uploadFile.id ? { ...f, progress: Math.min(progress, 99) } : f
              )
            );
          }
        }, 200);
      });
    });

    await Promise.all(uploadPromises);

    // Call upload callback
    if (onUpload) {
      await onUpload(uploadedFiles, selectedCollectionId);
    }

    setIsUploading(false);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type.startsWith("video/")) return "🎬";
    if (file.type.includes("pdf")) return "📄";
    if (file.type.startsWith("audio/")) return "🎵";
    if (file.type.includes("zip")) return "📦";
    return "📁";
  };

  const totalProgress =
    uploadedFiles.length > 0
      ? uploadedFiles.reduce((sum, f) => sum + f.progress, 0) / uploadedFiles.length
      : 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Upload Digital Assets</h2>
          <p className="text-blue-100">
            Add images, videos, documents, and audio files to your collection
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {uploadedFiles.length === 0 ? (
            // Drop Zone
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-neutral-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <Upload
                className={`h-12 w-12 mx-auto mb-4 ${
                  isDragging ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drag and drop files here
              </h3>
              <p className="text-gray-600 mb-4">or click to browse your computer</p>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4" />
                Select Files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: JPG, PNG, MP4, PDF, MP3, ZIP (Max {maxFileSize}MB)
              </p>
            </div>
          ) : (
            // File List
            <div className="space-y-3">
              {uploadedFiles.map(uploadFile => (
                <div
                  key={uploadFile.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* File Header */}
                  <div className="flex items-start gap-4 mb-3">
                    <span className="text-3xl">{getFileIcon(uploadFile.file)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {uploadFile.file.name}
                        </h4>
                        {uploadFile.status === "success" && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        {uploadFile.status === "error" && (
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        {uploadFile.status === "uploading" && (
                          <Loader className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {uploadFile.status !== "uploading" && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {(uploadFile.status === "uploading" || uploadFile.progress > 0) && (
                    <div className="mb-3">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{uploadFile.progress}%</p>
                    </div>
                  )}

                  {/* Metadata Inputs */}
                  {uploadFile.status === "pending" && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Asset Name
                        </label>
                        <input
                          type="text"
                          value={uploadFile.metadata.name}
                          onChange={e =>
                            updateFileMetadata(uploadFile.id, {
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Description
                        </label>
                        <textarea
                          value={uploadFile.metadata.description}
                          onChange={e =>
                            updateFileMetadata(uploadFile.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., product, hero, banner"
                          value={uploadFile.metadata.tags.join(", ")}
                          onChange={e =>
                            updateFileMetadata(uploadFile.id, {
                              tags: e.target.value
                                .split(",")
                                .map(t => t.trim())
                                .filter(t => t),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadFile.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-red-700 font-medium">{uploadFile.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add More Files Button */}
          {uploadedFiles.length > 0 && !isUploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add More Files
            </button>
          )}

          {/* Overall Progress */}
          {isUploading && uploadedFiles.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Uploading {uploadedFiles.filter(f => f.status === "success").length} of{" "}
                  {uploadedFiles.length} files
                </span>
                <span className="text-sm font-medium text-blue-600">{Math.round(totalProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {uploadedFiles.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} ready to upload
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUploadedFiles([])}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || uploadedFiles.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading && <Loader className="h-4 w-4 animate-spin" />}
                {isUploading ? "Uploading..." : "Upload All"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        accept={acceptedFormats.join(",")}
        className="hidden"
      />
    </div>
  );
};

export default DAMUpload;
