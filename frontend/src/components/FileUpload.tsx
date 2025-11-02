import React, { useRef, useState } from "react";
import { Upload, X, FileText, Plus } from "lucide-react";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const pdfFiles = filesArray.filter(
        (file) => file.type === "application/pdf"
      );

      // Add to existing files instead of replacing
      setSelectedFiles((prev) => {
        const newFiles = pdfFiles.filter(
          (newFile) =>
            !prev.some(
              (existingFile) =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size
            )
        );
        return [...prev, ...newFiles];
      });
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      const pdfFiles = filesArray.filter(
        (file) => file.type === "application/pdf"
      );

      // Add to existing files instead of replacing
      setSelectedFiles((prev) => {
        const newFiles = pdfFiles.filter(
          (newFile) =>
            !prev.some(
              (existingFile) =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size
            )
        );
        return [...prev, ...newFiles];
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAll = () => {
    setSelectedFiles([]);
  };

  const handleUploadClick = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      // setSelectedFiles([]); // Clear after upload
    }
  };

  const handleAddMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent">
          Upload Document
        </h2>
        <div className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
            PDF/DOCX Only
          </span>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 smooth-transition
          ${
            isDragging
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-105"
              : "border-gray-300 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600"
          }
          ${
            selectedFiles.length > 0
              ? "bg-green-50/50 dark:bg-green-900/10"
              : ""
          }
        `}
      >
        <div className="relative z-10">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {isDragging ? "Drop files here" : "Drag & drop PDF files"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            or click to browse • Supports multiple files
          </p>
          {selectedFiles.length > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          )}
        </div>

        {/* Hidden file input with multiple attribute */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3 animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                Selected Files
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">
                {selectedFiles.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddMoreClick}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add More
              </button>
              <button
                onClick={handleRemoveAll}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 
                          bg-gradient-to-r from-gray-50 to-gray-100 
                          dark:from-dark-800 dark:to-dark-800/50
                          rounded-xl border border-gray-200 dark:border-dark-700
                          hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="flex-shrink-0 ml-2 p-2 rounded-lg
                           text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                           transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Total size display */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Size
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {(
                selectedFiles.reduce((acc, file) => acc + file.size, 0) /
                1024 /
                1024
              ).toFixed(2)}{" "}
              MB
            </span>
          </div>

          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="btn-primary w-full relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Processing {selectedFiles.length} file
                  {selectedFiles.length > 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload {selectedFiles.length} Document
                  {selectedFiles.length > 1 ? "s" : ""}
                </>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
