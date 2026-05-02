"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import BenefitsPanel from "@/components/chat/BenefitsPanel";
import { useDocumentStore } from "@/store/documentStore";
import { useChatStore } from "@/store/chatStore";

export default function ChatPage() {
  const router = useRouter();
  const document = useDocumentStore((state) => state.document);
  const { messages, addMessage } = useChatStore();

  useEffect(() => {
    if (!document) {
      router.push("/");
      return;
    }

    // Add welcome message if no messages exist
    if (messages.length === 0 && document.benefits) {
      const categories = Array.from(
        new Set(document.benefits.map((b) => b.category))
      );

      const welcomeMessage = {
        id: "welcome",
        role: "assistant" as const,
        content: `Hi! I've analyzed your **${document.name}** — I found **${document.benefits.length} benefits** across **${categories.length} categories**.

Before I walk you through everything, let me ask: are you more interested in **everyday cashback and rewards**, or are you looking for **travel and lifestyle perks**?`,
        timestamp: new Date(),
        citations: [],
        followUpQuestions: [
          "Everyday rewards",
          "Travel & lifestyle",
          "Show me everything",
        ],
      };

      addMessage(welcomeMessage);
    }
  }, [document, router, messages.length, addMessage]);

  if (!document) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 glass-card border-b border-white/10 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
            BenefitLens
          </h1>
          <div className="w-px h-6 bg-white/20" />
          <div>
            <p className="text-sm font-medium text-white/90">{document.name}</p>
            <p className="text-xs text-white/50">
              {document.sections?.length || 0} sections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 text-xs font-medium bg-accent-gold/20 text-accent-gold rounded-full">
            {document.benefits?.length || 0} benefits
          </span>
          <button
            onClick={() => router.push("/")}
            className="glass-button text-sm px-4 py-2"
          >
            New Document
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {document.benefits && document.benefits.length > 0 && (
          <BenefitsPanel benefits={document.benefits} />
        )}

        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}

// Made with Bob
