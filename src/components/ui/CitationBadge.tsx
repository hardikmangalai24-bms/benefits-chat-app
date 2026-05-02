"use client";

interface CitationBadgeProps {
  sectionNumber: string;
  pageNumber: number;
  onClick?: () => void;
}

export default function CitationBadge({
  sectionNumber,
  pageNumber,
  onClick,
}: CitationBadgeProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: scroll to section if it exists
      const sectionElement = document.getElementById(
        `section-${sectionNumber}`
      );
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight effect
        sectionElement.classList.add("highlight-flash");
        setTimeout(() => {
          sectionElement.classList.remove("highlight-flash");
        }, 2000);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 bg-cyan-500/15 text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 cursor-pointer hover:bg-cyan-500/25 transition-colors"
      title={`View section ${sectionNumber} on page ${pageNumber}`}
    >
      <span>[{sectionNumber}</span>
      <span className="text-cyan-500/60">·</span>
      <span>p.{pageNumber}]</span>
    </button>
  );
}

// Made with Bob
