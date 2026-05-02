"use client";

interface LoadingDotsProps {
  size?: "sm" | "md";
  color?: string;
}

export default function LoadingDots({
  size = "md",
  color = "bg-brand-400",
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className={`${sizeClasses[size]} ${color} rounded-full animate-pulse`}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={`${sizeClasses[size]} ${color} rounded-full animate-pulse`}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={`${sizeClasses[size]} ${color} rounded-full animate-pulse`}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

// Made with Bob
