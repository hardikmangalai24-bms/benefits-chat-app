"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExtractedBenefit, BenefitCategory } from "@/lib/types";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";

interface BenefitsPanelProps {
  benefits: ExtractedBenefit[];
}

const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  cashback: "Cashback",
  rewards: "Rewards",
  vouchers: "Vouchers",
  insurance: "Insurance",
  lounge_access: "Lounge",
  fuel_surcharge: "Fuel",
  milestone: "Milestone",
  dining: "Dining",
  travel: "Travel",
  shopping: "Shopping",
  other: "Other",
};

const CATEGORY_COLORS: Record<BenefitCategory, string> = {
  cashback: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  rewards: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  vouchers: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  insurance: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  lounge_access: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
  fuel_surcharge: "from-red-500/20 to-rose-500/20 border-red-500/30",
  milestone: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  dining: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  travel: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  shopping: "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30",
  other: "from-gray-500/20 to-slate-500/20 border-gray-500/30",
};

export default function BenefitsPanel({ benefits }: BenefitsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<BenefitCategory | "all">("all");
  const sendMessage = useChatStore((state) => state.sendMessage);
  const document = useDocumentStore((state) => state.document);

  // Get unique categories
  const categories = Array.from(new Set(benefits.map((b) => b.category)));

  // Filter benefits
  const filteredBenefits =
    selectedCategory === "all"
      ? benefits
      : benefits.filter((b) => b.category === selectedCategory);

  const handleBenefitClick = (benefit: ExtractedBenefit) => {
    if (document) {
      const question = `Tell me more about the ${benefit.title} benefit and all its conditions`;
      sendMessage(question, document.id);
    }
  };

  return (
    <div className="w-72 h-full glass-card border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Found Benefits</h2>
          <span className="px-2 py-1 text-xs font-medium bg-accent-cyan/20 text-accent-cyan rounded-full">
            {benefits.length}
          </span>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`
              px-3 py-1 text-xs rounded-full transition-all
              ${
                selectedCategory === "all"
                  ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }
            `}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 text-xs rounded-full transition-all
                ${
                  selectedCategory === category
                    ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }
              `}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Benefits list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredBenefits.map((benefit, index) => (
          <motion.button
            key={benefit.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => handleBenefitClick(benefit)}
            className={`
              w-full text-left p-3 rounded-lg
              bg-gradient-to-br ${CATEGORY_COLORS[benefit.category]}
              border backdrop-blur-sm
              hover:scale-[1.02] transition-all duration-200
              group
            `}
          >
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white group-hover:text-accent-cyan transition-colors">
                  {benefit.title}
                </h3>
                {benefit.confidence === "high" && (
                  <span className="text-xs text-green-400">✓</span>
                )}
              </div>
              <p className="text-xs font-bold text-accent-gold">
                {benefit.exactValue}
              </p>
              <p className="text-xs text-white/60 line-clamp-2">
                {benefit.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{benefit.sectionRef}</span>
                <span>•</span>
                <span>p.{benefit.pageNumber}</span>
              </div>
            </div>
          </motion.button>
        ))}

        {filteredBenefits.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm">
            No benefits in this category
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
