import Anthropic from "@anthropic-ai/sdk";
import { StreamChunk } from "./types";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;

/**
 * Custom error types for better error handling
 */
export class ClaudeAPIError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "ClaudeAPIError";
  }
}

export class ClaudeRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeRateLimitError";
  }
}

export class ClaudeInvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeInvalidRequestError";
  }
}

/**
 * Helper: Complete a prompt and return the full response
 */
export async function complete(
  messages: Anthropic.MessageParam[],
  systemPrompt: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    });

    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    if (!textContent) {
      throw new ClaudeAPIError("No text content in response");
    }

    return textContent.text;
  } catch (error: any) {
    if (error.status === 429) {
      throw new ClaudeRateLimitError(
        "Rate limit exceeded. Please try again later."
      );
    }
    if (error.status === 400) {
      throw new ClaudeInvalidRequestError(
        `Invalid request: ${error.message || "Unknown error"}`
      );
    }
    throw new ClaudeAPIError(
      `Claude API error: ${error.message || "Unknown error"}`,
      error
    );
  }
}

/**
 * Helper: Stream completion chunks
 */
export async function* streamCompletion(
  messages: Anthropic.MessageParam[],
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  try {
    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        yield {
          type: "text",
          data: chunk.delta.text,
        };
      }
    }

    yield {
      type: "done",
      data: null,
    };
  } catch (error: any) {
    if (error.status === 429) {
      yield {
        type: "error",
        data: "Rate limit exceeded. Please try again later.",
      };
    } else if (error.status === 400) {
      yield {
        type: "error",
        data: `Invalid request: ${error.message || "Unknown error"}`,
      };
    } else {
      yield {
        type: "error",
        data: `Claude API error: ${error.message || "Unknown error"}`,
      };
    }
  }
}

/**
 * Stream chat response (for backward compatibility with existing code)
 */
export async function streamChatResponse({
  message,
  documentId,
  conversationHistory,
  context,
}: {
  message: string;
  documentId: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  context?: string;
}): Promise<ReadableStream> {
  const systemPrompt = `You are a helpful assistant specialized in explaining employee benefits documents. 
You have access to the full benefits document text provided in the context.

When answering questions:
1. Provide clear, accurate information based on the document
2. Include specific citations with section names when referencing information
3. Highlight key benefits that are relevant to the user's question
4. Use a friendly, professional tone
5. If information is not in the document, clearly state that

Format your responses with:
- Clear explanations
- Bullet points for lists
- Section references in [brackets] like [Health Insurance - Coverage Details]
- Benefit highlights when relevant`;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    {
      role: "user" as const,
      content: context
        ? `Context from benefits document:\n\n${context}\n\nUser question: ${message}`
        : message,
    },
  ];

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCompletion(messages, systemPrompt)) {
          if (chunk.type === "text" && chunk.data) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.data })}\n\n`)
            );
          } else if (chunk.type === "done") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
            );
          } else if (chunk.type === "error") {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: chunk.data })}\n\n`
              )
            );
          }
        }
        controller.close();
      } catch (error: any) {
        console.error("Stream error:", error);
        controller.error(error);
      }
    },
  });
}

/**
 * Get a single response from Claude (non-streaming, for backward compatibility)
 */
export async function getChatResponse({
  message,
  documentId,
  conversationHistory,
  context,
}: {
  message: string;
  documentId: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  context?: string;
}): Promise<string> {
  const systemPrompt = `You are a helpful assistant specialized in explaining employee benefits documents.`;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    {
      role: "user" as const,
      content: context
        ? `Context from benefits document:\n\n${context}\n\nUser question: ${message}`
        : message,
    },
  ];

  return complete(messages, systemPrompt);
}

/**
 * Parse citations from response text
 */
export function parseCitations(
  text: string
): Array<{ section: string; text: string }> {
  const citations: Array<{ section: string; text: string }> = [];
  const citationRegex = /\[([^\]]+)\]/g;

  let match;
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push({
      section: match[1],
      text: match[0],
    });
  }

  return citations;
}

// Made with Bob
