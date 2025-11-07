// components/DAM/DAMUpload_Design5.tsx - Modern Animated Premium
import { FC, useState, ChangeEvent } from "react";
import { Upload, File, X, CheckCircle2, Cloud } from "lucide-react";

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        status: "pending" as const,
        progress: 0,
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
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = () => {
    uploadedFiles.forEach((item, idx) => {
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
    });
  };

  const completeCount = uploadedFiles.filter(f => f.status === "complete").length;

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
      `}</style>

      {/* HEADER */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Cloud className="h-6 w-6 text-gray-900 animate-float" />
          <h1 className="text-3xl font-bold text-gray-900">Upload Assets</h1>
        </div>
        <p className="text-gray-600 text-sm ml-9">Fast, secure asset delivery</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* DROP ZONE - ANIMATED */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative bg-white border-2 rounded-3xl p-16 text-center transition-all duration-300 group overflow-hidden ${
            isDragging 
              ? "border-gray-900 bg-gray-100 shadow-lg" 
              : "border-gray-300 hover:border-gray-600"
          }`}
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-r from-gray-900 via-transparent to-gray-900 transition-opacity duration-500" />

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer relative flex flex-col items-center">
            <Upload className={`h-12 w-12 mb-4 transition-all duration-300 ${
              isDragging 
                ? "text-gray-900 scale-125 rotate-12" 
                : "text-gray-400 group-hover:text-gray-600 group-hover:scale-110"
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
                  className="group px-5 py-4 border border-gray-200 rounded-xl hover:shadow-sm transition-all duration-300 bg-white hover:bg-gray-50"
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s backwards`,
                  }}
                >
                  <style>{`
                    @keyframes slideIn {
                      from { opacity: 0; transform: translateX(-20px); }
                      to { opacity: 1; transform: translateX(0); }
                    }
                  `}</style>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 transition-all ${
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
                    {item.status === "pending" && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* PROGRESS */}
                  {item.status !== "pending" && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
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
              ))}
            </div>

            {uploadedFiles.every(f => f.status === "pending") && (
              <button
                onClick={startUpload}
                className="w-full mt-8 py-3 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Start Upload ({uploadedFiles.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DAMUpload;
