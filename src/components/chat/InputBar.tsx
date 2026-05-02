"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";

const MAX_CHARS = 500;
const SHOW_COUNTER_AT = 400;

export default function InputBar() {
  const [input, setInput] = useState("");
  const { sendMessage, isStreaming } = useChatStore();
  const document = useDocumentStore((state) => state.document);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || input.length > MAX_CHARS || !document) return;

    await sendMessage(input.trim(), document.id);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const charCount = input.length;
  const isOverLimit = charCount > MAX_CHARS;
  const showCounter = charCount >= SHOW_COUNTER_AT;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-3 items-end">
        {/* Microphone icon (placeholder) */}
        <button
          type="button"
          className="glass-button w-12 h-12 flex items-center justify-center flex-shrink-0 opacity-50 cursor-not-allowed"
          disabled
          title="Voice input (coming soon)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        {/* Input area */}
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your benefits..."
            disabled={isStreaming}
            rows={1}
            className={`
              glass-input w-full resize-none
              min-h-[48px] max-h-[120px]
              py-3 px-4 pr-12
              ${isOverLimit ? "border-red-500/50" : ""}
              ${isStreaming ? "opacity-50 cursor-not-allowed" : ""}
            `}
            style={{
              height: "auto",
              overflowY: input.split("\n").length > 2 ? "auto" : "hidden",
            }}
          />

          {/* Character counter */}
          {showCounter && (
            <div
              className={`
                absolute bottom-2 right-2 text-xs
                ${isOverLimit ? "text-red-400" : "text-white/40"}
              `}
            >
              {charCount}/{MAX_CHARS}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || isStreaming || isOverLimit}
          className={`
            glass-button w-12 h-12 flex items-center justify-center flex-shrink-0
            bg-gradient-to-r from-accent-cyan to-accent-purple
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:from-white/10 disabled:to-white/10
            transition-all duration-300
            hover:scale-105 active:scale-95
          `}
        >
          <PaperPlaneIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-white/40 mt-2 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">Enter</kbd> to send,{" "}
        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/60">Shift+Enter</kbd> for new line
      </p>
    </form>
  );
}

// Made with Bob
