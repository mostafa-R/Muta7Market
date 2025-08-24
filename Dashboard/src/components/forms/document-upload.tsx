"use client";

import { cn } from "@/lib/utils";
import { FileText, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface DocumentUploadProps {
  onDocumentSelected: (file: File) => void;
  className?: string;
}

const DocumentUpload = ({
  onDocumentSelected,
  className,
}: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        onDocumentSelected(selectedFile);
      }
    },
    [onDocumentSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const clearFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
    onDocumentSelected(new File([], "")); // Send empty file to clear
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
        isDragActive
          ? "border-primary"
          : "border-gray-300 dark:border-gray-700",
        className
      )}
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium truncate max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Drop your document here, or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            PDF, DOC, DOCX up to 10MB
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
