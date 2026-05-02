"use client";

import { motion } from "framer-motion";
import LoadingDots from "@/components/ui/LoadingDots";

interface ProcessingStateProps {
  progress: number;
}

const getStatusText = (progress: number): string => {
  if (progress < 30) return "Reading your document...";
  if (progress < 60) return "Identifying sections...";
  if (progress < 90) return "Discovering benefits...";
  return "Almost ready...";
};

const getEstimatedTime = (progress: number): string => {
  const remaining = 100 - progress;
  const seconds = Math.ceil((remaining / 100) * 15); // Assume 15s total
  return `~${seconds}s remaining`;
};

export default function ProcessingState({ progress }: ProcessingStateProps) {
  const statusText = getStatusText(progress);
  const estimatedTime = getEstimatedTime(progress);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {/* Animated Spinner */}
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="352"
            initial={{ strokeDashoffset: 352 }}
            animate={{
              strokeDashoffset: 352 - (progress / 100) * 352,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={progress}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-gold bg-clip-text text-transparent"
          >
            {progress}%
          </motion.span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md space-y-3">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-gold"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Status text */}
        <div className="text-center space-y-2">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-white"
          >
            {statusText}
          </motion.p>
          <div className="flex items-center justify-center gap-2">
            <LoadingDots size="sm" />
            <span className="text-sm text-white/60">{estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex gap-3">
        {[30, 60, 90, 100].map((threshold, index) => (
          <motion.div
            key={threshold}
            initial={{ scale: 0 }}
            animate={{
              scale: progress >= threshold ? 1.2 : 1,
              backgroundColor:
                progress >= threshold
                  ? "rgb(0, 212, 255)"
                  : "rgba(255, 255, 255, 0.2)",
            }}
            transition={{ duration: 0.3 }}
            className="w-3 h-3 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

// Made with Bob
