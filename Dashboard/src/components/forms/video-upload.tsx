"use client";

import { cn } from "@/lib/utils";
import { FileVideo, Video, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface VideoUploadProps {
  onVideoSelected: (file: File) => void;
  className?: string;
}

const VideoUpload = ({ onVideoSelected, className }: VideoUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        
        // Create video preview URL if possible
        try {
          const url = URL.createObjectURL(selectedFile);
          setPreview(url);
        } catch (error) {
          console.error("Could not create preview URL", error);
        }
        
        onVideoSelected(selectedFile);
      }
    },
    [onVideoSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
  });

  const clearFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    onVideoSelected(new File([], "")); // Send empty file to clear
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
        <div className="space-y-2">
          {preview && (
            <div className="relative w-full">
              <video
                src={preview}
                controls
                className="w-full h-auto rounded-md"
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="flex items-center space-x-2">
              <FileVideo className="h-8 w-8 text-primary" />
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <Video className="h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Drop your video here, or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            MP4, MOV, AVI, WEBM up to 100MB
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
