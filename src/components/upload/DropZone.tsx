"use client";

import { useState, useRef, DragEvent } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onError: (message: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function DropZone({ onFileSelect, onError }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (file.type !== "application/pdf") {
      onError("Please upload a PDF file");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError(`File size exceeds 50MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        min-h-64 border-2 border-dashed rounded-xl p-8
        cursor-pointer transition-all duration-300
        ${
          isDragOver
            ? "border-accent-cyan bg-accent-cyan/10 scale-[1.02]"
            : "border-white/20 hover:border-accent-cyan/50 hover:bg-white/5"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-6 text-center">
        {/* Icon */}
        <div
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300
            ${
              isDragOver
                ? "bg-accent-cyan/20 scale-110 animate-bounce"
                : "bg-white/5"
            }
          `}
        >
          <svg
            className="w-10 h-10 text-accent-cyan"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-xl font-semibold text-white">
            {isDragOver ? "Drop your PDF here" : "Drop your PDF here"}
          </p>
          <p className="text-sm text-white/60">or click to browse</p>
          {selectedFile && (
            <p className="text-sm text-accent-cyan font-medium">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
        </div>

        {/* Supported formats */}
        <div className="text-xs text-white/40 space-y-1">
          <p>Supports: T&C, Insurance, Employee handbooks</p>
          <p>Max file size: 50MB</p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
