"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";
import MessageBubble from "@/components/chat/MessageBubble";
import InputBar from "./InputBar";

export default function ChatWindow() {
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const document = useDocumentStore((state) => state.document);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Check if user is at bottom of scroll
  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  // Auto-scroll to bottom only if user is already at bottom
  const scrollToBottom = (force = false) => {
    if (force || isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Suggested starter questions
  const starterQuestions = [
    "What are my top 5 benefits?",
    "Are there any milestone bonuses?",
    "What are the conditions for lounge access?",
  ];

  const handleSuggestionClick = (question: string) => {
    if (document) {
      sendMessage(question, document.id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={checkIfAtBottom}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      >
        {messages.length === 0 ? (
          // Empty state
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <span className="text-2xl font-bold text-white">AI</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-gold bg-clip-text text-transparent">
                Ask me anything about your document
              </h2>
              <p className="text-white/60 text-lg">
                I've analyzed your document and I'm ready to help
              </p>
            </div>

            {/* Starter questions */}
            <div className="space-y-3 w-full">
              <p className="text-sm text-white/50">Try asking:</p>
              <div className="flex flex-col gap-3">
                {starterQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    className="glass-card p-4 text-left hover:glass-hover transition-all duration-300 group"
                  >
                    <p className="text-white/90 group-hover:text-white transition-colors">
                      {question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Messages list
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to bottom button (when not at bottom) */}
      {!isAtBottom && messages.length > 0 && (
        <div className="absolute bottom-24 right-8">
          <button
            onClick={() => scrollToBottom(true)}
            className="glass-button w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
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
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/10 p-6 bg-dark-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <InputBar />
        </div>
      </div>
    </div>
  );
}

// Made with Bob
