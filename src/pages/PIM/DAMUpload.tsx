// components/DAM/DAMUpload_Design5.tsx - Modern Animated Premium with Metadata
import { FC, useState, ChangeEvent } from "react";
import { Upload, File, X, CheckCircle2, Cloud, ChevronDown } from "lucide-react";

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
  title: string;
  description: string;
  tags: string[];
  uploadedBy: string;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const DAMUpload: FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        status: "pending" as const,
        progress: 0,
        title: file.name.split('.')[0],
        description: "",
        tags: [],
        uploadedBy: "",
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        file,
        status: "pending" as const,
        progress: 0,
        title: file.name.split('.')[0],
        description: "",
        tags: [],
        uploadedBy: "",
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const updateFileMetadata = (index: number, field: string, value: any) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTag = (index: number, tag: string) => {
    if (tag.trim() && !uploadedFiles[index].tags.includes(tag.trim())) {
      updateFileMetadata(index, "tags", [...uploadedFiles[index].tags, tag.trim()]);
    }
  };

  const removeTag = (index: number, tagToRemove: string) => {
    updateFileMetadata(
      index,
      "tags",
      uploadedFiles[index].tags.filter(t => t !== tagToRemove)
    );
  };

  const startUpload = () => {
    uploadedFiles.forEach((item, idx) => {
      if (item.status === "pending") {
        setTimeout(() => {
          setUploadedFiles(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], status: "uploading", progress: 0 };
            return updated;
          });

          let p = 0;
          const interval = setInterval(() => {
            p += Math.random() * 25;
            if (p >= 100) {
              clearInterval(interval);
              setUploadedFiles(prev => {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], status: "complete", progress: 100 };
                return updated;
              });
            } else {
              setUploadedFiles(prev => {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], progress: Math.min(p, 99) };
                return updated;
              });
            }
          }, 200);
        }, idx * 150);
      }
    });
  };

  const completeCount = uploadedFiles.filter(f => f.status === "complete").length;
  const canStartUpload = uploadedFiles.some(f => f.status === "pending");

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-50 to-white p-10">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes expandDown {
          from { opacity: 0; max-height: 0; transform: translateY(-10px); }
          to { opacity: 1; max-height: 500px; transform: translateY(0); }
        }
      `}</style>

      {/* HEADER */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Cloud className="h-6 w-6 text-gray-900 animate-float" />
          <h1 className="text-3xl font-light text-gray-900">Upload Assets</h1>
        </div>
        <p className="text-gray-600 text-sm ml-9">Fast, secure asset delivery</p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* DROP ZONE - ANIMATED */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative bg-white border-2 rounded-3xl p-16 text-center transition-all duration-150 group overflow-hidden ${
            isDragging 
              ? "border-gray-900 bg-gray-100 shadow-lg" 
              : "border-gray-300 hover:border-gray-600"
          }`}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-r from-orange-900 via-orange-600 to-orange-900 transition-opacity duration-300" />

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer relative flex flex-col items-center">
            <Upload className={`h-12 w-12 mb-4 transition-all duration-150 ${
              isDragging 
                ? "text-gray-900 scale-125 rotate-12" 
                : "text-gray-400 group-hover:text-orange-600 group-hover:scale-110"
            }`} />
            <span className="text-lg font-semibold text-gray-900">Drag files here</span>
            <span className="text-sm text-gray-600 mt-1">or click to select</span>
            <span className="text-xs text-gray-400 mt-4">Max 100MB • Secure upload</span>
          </label>
        </div>

        {/* FILES LIST - STAGGERED */}
        {uploadedFiles.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
                {completeCount > 0 && <span className="text-green-600 ml-2">({completeCount} done)</span>}
              </h2>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((item, index) => (
                <div
                  key={index}
                  className="transition-all duration-200"
                  style={{
                    animation: `slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s backwards`,
                  }}
                >
                  {/* FILE ITEM */}
                  <div
                    onClick={() => item.status === "pending" && setExpandedIndex(expandedIndex === index ? null : index)}
                    className={`group px-5 py-4 border border-gray-200 rounded-t-xl transition-all duration-150 bg-white hover:bg-gray-50 cursor-pointer ${
                      expandedIndex === index && item.status === "pending" ? "border-gray-400" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 transition-all duration-150 ${
                        item.status === "complete" 
                          ? "bg-green-100" 
                          : item.status === "uploading"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}>
                        {item.status === "complete" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <File className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatBytes(item.file.size)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "pending" && (
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            expandedIndex === index ? "rotate-180" : ""
                          }`} />
                        )}
                        {item.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    {item.status !== "pending" && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-100 ${
                              item.status === "complete" 
                                ? "bg-green-600" 
                                : "bg-blue-600"
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{item.progress}%</span>
                      </div>
                    )}
                  </div>

                  {/* METADATA FORM - SMOOTH EXPAND */}
                  {expandedIndex === index && item.status === "pending" && (
                    <div
                      className="border border-t-0 border-gray-200 rounded-b-xl bg-gray-50/50 backdrop-blur-sm overflow-hidden"
                      style={{
                        animation: "expandDown 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                      }}
                    >
                      <div className="p-5 space-y-4">
                        {/* TITLE */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            Title
                          </label>
                          <input
                            type="text"
                            placeholder="Enter asset title"
                            value={item.title}
                            onChange={(e) => updateFileMetadata(index, "title", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all duration-150 bg-white"
                          />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            Description
                          </label>
                          <textarea
                            placeholder="Enter asset description"
                            value={item.description}
                            onChange={(e) => updateFileMetadata(index, "description", e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all duration-150 bg-white resize-none"
                          />
                        </div>

                        {/* UPLOADED BY */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            Uploaded By
                          </label>
                          <input
                            type="text"
                            placeholder="Your name or team"
                            value={item.uploadedBy}
                            onChange={(e) => updateFileMetadata(index, "uploadedBy", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all duration-150 bg-white"
                          />
                        </div>

                        {/* TAGS */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            Tags / Keywords
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Add tags (press Enter)"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addTag(index, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all duration-150 bg-white"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, tagIdx) => (
                              <span
                                key={tagIdx}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium transition-all duration-150 hover:bg-blue-200"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(index, tag)}
                                  className="hover:text-blue-900 transition-colors duration-150"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {canStartUpload && (
              <button
                onClick={startUpload}
                className="w-full mt-8 py-3 px-6 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all duration-150 shadow-sm hover:shadow-md active:scale-95"
              >
                Start Upload ({uploadedFiles.filter(f => f.status === "pending").length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DAMUpload;
