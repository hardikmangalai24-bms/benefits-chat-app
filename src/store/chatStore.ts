import { create } from "zustand";
import { ChatMessage, StreamChunk, Citation } from "@/lib/types";

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;

  // Actions
  addMessage: (message: ChatMessage) => void;
  sendMessage: (content: string, documentId: string) => Promise<void>;
  addFollowUpAsMessage: (question: string, documentId: string) => Promise<void>;
  clearChat: () => void;
}

const MAX_RETRIES = 1;

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  error: null,

  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  sendMessage: async (content: string, documentId: string) => {
    const state = get();

    // Add user message immediately (optimistic update)
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    set({
      messages: [...state.messages, userMessage],
      error: null,
    });

    // Add loading assistant message
    const assistantMessageId = `assistant_${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
      citations: [],
      followUpQuestions: [],
    };

    set({
      messages: [...get().messages, assistantMessage],
      isStreaming: true,
      streamingMessageId: assistantMessageId,
    });

    // Prepare conversation history — exclude the synthetic welcome message
    // Gemini requires the first message to be 'user' role
    const conversationHistory = state.messages
      .filter((msg) => msg.id !== "welcome")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Attempt to send with retry
    let attempt = 0;
    let success = false;

    while (attempt <= MAX_RETRIES && !success) {
      try {
        await streamChatResponse(
          content,
          documentId,
          conversationHistory,
          assistantMessageId,
          set,
          get
        );
        success = true;
      } catch (error: any) {
        attempt++;
        console.error(`Chat attempt ${attempt} failed:`, error);

        if (attempt > MAX_RETRIES) {
          // Final failure
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: error.message || "Sorry, I encountered an error. Please try again.",
                    isLoading: false,
                  }
                : msg
            ),
            isStreaming: false,
            streamingMessageId: null,
            error: error.message || "Failed to send message",
          }));
        } else {
          // Retry after brief delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  },

  addFollowUpAsMessage: async (question: string, documentId: string) => {
    // Simply call sendMessage with the follow-up question
    await get().sendMessage(question, documentId);
  },

  clearChat: () => {
    set({
      messages: [],
      isStreaming: false,
      streamingMessageId: null,
      error: null,
    });
  },
}));

/**
 * Stream chat response from API
 */
async function streamChatResponse(
  content: string,
  documentId: string,
  conversationHistory: Array<{ role: string; content: string }>,
  assistantMessageId: string,
  set: any,
  get: any
) {
  const abortController = new AbortController();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: content,
        documentId,
        conversationHistory,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Chat API returned ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const chunk: StreamChunk = JSON.parse(line);

          if (chunk.type === "text" && typeof chunk.data === "string") {
            // Update message content in-place
            set((state: any) => ({
              messages: state.messages.map((msg: ChatMessage) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + chunk.data }
                  : msg
              ),
            }));
          } else if (chunk.type === "citation" && chunk.data) {
            // Add citation to message
            const citation = chunk.data as Citation;
            set((state: any) => ({
              messages: state.messages.map((msg: ChatMessage) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      citations: [...(msg.citations || []), citation],
                    }
                  : msg
              ),
            }));
          } else if (
            chunk.type === "follow_up" &&
            Array.isArray(chunk.data)
          ) {
            // Set follow-up questions
            set((state: any) => ({
              messages: state.messages.map((msg: ChatMessage) =>
                msg.id === assistantMessageId
                  ? { ...msg, followUpQuestions: chunk.data as string[] }
                  : msg
              ),
            }));
          } else if (chunk.type === "done") {
            // Mark as complete
            set((state: any) => ({
              messages: state.messages.map((msg: ChatMessage) =>
                msg.id === assistantMessageId
                  ? { ...msg, isLoading: false }
                  : msg
              ),
              isStreaming: false,
              streamingMessageId: null,
            }));
          } else if (chunk.type === "error") {
            throw new Error(chunk.data as string);
          }
        } catch (parseError) {
          console.error("Error parsing chunk:", parseError, line);
        }
      }
    }
  } catch (error: any) {
    console.error("Stream error:", error);
    abortController.abort();
    throw error;
  }
}

// Made with Bob
