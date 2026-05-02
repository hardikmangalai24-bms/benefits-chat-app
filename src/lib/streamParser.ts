import { StreamChunk } from "./types";

/**
 * Parse a streaming response from the chat API
 * Handles newline-delimited JSON chunks and extracts inline citations
 */
export async function* parseStream(
  response: Response
): AsyncGenerator<StreamChunk> {
  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: "error", data: "No response body available" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffered content
        if (buffer.trim()) {
          yield* processLine(buffer);
        }
        yield { type: "done", data: null };
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split("\n");
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          yield* processLine(line);
        }
      }
    }
  } catch (error) {
    console.error("Stream parsing error:", error);
    yield {
      type: "error",
      data: error instanceof Error ? error.message : "Stream parsing failed",
    };
  } finally {
    reader.releaseLock();
  }
}

/**
 * Process a single line from the stream
 * Parses JSON and extracts inline citations and follow-ups
 */
function* processLine(line: string): Generator<StreamChunk> {
  try {
    const chunk = JSON.parse(line) as StreamChunk;

    // If it's a text chunk, extract inline citations and follow-ups
    if (chunk.type === "text" && typeof chunk.data === "string") {
      yield* extractInlineTags(chunk.data);
    } else {
      yield chunk;
    }
  } catch (error) {
    console.error("JSON parse error:", error, "Line:", line);
    yield {
      type: "error",
      data: "Malformed response chunk",
    };
  }
}

/**
 * Extract inline citation and follow-up tags from text
 * Pattern: [CITE:sectionId:sectionNumber:excerpt]
 * Pattern: [FOLLOWUP:q1||q2||q3]
 */
function* extractInlineTags(text: string): Generator<StreamChunk> {
  // Combined regex for both citation and follow-up patterns
  const citationRegex = /\[CITE:([^:]+):([^:]+):([^\]]+)\]/g;
  const followUpRegex = /\[FOLLOWUP:([^\]]+)\]/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // First, extract citations
  const citationMatches: Array<{
    index: number;
    length: number;
    citation: { sectionId: string; sectionNumber: string; excerpt: string };
  }> = [];

  while ((match = citationRegex.exec(text)) !== null) {
    citationMatches.push({
      index: match.index,
      length: match[0].length,
      citation: {
        sectionId: match[1],
        sectionNumber: match[2],
        excerpt: match[3],
      },
    });
  }

  // Extract follow-ups
  const followUpMatches: Array<{
    index: number;
    length: number;
    questions: string[];
  }> = [];

  while ((match = followUpRegex.exec(text)) !== null) {
    const questions = match[1].split("||").map((q) => q.trim());
    followUpMatches.push({
      index: match.index,
      length: match[0].length,
      questions,
    });
  }

  // Combine and sort all matches by index
  const allMatches = [
    ...citationMatches.map((m) => ({ ...m, type: "citation" as const })),
    ...followUpMatches.map((m) => ({ ...m, type: "followup" as const })),
  ].sort((a, b) => a.index - b.index);

  // Process text with all tags
  lastIndex = 0;
  for (const match of allMatches) {
    // Yield text before the tag
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      if (textBefore) {
        yield { type: "text", data: textBefore };
      }
    }

    // Yield the appropriate chunk type
    if (match.type === "citation") {
      yield {
        type: "citation",
        data: (match as typeof citationMatches[0]).citation,
      };
    } else {
      yield {
        type: "follow_up",
        data: JSON.stringify((match as typeof followUpMatches[0]).questions),
      };
    }

    lastIndex = match.index + match.length;
  }

  // Yield remaining text after all tags
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      yield { type: "text", data: remainingText };
    }
  }

  // If no tags were found, yield the original text
  if (allMatches.length === 0 && text) {
    yield { type: "text", data: text };
  }
}

// Made with Bob
