"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import MessageBubble from "@/components/chat/MessageBubble";
import InputBar from "./InputBar";
import Logo from "@/components/ui/Logo";

export default function ChatWindow() {
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const document = useDocumentStore((state) => state.document);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const checkIfAtBottom = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 80);
  };

  const scrollToBottom = (force = false) => {
    if (force || isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestion = (q: string) => {
    if (document) sendMessage(q, document.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={checkIfAtBottom}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 pt-20">
              <Logo className="w-16 h-16 shadow-xl" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">
                  Ask me anything
                </h2>
                <p className="text-sm text-gray-500 dark:text-white/40 max-w-sm">
                  I've analyzed your document and I'm ready to help
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {["Summarize this document", "What are the key highlights?", "What topics does this cover?"].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(q)}
                    className="text-left px-4 py-3 rounded-xl text-sm text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white/90 bg-white/80 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] border border-black/5 dark:border-white/[0.04] hover:border-black/10 dark:hover:border-white/[0.08] transition-all duration-200 shadow-sm dark:shadow-none"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      {!isAtBottom && messages.length > 0 && (
        <div className="flex justify-center -mt-4 mb-2 relative z-10">
          <button
            onClick={() => scrollToBottom(true)}
            className="w-8 h-8 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center shadow-lg hover:bg-dark-600 transition-all"
          >
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-black/5 dark:border-white/[0.04] px-4 sm:px-6 py-4 bg-white/60 dark:bg-dark-900/60 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto">
          <InputBar />
        </div>
      </div>
    </div>
  );
}
