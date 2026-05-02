"use client";

import { motion } from "framer-motion";
import { ExtractedBenefit } from "@/lib/types";
import GlassCard from "@/components/ui/GlassCard";
import CitationBadge from "@/components/ui/CitationBadge";

interface BenefitCardProps {
  benefit: ExtractedBenefit;
  isNew?: boolean;
}

const categoryColors = {
  cashback: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  travel: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  vouchers: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  insurance: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  lounge_access: {
    bg: "bg-rose-500/20",
    text: "text-rose-400",
    border: "border-rose-500/30",
  },
  rewards: {
    bg: "bg-indigo-500/20",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
  },
  fuel_surcharge: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  milestone: {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    border: "border-pink-500/30",
  },
  dining: {
    bg: "bg-teal-500/20",
    text: "text-teal-400",
    border: "border-teal-500/30",
  },
  shopping: {
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    border: "border-violet-500/30",
  },
  other: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
  },
};

const confidenceIndicators = {
  high: { icon: "●", color: "text-green-400", label: "High confidence" },
  medium: { icon: "◐", color: "text-yellow-400", label: "Medium confidence" },
  low: { icon: "○", color: "text-gray-400", label: "Low confidence" },
};

export default function BenefitCard({ benefit, isNew = false }: BenefitCardProps) {
  const colors = categoryColors[benefit.category] || categoryColors.other;
  const confidence = confidenceIndicators[benefit.confidence];

  const card = (
    <GlassCard variant="highlighted" className="p-4 space-y-3">
      {/* Top: Category badge + Confidence */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {benefit.category.replace(/_/g, " ")}
        </span>
        <span
          className={`text-xs ${confidence.color}`}
          title={confidence.label}
        >
          {confidence.icon}
        </span>
      </div>

      {/* Middle: Title + Value */}
      <div className="space-y-1">
        <h4 className="text-lg font-semibold text-white">{benefit.title}</h4>
        <p className="text-2xl font-bold text-accent-gold">
          {benefit.exactValue}
        </p>
        <p className="text-sm text-gray-300">{benefit.description}</p>
      </div>

      {/* Bottom: Conditions + Citation */}
      {benefit.conditions && benefit.conditions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-400">Conditions:</p>
          <ul className="space-y-1">
            {benefit.conditions.slice(0, 3).map((condition, index) => (
              <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-cyan-500 mt-0.5">•</span>
                <span>{condition}</span>
              </li>
            ))}
            {benefit.conditions.length > 3 && (
              <li className="text-sm text-gray-500 italic">
                +{benefit.conditions.length - 3} more conditions
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="pt-2 border-t border-white/10">
        <CitationBadge
          sectionNumber={benefit.sectionRef}
          pageNumber={benefit.pageNumber}
        />
      </div>
    </GlassCard>
  );

  if (isNew) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {card}
      </motion.div>
    );
  }

  return card;
}

// Made with Bob
