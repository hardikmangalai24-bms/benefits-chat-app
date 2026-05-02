"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`shimmer rounded-lg bg-white/5 ${className}`}
      style={{ minHeight: "1rem" }}
    />
  );
}

export function BenefitSkeleton() {
  return (
    <div className="glass-card p-3 rounded-lg space-y-2">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        
        {/* Message content */}
        <div className="glass-card p-4 rounded-2xl space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}

export function ChatLoadingSkeleton() {
  return (
    <div className="h-full flex">
      {/* Sidebar skeleton */}
      <div className="w-72 glass-card border-r border-white/10 p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-18 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <BenefitSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Chat area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 px-6 py-6 space-y-6">
          <MessageSkeleton />
          <MessageSkeleton isUser />
        </div>
        <div className="border-t border-white/10 p-6">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// Made with Bob
