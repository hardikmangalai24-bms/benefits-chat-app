import pdf from "pdf-parse";
import { DocumentSection, ProcessedDocument } from "./types";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MIN_SECTION_LENGTH = 50;
const MAX_SECTION_LENGTH = 2000;

/**
 * Extract text from PDF buffer with page tracking
 */
export async function extractTextFromBuffer(
  buffer: Buffer
): Promise<{ text: string; pageCount: number; pageTexts: string[] }> {
  try {
    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(
        `PDF file size (${(buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 50MB`
      );
    }

    console.log("Extracting text from PDF...");

    const data = await pdf(buffer, {
      // Extract text page by page
      pagerender: async (pageData) => {
        const textContent = await pageData.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        return pageText;
      },
    });

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF appears to be empty or contains no extractable text");
    }

    // Extract individual page texts
    const pageTexts: string[] = [];
    
    // Extract text from each page sequentially
    for (let i = 1; i <= data.numpages; i++) {
      const pageData = await pdf(buffer, {
        max: 1,
        pagerender: async (pageData) => {
          const textContent = await pageData.getTextContent();
          return textContent.items.map((item: any) => item.str).join(" ");
        },
      });
      pageTexts.push(pageData.text);
    }

    // Clean the text - remove binary artifacts but preserve formatting
    const cleanedText = data.text
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
      .replace(/�/g, "") // Remove replacement characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    console.log(
      `Extracted ${cleanedText.length} characters from ${data.numpages} pages`
    );

    return {
      text: cleanedText,
      pageCount: data.numpages,
      pageTexts: pageTexts.map((text) =>
        text
          .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "")
          .replace(/�/g, "")
          .replace(/\s+/g, " ")
          .trim()
      ),
    };
  } catch (error: any) {
    if (error.message?.includes("password")) {
      throw new Error("PDF is password-protected and cannot be processed");
    }
    if (error.message?.includes("Invalid PDF")) {
      throw new Error("File is not a valid PDF document");
    }
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Split raw text into structured sections
 */
export function splitIntoSections(
  rawText: string,
  pageTexts: string[]
): DocumentSection[] {
  console.log("Splitting document into sections...");

  const sections: DocumentSection[] = [];
  const lines = rawText.split(/\n+/);

  // Section detection patterns (in order of precedence)
  const patterns = {
    numbered: /^(\d+\.(?:\d+\.)*\d*)\s+(.+)$/i, // 1., 1.1, 1.1.1
    namedSection: /^(Section|Clause|Article)\s+(\d+[a-z]?)[:\s]+(.+)$/i,
    lettered: /^(\([a-z]\)|[A-Z]\.)\s+(.+)$/i, // (a), A.
    schedule: /^(Schedule\s+[A-Z\d]+)[:\s]+(.+)$/i,
    allCaps: /^([A-Z\s]{3,}):?\s*$/,
    colonHeading: /^(.{3,50}):\s*$/,
  };

  let currentSection: {
    sectionNumber: string;
    title: string;
    content: string[];
    startLine: number;
  } | null = null;

  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // Try to match section patterns
    let matched = false;

    // Pattern 1: Numbered sections
    const numberedMatch = trimmedLine.match(patterns.numbered);
    if (numberedMatch && numberedMatch[1].length <= 10) {
      if (currentSection) {
        sections.push(finalizeSection(currentSection, pageTexts));
      }
      currentSection = {
        sectionNumber: numberedMatch[1],
        title: numberedMatch[2].trim(),
        content: [],
        startLine: lineNumber,
      };
      matched = true;
    }

    // Pattern 2: Named sections (Section 1, Clause 2, etc.)
    if (!matched) {
      const namedMatch = trimmedLine.match(patterns.namedSection);
      if (namedMatch) {
        if (currentSection) {
          sections.push(finalizeSection(currentSection, pageTexts));
        }
        currentSection = {
          sectionNumber: `§${namedMatch[2]}`,
          title: namedMatch[3].trim(),
          content: [],
          startLine: lineNumber,
        };
        matched = true;
      }
    }

    // Pattern 3: Schedule sections
    if (!matched) {
      const scheduleMatch = trimmedLine.match(patterns.schedule);
      if (scheduleMatch) {
        if (currentSection) {
          sections.push(finalizeSection(currentSection, pageTexts));
        }
        currentSection = {
          sectionNumber: scheduleMatch[1],
          title: scheduleMatch[2].trim(),
          content: [],
          startLine: lineNumber,
        };
        matched = true;
      }
    }

    // Pattern 4: ALL CAPS headings
    if (!matched && trimmedLine.length >= 3 && trimmedLine.length <= 100) {
      const capsMatch = trimmedLine.match(patterns.allCaps);
      if (capsMatch) {
        if (currentSection) {
          sections.push(finalizeSection(currentSection, pageTexts));
        }
        currentSection = {
          sectionNumber: `§${sections.length + 1}`,
          title: capsMatch[1].trim(),
          content: [],
          startLine: lineNumber,
        };
        matched = true;
      }
    }

    // Pattern 5: Colon headings
    if (!matched && trimmedLine.length >= 3 && trimmedLine.length <= 100) {
      const colonMatch = trimmedLine.match(patterns.colonHeading);
      if (colonMatch) {
        if (currentSection) {
          sections.push(finalizeSection(currentSection, pageTexts));
        }
        currentSection = {
          sectionNumber: `§${sections.length + 1}`,
          title: colonMatch[1].trim(),
          content: [],
          startLine: lineNumber,
        };
        matched = true;
      }
    }

    // If not a section header, add to current section content
    if (!matched && currentSection) {
      currentSection.content.push(trimmedLine);
    } else if (!matched && !currentSection) {
      // Create initial section for content before first header
      if (sections.length === 0) {
        currentSection = {
          sectionNumber: "§0",
          title: "Introduction",
          content: [trimmedLine],
          startLine: lineNumber,
        };
      }
    }
  }

  // Finalize last section
  if (currentSection) {
    sections.push(finalizeSection(currentSection, pageTexts));
  }

  // Merge tiny sections and split large ones
  const processedSections = postProcessSections(sections, pageTexts);

  console.log(`Created ${processedSections.length} sections`);

  return processedSections;
}

/**
 * Finalize a section by joining content and determining page number
 */
function finalizeSection(
  section: {
    sectionNumber: string;
    title: string;
    content: string[];
    startLine: number;
  },
  pageTexts: string[]
): DocumentSection {
  const content = section.content.join(" ").trim();

  // Determine page number by finding which page contains this content
  let pageNumber = 1;
  const contentPreview = content.substring(0, 100);

  for (let i = 0; i < pageTexts.length; i++) {
    if (pageTexts[i].includes(contentPreview)) {
      pageNumber = i + 1;
      break;
    }
  }

  return {
    id: randomUUID(),
    sectionNumber: section.sectionNumber,
    title: section.title,
    content,
    pageNumber,
  };
}

/**
 * Post-process sections: merge tiny ones, split large ones
 */
function postProcessSections(
  sections: DocumentSection[],
  pageTexts: string[]
): DocumentSection[] {
  const processed: DocumentSection[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    // Merge tiny sections with previous
    if (section.content.length < MIN_SECTION_LENGTH && processed.length > 0) {
      const prev = processed[processed.length - 1];
      prev.content += " " + section.content;
      continue;
    }

    // Split large sections at paragraph breaks
    if (section.content.length > MAX_SECTION_LENGTH) {
      const parts = splitLargeSection(section);
      processed.push(...parts);
    } else {
      processed.push(section);
    }
  }

  return processed;
}

/**
 * Split a large section at natural paragraph breaks
 */
function splitLargeSection(section: DocumentSection): DocumentSection[] {
  const parts: DocumentSection[] = [];
  const paragraphs = section.content.split(/\.\s+/);

  let currentPart = "";
  let partIndex = 0;

  for (const para of paragraphs) {
    if (currentPart.length + para.length > MAX_SECTION_LENGTH && currentPart) {
      parts.push({
        id: randomUUID(),
        sectionNumber: `${section.sectionNumber}.${partIndex + 1}`,
        title: `${section.title} (Part ${partIndex + 1})`,
        content: currentPart.trim(),
        pageNumber: section.pageNumber,
      });
      currentPart = para;
      partIndex++;
    } else {
      currentPart += para + ". ";
    }
  }

  // Add remaining content
  if (currentPart.trim()) {
    parts.push({
      id: randomUUID(),
      sectionNumber:
        partIndex > 0
          ? `${section.sectionNumber}.${partIndex + 1}`
          : section.sectionNumber,
      title:
        partIndex > 0
          ? `${section.title} (Part ${partIndex + 1})`
          : section.title,
      content: currentPart.trim(),
      pageNumber: section.pageNumber,
    });
  }

  return parts.length > 0 ? parts : [section];
}

/**
 * Build section index for O(1) lookup
 */
export function buildSectionIndex(
  sections: DocumentSection[]
): Map<string, DocumentSection> {
  console.log("Building section index...");

  const index = new Map<string, DocumentSection>();

  for (const section of sections) {
    // Index by ID
    index.set(section.id, section);

    // Index by section number
    index.set(section.sectionNumber, section);

    // Index by normalized section number (remove special chars)
    const normalized = section.sectionNumber.replace(/[§\s]/g, "");
    index.set(normalized, section);
  }

  console.log(`Indexed ${sections.length} sections with ${index.size} keys`);

  return index;
}

/**
 * Generate a document summary
 */
export function generateDocumentSummary(sections: DocumentSection[]): string {
  const titles = sections.slice(0, 10).map((s) => s.title);
  const sectionCount = sections.length;

  const summary = `This document contains ${sectionCount} sections covering: ${titles.slice(0, 5).join(", ")}${titles.length > 5 ? ", and more" : ""}. The document appears to be a structured benefits or policy document with detailed terms and conditions.`;

  return summary.substring(0, 200);
}

/**
 * Main function to process a PDF document
 */
export async function processDocument(
  buffer: Buffer,
  filename: string
): Promise<ProcessedDocument> {
  console.log(`Processing document: ${filename}`);

  try {
    // Step 1: Extract text
    const { text, pageCount, pageTexts } = await extractTextFromBuffer(buffer);

    // Step 2: Split into sections
    const sections = splitIntoSections(text, pageTexts);

    // Step 3: Build index (for internal use, not returned)
    buildSectionIndex(sections);

    // Step 4: Generate summary
    const summary = generateDocumentSummary(sections);

    // Step 5: Create processed document
    const document: ProcessedDocument = {
      id: randomUUID(),
      name: filename,
      filename,
      uploadedAt: new Date(),
      pageCount,
      sections,
      benefits: [], // Will be populated by benefit extraction
      rawText: text,
      summary,
    };

    console.log(`Document processed successfully: ${document.id}`);

    return document;
  } catch (error: any) {
    console.error(`Failed to process document: ${error.message}`);
    throw error;
  }
}

// Legacy exports for backward compatibility
export async function parsePDF(buffer: Buffer): Promise<string> {
  const { text } = await extractTextFromBuffer(buffer);
  return text;
}

export function extractSections(text: string): Map<string, string> {
  // Legacy function - returns simple map
  const sections = new Map<string, string>();
  sections.set("Document", text);
  return sections;
}

export function cleanPDFText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

// Made with Bob
