"use client";

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";

const MAX_CHARS = 1000;

export default function InputBar() {
  const [input, setInput] = useState("");
  const { sendMessage, isStreaming } = useChatStore();
  const document = useDocumentStore((state) => state.document);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || input.length > MAX_CHARS || !document) return;
    await sendMessage(input.trim(), document.id);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isOverLimit = input.length > MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-2 items-end">
        {/* Attach button */}
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all flex-shrink-0"
          title="Attach document (current session)"
          disabled
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your document..."
            disabled={isStreaming}
            rows={1}
            className={`
              glass-input w-full resize-none
              min-h-[44px] max-h-[120px]
              py-3 px-4 pr-3 text-[14px] leading-relaxed
              ${isOverLimit ? "border-red-500/40" : ""}
              ${isStreaming ? "opacity-40 cursor-not-allowed" : ""}
            `}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!input.trim() || isStreaming || isOverLimit}
          className={`
            w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0
            transition-all duration-200
            ${input.trim() && !isStreaming && !isOverLimit
              ? "bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 hover:shadow-brand-500/30"
              : "bg-gray-200 dark:bg-white/[0.04] text-gray-400 dark:text-white/20 cursor-not-allowed"
            }
          `}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>

      {/* Helper */}
      <p className="text-[10px] text-gray-500 dark:text-white/20 mt-2 text-center">
        <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-white/[0.04] rounded text-gray-600 dark:text-white/30 text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-white/[0.04] rounded text-gray-600 dark:text-white/30 text-[9px]">Shift+Enter</kbd> for new line
      </p>
    </form>
  );
}
