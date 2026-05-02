"use client";

import { useState, useRef, DragEvent } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  onError: (message: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function DropZone({ onFileSelect, onUrlSubmit, onError }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"pdf" | "url">("pdf");
  const [url, setUrl] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };

  const handleUrlSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) { onError("Please enter a URL"); return; }
    try { new URL(trimmed); } catch { onError("Please enter a valid URL"); return; }
    setIsUrlLoading(true);
    onUrlSubmit(trimmed);
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
        <button
          onClick={() => setActiveTab("pdf")}
          className={`flex-1 py-2.5 px-4 text-[13px] font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === "pdf"
              ? "bg-brand-600/15 text-brand-300 border-b-2 border-brand-500"
              : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
          }`}
        >
          {/* Document icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Upload PDF
        </button>
        <button
          onClick={() => setActiveTab("url")}
          className={`flex-1 py-2.5 px-4 text-[13px] font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === "url"
              ? "bg-brand-600/15 text-brand-300 border-b-2 border-brand-500"
              : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
          }`}
        >
          {/* Link icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Paste URL
        </button>
      </div>

      {/* PDF Tab */}
      {activeTab === "pdf" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            min-h-[220px] border-2 border-dashed rounded-2xl p-8
            cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-5 text-center
            ${isDragOver
              ? "border-brand-500/50 bg-brand-500/[0.05] scale-[1.01]"
              : "border-white/[0.08] hover:border-brand-500/30 hover:bg-white/[0.02]"
            }
          `}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />

          {/* Upload icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isDragOver ? "bg-brand-500/15 scale-110" : "bg-white/[0.04]"}`}>
            <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div className="space-y-1.5">
            <p className="text-[15px] font-medium text-white/80">
              {isDragOver ? "Drop your file" : "Drop your PDF here"}
            </p>
            <p className="text-[12px] text-white/35">or click to browse · Max 50MB</p>
            {selectedFile && (
              <p className="text-[12px] text-brand-400 font-medium mt-1">
                ✓ {selectedFile.name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* URL Tab */}
      {activeTab === "url" && (
        <div className="min-h-[220px] rounded-2xl p-8 border border-white/[0.06] bg-white/[0.01] flex flex-col items-center justify-center gap-5">
          {/* Globe icon */}
          <div className="w-14 h-14 rounded-2xl bg-brand-600/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-[15px] font-medium text-white/80">Paste a webpage URL</p>
            <p className="text-[12px] text-white/35">We'll extract and analyze the content</p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
                placeholder="https://example.com/page"
                disabled={isUrlLoading}
                className={`glass-input w-full py-2.5 px-4 text-[13px] ${isUrlLoading ? "opacity-40" : ""}`}
              />
              {url && (
                <button onClick={() => setUrl("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={handleUrlSubmit}
              disabled={!url.trim() || isUrlLoading}
              className="w-full py-2.5 px-5 rounded-xl font-medium text-[13px] bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-brand-600/20"
            >
              {isUrlLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  {/* Arrow download icon */}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Fetch & Analyze
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
