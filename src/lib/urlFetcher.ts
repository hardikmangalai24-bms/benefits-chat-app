import { DocumentSection, ProcessedDocument } from "./types";
import { randomUUID } from "crypto";

const MAX_URL_CONTENT_LENGTH = 500_000; // 500KB of text max

/**
 * Fetch and extract text content from a URL
 */
export async function fetchUrlContent(url: string): Promise<{
  text: string;
  title: string;
}> {
  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL format. Please provide a valid URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  console.log(`Fetching content from URL: ${url}`);

  // Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain") && !contentType.includes("application/xhtml")) {
      throw new Error(
        `Unsupported content type: ${contentType}. Only HTML and text pages are supported.`
      );
    }

    const html = await response.text();

    if (html.length > MAX_URL_CONTENT_LENGTH * 3) {
      throw new Error("Page content is too large to process.");
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].trim().replace(/\s+/g, " ")
      : parsedUrl.hostname;

    // Extract meaningful text from HTML
    const text = extractTextFromHTML(html);

    if (!text || text.trim().length < 50) {
      throw new Error(
        "Could not extract meaningful text from the URL. The page may be JavaScript-rendered or contain mostly images."
      );
    }

    console.log(`Extracted ${text.length} characters from URL`);

    return { text: text.substring(0, MAX_URL_CONTENT_LENGTH), title };
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("URL fetch timed out after 15 seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extract readable text from HTML, stripping tags and scripts
 */
function extractTextFromHTML(html: string): string {
  let text = html;

  // Remove script and style tags and their content
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Replace block elements with newlines
  text = text.replace(
    /<\/?(?:div|p|br|hr|h[1-6]|ul|ol|li|table|tr|td|th|blockquote|section|article|header|footer|nav|main|aside|details|summary|figure|figcaption|pre|dd|dt)[^>]*>/gi,
    "\n"
  );

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&#\d+;/g, " ");

  // Clean up whitespace
  text = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Remove duplicate newlines
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}

/**
 * Split URL text into sections based on headings / paragraph structure
 */
function splitUrlTextIntoSections(
  text: string,
  title: string
): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const MAX_SECTION_LEN = 3000;
  const lines = text.split("\n");

  let currentSection: {
    title: string;
    sectionNumber: string;
    content: string[];
  } | null = null;
  let sectionIndex = 0;

  const flushSection = () => {
    if (currentSection && currentSection.content.length > 0) {
      const content = currentSection.content.join("\n").trim();
      if (content.length > 30) {
        // Only keep sections with meaningful content
        sections.push({
          id: randomUUID(),
          sectionNumber: currentSection.sectionNumber,
          title: currentSection.title,
          content,
          pageNumber: 1,
        });
      }
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect heading-like text
    const isHeading =
      trimmed.length < 120 &&
      trimmed.length > 2 &&
      !trimmed.endsWith(".") &&
      !trimmed.endsWith(",") &&
      (trimmed === trimmed.toUpperCase() ||
        /^[A-Z][A-Za-z\s,&\-:]+$/.test(trimmed) ||
        /^#{1,4}\s/.test(trimmed) ||
        /^\d+\.\s+[A-Z]/.test(trimmed));

    if (isHeading) {
      flushSection();
      sectionIndex++;
      currentSection = {
        title: trimmed.replace(/^#+\s*/, "").replace(/:$/, ""),
        sectionNumber: `§${sectionIndex}`,
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(trimmed);

      // Split overly large sections at paragraph breaks
      const currentLen = currentSection.content.join("\n").length;
      if (currentLen > MAX_SECTION_LEN) {
        flushSection();
        sectionIndex++;
        currentSection = {
          title: `${currentSection.title} (continued)`,
          sectionNumber: `§${sectionIndex}`,
          content: [],
        };
      }
    } else {
      sectionIndex++;
      currentSection = {
        title: title || "Introduction",
        sectionNumber: `§${sectionIndex}`,
        content: [trimmed],
      };
    }
  }

  flushSection();

  // If no sections created, split the raw text into chunks
  if (sections.length === 0) {
    const chunks = text.match(/.{1,3000}/gs) || [text];
    for (let i = 0; i < chunks.length; i++) {
      sections.push({
        id: randomUUID(),
        sectionNumber: `§${i + 1}`,
        title: i === 0 ? (title || "Document") : `${title || "Document"} (Part ${i + 1})`,
        content: chunks[i].trim(),
        pageNumber: 1,
      });
    }
  }

  return sections;
}

/**
 * Generate a document summary from URL text
 */
function generateUrlSummary(
  sections: DocumentSection[],
  title: string
): string {
  const sectionTitles = sections.slice(0, 5).map((s) => s.title);
  return `Web page "${title}" with ${sections.length} sections covering: ${sectionTitles.join(", ")}${sections.length > 5 ? ", and more" : ""}.`.substring(0, 200);
}

/**
 * Process a URL into a ProcessedDocument
 */
export async function processUrl(url: string): Promise<ProcessedDocument> {
  console.log(`Processing URL: ${url}`);

  const { text, title } = await fetchUrlContent(url);
  const sections = splitUrlTextIntoSections(text, title);
  const summary = generateUrlSummary(sections, title);

  const document: ProcessedDocument = {
    id: randomUUID(),
    name: title,
    filename: url,
    uploadedAt: new Date(),
    pageCount: 1,
    sections,
    benefits: [],
    rawText: text,
    summary,
  };

  console.log(`URL processed successfully: ${document.id} (${sections.length} sections)`);

  return document;
}
