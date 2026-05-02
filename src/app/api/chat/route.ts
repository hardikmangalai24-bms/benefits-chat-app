import { NextRequest } from "next/server";
import { z } from "zod";
import { documentCache } from "@/lib/documentCache";
import { streamCompletion } from "@/lib/gemini";
import { StreamChunk, DocumentSection } from "@/lib/types";

// Validation schema
const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  documentId: z.string().min(1, "Document ID is required"),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .default([]),
});

/**
 * Smart section selection: returns the most relevant sections for a query.
 * Falls back to sending ALL content if the document is small enough.
 */
function selectRelevantContent(
  query: string,
  sections: DocumentSection[],
  rawText: string
): string {
  const MAX_CONTEXT_CHARS = 30000; // Gemini 2.5 Flash handles large context well

  // If total document is small enough, just send everything
  const totalContent = sections.map((s) => s.content).join("\n\n");
  if (totalContent.length <= MAX_CONTEXT_CHARS) {
    return sections
      .map(
        (s, i) =>
          `--- Section ${s.sectionNumber}: ${s.title} (Page ${s.pageNumber}) ---\n${s.content}`
      )
      .join("\n\n");
  }

  // For larger documents, score and select the best sections
  const queryLower = query.toLowerCase();
  const queryWords = queryLower
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter(
      (w) =>
        ![
          "the",
          "and",
          "for",
          "are",
          "but",
          "not",
          "you",
          "all",
          "can",
          "has",
          "her",
          "was",
          "one",
          "our",
          "out",
          "what",
          "with",
          "this",
          "that",
          "from",
          "they",
          "have",
          "been",
          "said",
          "does",
          "about",
          "would",
          "which",
          "their",
          "will",
          "there",
          "could",
          "other",
          "than",
          "then",
          "them",
          "these",
          "some",
          "make",
          "like",
          "tell",
          "show",
          "give",
          "please",
          "document",
        ].includes(w)
    );

  const scored = sections.map((section) => {
    const contentLower = (section.title + " " + section.content).toLowerCase();
    let score = 0;

    // Exact phrase match (highest weight)
    if (contentLower.includes(queryLower)) {
      score += 20;
    }

    // Individual word matches
    for (const word of queryWords) {
      const regex = new RegExp(`\\b${word}`, "gi");
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
      // Title match bonus
      if (section.title.toLowerCase().includes(word)) {
        score += 5;
      }
    }

    return { section, score };
  });

  // Sort by relevance
  scored.sort((a, b) => b.score - a.score);

  // Always include at least the top 8 sections, or until we hit the limit
  let contextChars = 0;
  const selected: DocumentSection[] = [];

  for (const { section } of scored) {
    if (contextChars + section.content.length > MAX_CONTEXT_CHARS && selected.length >= 5) {
      break;
    }
    selected.push(section);
    contextChars += section.content.length;
    if (selected.length >= 10) break;
  }

  return selected
    .map(
      (s) =>
        `--- Section ${s.sectionNumber}: ${s.title} (Page ${s.pageNumber}) ---\n${s.content}`
    )
    .join("\n\n");
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const validation = ChatRequestSchema.safeParse(body);

        if (!validation.success) {
          const errorChunk: StreamChunk = {
            type: "error",
            data: `Invalid request: ${validation.error.errors.map((e) => e.message).join(", ")}`,
          };
          controller.enqueue(
            encoder.encode(JSON.stringify(errorChunk) + "\n")
          );
          controller.close();
          return;
        }

        const { message, documentId, conversationHistory } = validation.data;

        const document = documentCache.get(documentId);

        if (!document) {
          const errorChunk: StreamChunk = {
            type: "error",
            data: `Document not found. Please re-upload your document.`,
          };
          controller.enqueue(
            encoder.encode(JSON.stringify(errorChunk) + "\n")
          );
          controller.close();
          return;
        }

        // Build rich context from document sections — NO truncation
        const contextContent = selectRelevantContent(
          message,
          document.sections,
          document.rawText
        );

        console.log(
          `Chat context: ${contextContent.length} chars from ${document.sections.length} sections for query: "${message}"`
        );

        // Build system prompt — general purpose, not credit-card specific
        const systemPrompt = `You are BenefitLens AI, an intelligent document assistant. You have been given the full content of a document that the user uploaded. Your job is to answer ANY question about this document accurately and helpfully.

DOCUMENT TITLE: "${document.name}"
DOCUMENT SUMMARY: ${document.summary}

DOCUMENT CONTENT:
${contextContent}

YOUR RULES:
1. Answer questions using ONLY the document content provided above. Be thorough and detailed.
2. If the user asks about something covered in the document, provide a comprehensive answer with specific details, numbers, and quotes from the text.
3. If the user asks about something NOT in the document, say "This specific topic isn't covered in the document" and then suggest what IS available.
4. For scenario-based questions (e.g., "what if I spend ₹50,000?"), use the document data to calculate or reason through the answer.
5. Use markdown formatting: **bold** for key terms, bullet points for lists, and organize information clearly.
6. Be conversational and helpful. Don't be overly formal.
7. When referencing specific information, mention which section it came from.
8. After your response, suggest 2-3 follow-up questions the user might want to ask, formatted as: [FOLLOWUP:question1||question2||question3]
9. NEVER say "I couldn't find specific information" unless you genuinely searched the provided content and it's truly not there. The document content IS provided to you above — read it carefully.
10. For general questions like "summarize" or "what does this document cover", provide a thorough overview of ALL the main topics covered.`;

        const messages = [
          ...conversationHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          {
            role: "user" as const,
            content: message,
          },
        ];

        let fullResponse = "";

        for await (const chunk of streamCompletion(messages, systemPrompt)) {
          if (chunk.type === "text" && chunk.data) {
            fullResponse += chunk.data;

            const textChunk: StreamChunk = {
              type: "text",
              data: chunk.data,
            };
            controller.enqueue(
              encoder.encode(JSON.stringify(textChunk) + "\n")
            );
          } else if (chunk.type === "error") {
            const errorChunk: StreamChunk = {
              type: "error",
              data: chunk.data as string,
            };
            controller.enqueue(
              encoder.encode(JSON.stringify(errorChunk) + "\n")
            );
            controller.close();
            return;
          }
        }

        // Parse follow-up questions
        const followUpRegex = /\[FOLLOWUP:([^\]]+)\]/;
        const followUpMatch = fullResponse.match(followUpRegex);

        if (followUpMatch) {
          const questions = followUpMatch[1].split("||").map((q) => q.trim());
          const followUpChunk: StreamChunk = {
            type: "follow_up",
            data: questions,
          };
          controller.enqueue(
            encoder.encode(JSON.stringify(followUpChunk) + "\n")
          );
        }

        // Emit done signal
        const doneChunk: StreamChunk = {
          type: "done",
          data: null,
        };
        controller.enqueue(encoder.encode(JSON.stringify(doneChunk) + "\n"));
        controller.close();
      } catch (error: any) {
        console.error("Chat stream error:", error);
        const errorChunk: StreamChunk = {
          type: "error",
          data: `Chat error: ${error.message || "Unknown error"}`,
        };
        controller.enqueue(encoder.encode(JSON.stringify(errorChunk) + "\n"));
        controller.close();
      }
    },
    cancel() {
      console.log("Client disconnected from chat stream");
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
