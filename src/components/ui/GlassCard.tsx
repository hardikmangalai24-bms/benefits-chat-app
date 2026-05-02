import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "highlighted";
  onClick?: () => void;
  as?: "div" | "article" | "section";
}

export default function GlassCard({
  children,
  className,
  variant = "default",
  onClick,
  as: Component = "div",
}: GlassCardProps) {
  const variantStyles = {
    default:
      "bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl",
    elevated:
      "bg-white/8 border border-white/15 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/50",
    highlighted:
      "bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 backdrop-blur-xl rounded-2xl",
  };

  return (
    <Component
      className={cn(
        variantStyles[variant],
        "hover:bg-white/8 hover:border-white/20 transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

// Made with Bob
