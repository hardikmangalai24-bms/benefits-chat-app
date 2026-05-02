"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import { useDocumentStore } from "@/store/documentStore";
import { useChatStore } from "@/store/chatStore";

export default function ChatPage() {
  const router = useRouter();
  const document = useDocumentStore((state) => state.document);
  const { addMessage, clearChat } = useChatStore();

  useEffect(() => {
    if (!document) {
      router.push("/");
      return;
    }

    const hasWelcome = useChatStore.getState().messages.some((m) => m.id === "welcome");
    if (hasWelcome) return;

    const sectionCount = document.sections?.length || 0;

    const welcomeMessage = {
      id: "welcome",
      role: "assistant" as const,
      content: `I've analyzed **${document.name}** — ${sectionCount} sections loaded and ready.\n\nAsk me anything about this document. I can summarize it, explain specific sections, answer scenario-based questions, or help you find particular information.`,
      timestamp: new Date(),
      citations: [],
      followUpQuestions: [
        "Summarize this document",
        "What are the key topics covered?",
        "What are the main highlights?",
      ],
    };

    addMessage(welcomeMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, router]);

  if (!document) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-dark-900">
      {/* Header */}
      <header className="h-14 border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 bg-dark-900/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">{document.name}</p>
            <p className="text-[11px] text-white/35">
              {document.sections?.length || 0} sections · {document.pageCount || 1} pages
            </p>
          </div>
        </div>

        <button
          onClick={() => { clearChat(); router.push("/"); }}
          className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white/80 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
}
