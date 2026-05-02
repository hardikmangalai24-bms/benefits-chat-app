import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { StreamChunk } from "./types";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MODEL = "gemini-2.5-flash";
const MAX_TOKENS = 4096;

// Safety settings — allow all content for document analysis
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

/**
 * Custom error types for better error handling
 */
export class GeminiAPIError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "GeminiAPIError";
  }
}

export class GeminiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

export class GeminiInvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiInvalidRequestError";
  }
}

/**
 * Helper: Complete a prompt and return the full response (with retry for rate limits)
 */
export async function complete(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): Promise<string> {
  const MAX_RETRIES = 3;
  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        safetySettings,
        systemInstruction: systemPrompt,
      });

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: MAX_TOKENS,
        },
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new GeminiAPIError("No text content in response");
      }

      return text;
    } catch (error: any) {
      lastError = error;

      // Retry on rate limit errors
      const isRateLimit =
        error.message?.includes("429") ||
        error.message?.includes("quota") ||
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.message?.includes("rate");

      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.log(`Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (isRateLimit) {
        throw new GeminiRateLimitError(
          "Rate limit exceeded after retries. Please try again in a minute."
        );
      }
      if (error.message?.includes("400") || error.message?.includes("INVALID")) {
        throw new GeminiInvalidRequestError(
          `Invalid request: ${error.message || "Unknown error"}`
        );
      }
      if (error instanceof GeminiAPIError) throw error;
      throw new GeminiAPIError(
        `Gemini API error: ${error.message || "Unknown error"}`,
        error
      );
    }
  }

  throw lastError;
}

/**
 * Helper: Stream completion chunks (with retry for rate limits)
 */
export async function* streamCompletion(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string
): AsyncGenerator<StreamChunk> {
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        safetySettings,
        systemInstruction: systemPrompt,
      });

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: MAX_TOKENS,
        },
      });

      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield {
            type: "text",
            data: text,
          };
        }
      }

      yield {
        type: "done",
        data: null,
      };

      return; // Success — exit the retry loop
    } catch (error: any) {
      const isRateLimit =
        error.message?.includes("429") ||
        error.message?.includes("quota") ||
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.message?.includes("rate");

      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt + 1) * 1000;
        console.log(`Stream rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (isRateLimit) {
        yield {
          type: "error",
          data: "I'm temporarily rate limited. Please wait a moment and try again.",
        };
      } else if (error.message?.includes("400") || error.message?.includes("INVALID")) {
        yield {
          type: "error",
          data: `Invalid request: ${error.message || "Unknown error"}`,
        };
      } else {
        yield {
          type: "error",
          data: `AI error: ${error.message || "Unknown error"}. Please try again.`,
        };
      }
      return;
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

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
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
 * Get a single response from Gemini (non-streaming, for backward compatibility)
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

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
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
