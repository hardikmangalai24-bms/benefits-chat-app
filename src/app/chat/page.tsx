"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import { useDocumentStore } from "@/store/documentStore";
import { useChatStore } from "@/store/chatStore";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/ui/Logo";
import { Home, Plus } from "lucide-react";
import Link from "next/link";

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
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Header */}
      <header className="h-14 border-b border-black/5 dark:border-white/[0.06] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 bg-white/50 dark:bg-dark-900/80 backdrop-blur-xl z-10 transition-colors duration-200">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="hover:scale-105 transition-transform" aria-label="Go home">
            <Home className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white/80 transition-colors" />
          </Link>
          <div className="w-[1px] h-4 bg-gray-300 dark:bg-white/10 mx-1" />
          {/* Logo */}
          <Logo className="w-8 h-8 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{document.name}</p>
            <p className="text-[11px] text-gray-500 dark:text-white/35">
              {document.sections?.length || 0} sections · {document.pageCount || 1} pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => { clearChat(); router.push("/"); }}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white/90 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
}
