"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DropZone from "@/components/upload/DropZone";
import ProcessingState from "@/components/upload/ProcessingState";
import { ToastContainer, ToastType } from "@/components/ui/Toast";
import { useDocumentStore } from "@/store/documentStore";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { uploadDocument, uploadFromUrl } = useDocumentStore();

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 3));
    }, 600);

    try {
      await uploadDocument(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      showToast("Document processed successfully!", "success");
      const doc = useDocumentStore.getState().document;
      if (doc) {
        setTimeout(() => router.push("/chat"), 600);
      } else {
        throw new Error("Processing completed but no document returned.");
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      showToast(error.message || "Failed to process document.", "error");
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleUrlUpload = async (url: string) => {
    setIsProcessing(true);
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 3));
    }, 600);

    try {
      await uploadFromUrl(url);
      clearInterval(progressInterval);
      setUploadProgress(100);
      showToast("Content analyzed successfully!", "success");
      const doc = useDocumentStore.getState().document;
      if (doc) {
        setTimeout(() => router.push("/chat"), 600);
      } else {
        throw new Error("Processing completed but no document returned.");
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      showToast(error.message || "Failed to process URL.", "error");
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark-900">
      {/* Subtle gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-400/[0.05] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-xl w-full space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Benefit<span className="gradient-text">Lens</span>
              </h1>
            </div>
            <p className="text-[15px] text-white/50 max-w-md mx-auto leading-relaxed">
              Upload a document or paste a URL — ask questions, get precise answers instantly.
            </p>
          </div>

          {/* Upload Card */}
          <div className="glass-card-elevated p-6 sm:p-8">
            {isProcessing ? (
              <ProcessingState progress={uploadProgress} />
            ) : (
              <DropZone
                onFileSelect={handleFileUpload}
                onUrlSubmit={handleUrlUpload}
                onError={(msg) => showToast(msg, "error")}
              />
            )}
          </div>

          {/* Features */}
          {!isProcessing && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "⚡", label: "Instant Analysis" },
                { icon: "🔒", label: "Private & Secure" },
                { icon: "💬", label: "AI Chat" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="glass-card px-3 py-4 text-center"
                >
                  <div className="text-xl mb-1.5">{f.icon}</div>
                  <p className="text-xs text-white/40 font-medium">{f.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
