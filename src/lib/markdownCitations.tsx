import React from "react";
import CitationBadge from "@/components/ui/CitationBadge";

/**
 * Parse markdown text with inline [CITE:...] patterns and render with CitationBadge components
 * Pattern: [CITE:sectionId:sectionNumber:pageNumber]
 * 
 * @param text - Markdown text with citation patterns
 * @returns Array of React nodes (text + CitationBadge components)
 */
export function renderMarkdownWithCitations(text: string): React.ReactNode[] {
  // Regex to match citation pattern: [CITE:sectionId:sectionNumber:pageNumber]
  const citationRegex = /\[CITE:([^:]+):([^:]+):(\d+)\]/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = citationRegex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      parts.push(textBefore);
    }

    // Add the citation badge
    const sectionNumber = match[2];
    const pageNumber = parseInt(match[3], 10);
    
    parts.push(
      <CitationBadge
        key={`cite-${keyCounter++}`}
        sectionNumber={sectionNumber}
        pageNumber={pageNumber}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last citation
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no citations found, return the original text
  if (parts.length === 0) {
    return [text];
  }

  return parts;
}

/**
 * Strip citation tags from text (for plain text display)
 */
export function stripCitationTags(text: string): string {
  return text.replace(/\[CITE:[^\]]+\]/g, "");
}

/**
 * Extract all citations from text
 */
export function extractCitations(text: string): Array<{
  sectionId: string;
  sectionNumber: string;
  pageNumber: number;
}> {
  const citationRegex = /\[CITE:([^:]+):([^:]+):(\d+)\]/g;
  const citations: Array<{
    sectionId: string;
    sectionNumber: string;
    pageNumber: number;
  }> = [];
  
  let match: RegExpExecArray | null;
  
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push({
      sectionId: match[1],
      sectionNumber: match[2],
      pageNumber: parseInt(match[3], 10),
    });
  }
  
  return citations;
}

// Made with Bob
