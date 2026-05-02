import { NextRequest } from "next/server";
import { z } from "zod";
import { documentCache } from "../upload/route";
import { findRelevantSections } from "@/lib/benefits";
import { streamCompletion } from "@/lib/claude";
import { StreamChunk } from "@/lib/types";

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

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Parse and validate request body
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

        // Look up document
        const document = documentCache.get(documentId);

        if (!document) {
          const errorChunk: StreamChunk = {
            type: "error",
            data: `Document not found: ${documentId}. Please upload the document first.`,
          };
          controller.enqueue(
            encoder.encode(JSON.stringify(errorChunk) + "\n")
          );
          controller.close();
          return;
        }

        // Find relevant sections
        const relevantSections = await findRelevantSections(
          message,
          document.sections,
          5
        );

        // Build system prompt with document data
        const systemPrompt = `You are a friendly, precise benefits advisor helping a user understand their document.

Document context: ${document.summary}

Available sections (JSON): ${JSON.stringify(
          relevantSections.map((s) => ({
            id: s.id,
            number: s.sectionNumber,
            title: s.title,
            content: s.content.substring(0, 500), // Truncate for token efficiency
            page: s.pageNumber,
          }))
        )}

Extracted benefits (JSON): ${JSON.stringify(
          document.benefits.slice(0, 20).map((b) => ({
            title: b.title,
            category: b.category,
            value: b.exactValue,
            conditions: b.conditions,
            section: b.sectionRef,
            page: b.pageNumber,
          }))
        )}

YOUR BEHAVIOR RULES — follow these exactly:

1. NEVER dump all information at once. Start with ONE insight, then ask a clarifying question.
2. Ask follow-up questions like:
   - "Are you interested in travel benefits or everyday cashback?"
   - "Do you spend more on dining or fuel?"
   - "Would you like to know about the milestone bonuses?"
3. When stating a benefit value, ALWAYS cite the section: "According to §4.2.1, you get 5% cashback..."
4. For every factual claim, end with [CITE:sectionId:sectionNumber:excerpt] — this is parsed by the frontend
5. After your main response, output follow-up questions as [FOLLOWUP:question1||question2||question3]
6. If a user asks about a specific section number, quote the relevant text verbatim then explain it
7. If you don't know, say "I couldn't find that in the document — here's what I did find: ..."
8. Be conversational, warm, and specific. Use exact numbers. Never say "various benefits" — name them.

CITATION FORMAT (mandatory): End every factual sentence with [CITE:sectionId:sectionNumber:brief excerpt under 10 words]
FOLLOW-UP FORMAT (mandatory): End every response with [FOLLOWUP:question1||question2]`;

        // Build messages for Claude
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

        // Stream from Claude
        let fullResponse = "";

        for await (const chunk of streamCompletion(messages, systemPrompt)) {
          if (chunk.type === "text" && chunk.data) {
            fullResponse += chunk.data;

            // Emit text chunk
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

        // Parse citations from full response
        const citationRegex = /\[CITE:([^:]+):([^:]+):([^\]]+)\]/g;
        let match;
        const citations: Array<{
          sectionId: string;
          sectionNumber: string;
          excerpt: string;
        }> = [];

        while ((match = citationRegex.exec(fullResponse)) !== null) {
          citations.push({
            sectionId: match[1],
            sectionNumber: match[2],
            excerpt: match[3],
          });
        }

        // Emit citations if found
        if (citations.length > 0) {
          for (const citation of citations) {
            const citationChunk: StreamChunk = {
              type: "citation",
              data: {
                sectionId: citation.sectionId,
                sectionNumber: citation.sectionNumber,
                sectionTitle: "",
                excerpt: citation.excerpt,
                pageNumber: 1,
              },
            };
            controller.enqueue(
              encoder.encode(JSON.stringify(citationChunk) + "\n")
            );
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

// Made with Bob
