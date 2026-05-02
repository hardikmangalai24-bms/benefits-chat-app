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
  if (!questions || questions.length === 0) {
    return null;
  }

  // Show max 3 questions
  const displayQuestions = questions.slice(0, 3);

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {displayQuestions.map((question, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1, // Stagger: 100ms between each
            ease: "easeOut",
          }}
          onClick={() => !disabled && onSelect(question)}
          disabled={disabled}
          className={`
            glass-button text-sm px-4 py-2
            bg-gradient-to-r from-cyan-500/10 to-purple-500/10
            border border-cyan-500/20
            hover:from-cyan-500/20 hover:to-purple-500/20
            hover:border-cyan-500/40
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300
          `}
        >
          {question}
        </motion.button>
      ))}
    </div>
  );
}

// Made with Bob
