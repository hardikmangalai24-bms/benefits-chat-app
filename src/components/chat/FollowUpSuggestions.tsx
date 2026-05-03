"use client";

import { motion } from "framer-motion";

interface FollowUpSuggestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function FollowUpSuggestions({
  questions,
  onSelect,
  disabled = false,
}: FollowUpSuggestionsProps) {
  if (!questions || questions.length === 0) return null;

  const display = questions.slice(0, 3);

  return (
    <div className="flex flex-wrap gap-1.5">
      {display.map((q, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.08 }}
          onClick={() => !disabled && onSelect(q)}
          disabled={disabled}
          className="text-[12px] px-3 py-1.5 rounded-lg text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/80 bg-black/5 dark:bg-white/[0.03] hover:bg-black/10 dark:hover:bg-white/[0.06] border border-black/5 dark:border-white/[0.05] hover:border-black/10 dark:hover:border-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          {q}
        </motion.button>
      ))}
    </div>
  );
}
