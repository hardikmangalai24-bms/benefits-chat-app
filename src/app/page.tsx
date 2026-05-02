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
  const { uploadDocument, document } = useDocumentStore();

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleError = (message: string) => {
    showToast(message, "error");
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      await uploadDocument(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success and navigate
      showToast("Document processed successfully!", "success");
      
      setTimeout(() => {
        router.push("/chat");
      }, 1000);
    } catch (error: any) {
      console.error("Error processing document:", error);
      showToast(
        error.message || "Failed to process document. Please try again.",
        "error"
      );
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleExampleClick = (name: string) => {
    showToast("Upload your own PDF to get started", "info");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 -z-10 bg-dark-900">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
            `,
            backgroundSize: "200% 200%",
            animation: "meshGradient 15s ease infinite",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-gold bg-clip-text text-transparent">
              BenefitLens
            </h1>
            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Upload any policy document and discover your exact benefits in seconds
            </p>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Processed locally</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span>AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="glass-card p-8 rounded-xl">
            {isProcessing ? (
              <ProcessingState progress={uploadProgress} />
            ) : (
              <DropZone onFileSelect={handleFileUpload} onError={handleError} />
            )}
          </div>

          {/* Example Documents Section */}
          {!isProcessing && (
            <div className="space-y-4">
              <p className="text-center text-sm text-white/50">
                Example documents that work:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { emoji: "💳", name: "Credit Card T&C" },
                  { emoji: "🏥", name: "Health Insurance Policy" },
                  { emoji: "📋", name: "Employee Benefits Handbook" },
                ].map((example) => (
                  <button
                    key={example.name}
                    onClick={() => handleExampleClick(example.name)}
                    className="glass-card p-4 text-center hover:glass-hover transition-all duration-300 group"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {example.emoji}
                    </div>
                    <h3 className="font-medium text-sm text-white/80 mb-1">
                      {example.name}
                    </h3>
                    <p className="text-xs text-accent-cyan">Try with a sample →</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes meshGradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

// Made with Bob
