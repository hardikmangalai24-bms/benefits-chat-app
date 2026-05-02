"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "error" | "success" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    error: "from-red-500/20 to-red-600/20 border-red-500/50",
    success: "from-green-500/20 to-green-600/20 border-green-500/50",
    info: "from-cyan-500/20 to-purple-500/20 border-cyan-500/50",
  };

  const icons = {
    error: "❌",
    success: "✅",
    info: "ℹ️",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        fixed bottom-6 right-6 z-50
        max-w-md p-4 rounded-lg
        bg-gradient-to-r ${colors[type]}
        border backdrop-blur-xl
        shadow-2xl
        flex items-start gap-3
      `}
    >
      <span className="text-xl flex-shrink-0">{icons[type]}</span>
      <p className="text-sm text-white flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-white/60 hover:text-white transition-colors flex-shrink-0"
      >
        ✕
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </AnimatePresence>
  );
}

// Made with Bob
