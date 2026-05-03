"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import DropZone from "@/components/upload/DropZone";
import ProcessingState from "@/components/upload/ProcessingState";
import { ToastContainer, ToastType } from "@/components/ui/Toast";
import { useDocumentStore } from "@/store/documentStore";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/ui/Logo";

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
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Top Navigation */}
      <div className="absolute top-0 right-0 p-4 sm:p-6 z-50">
        <ThemeToggle />
      </div>

      {/* Subtle gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-600/[0.04] dark:bg-brand-600/[0.07] blur-[120px] transition-all duration-500" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-400/[0.03] dark:bg-brand-400/[0.05] blur-[100px] transition-all duration-500" />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-xl w-full space-y-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-4"
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <Logo className="w-12 h-12" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Benefit<span className="gradient-text">Lens</span>
              </h1>
            </div>
            <p className="text-[15px] text-gray-600 dark:text-white/50 max-w-md mx-auto leading-relaxed">
              Upload a document or paste a URL — ask questions, get precise answers instantly.
            </p>
          </motion.div>

          {/* Upload Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="glass-card-elevated p-6 sm:p-8"
          >
            {isProcessing ? (
              <ProcessingState progress={uploadProgress} />
            ) : (
              <DropZone
                onFileSelect={handleFileUpload}
                onUrlSubmit={handleUrlUpload}
                onError={(msg) => showToast(msg, "error")}
              />
            )}
          </motion.div>

          {/* Features */}
          {!isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { icon: "⚡", label: "Instant Analysis" },
                { icon: "🔒", label: "Private & Secure" },
                { icon: "💬", label: "AI Chat" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="glass-card px-3 py-4 text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-xl mb-1.5">{f.icon}</div>
                  <p className="text-xs text-gray-500 dark:text-white/40 font-medium">{f.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
