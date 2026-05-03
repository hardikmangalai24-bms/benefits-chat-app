"use client";

import { motion } from "framer-motion";
import LoadingDots from "@/components/ui/LoadingDots";

interface ProcessingStateProps {
  progress: number;
}

const getStatusText = (progress: number): string => {
  if (progress < 25) return "Reading document...";
  if (progress < 50) return "Extracting content...";
  if (progress < 80) return "Analyzing sections...";
  if (progress < 100) return "Almost ready...";
  return "Done!";
};

export default function ProcessingState({ progress }: ProcessingStateProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {/* Spinner */}
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="42" className="stroke-gray-200 dark:stroke-white/5" strokeWidth="6" fill="none" />
          <motion.circle
            cx="48" cy="48" r="42"
            stroke="url(#progressGrad)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="264"
            initial={{ strokeDashoffset: 264 }}
            animate={{ strokeDashoffset: 264 - (progress / 100) * 264 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800 dark:text-white/80">{progress}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm space-y-3">
        <div className="h-1.5 bg-gray-200 dark:bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-[14px] font-medium text-gray-600 dark:text-white/70">{getStatusText(progress)}</p>
          <div className="flex items-center justify-center gap-2">
            <LoadingDots size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
