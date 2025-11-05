import { FC, useState, ChangeEvent } from "react";
import { UploadCloud, File, X } from "lucide-react";

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const DAMUpload: FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Upload Assets</h1>
        <p className="text-slate-600 text-sm">Add new assets to the library.</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative bg-white border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300"
          }`}
        >
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <UploadCloud className={`h-12 w-12 mb-4 ${isDragging ? "text-blue-600" : "text-slate-400"}`} />
            <span className="text-lg font-semibold text-slate-900">Drag & drop files here</span>
            <span className="text-slate-500 mt-1">or click to browse</span>
            <span className="text-xs text-slate-400 mt-4">Max file size: 100MB</span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Files to Upload ({files.length})</h2>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4 shadow-sm">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <File className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm">
              Start Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DAMUpload;
