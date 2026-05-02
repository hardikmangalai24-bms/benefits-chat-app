"use client";

import ReactMarkdown from "react-markdown";
import { Message } from "@/lib/types";
import FollowUpSuggestions from "./FollowUpSuggestions";
import LoadingDots from "@/components/ui/LoadingDots";
import { useChatStore } from "@/store/chatStore";
import { useDocumentStore } from "@/store/documentStore";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = useChatStore((state) => state.isStreaming);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const document = useDocumentStore((state) => state.document);

  const handleFollowUp = (q: string) => {
    if (document) sendMessage(q, document.id);
  };

  // Strip machine-readable tags
  const clean = (text: string): string =>
    text
      .replace(/\[CITE:[^\]]*\]/g, "")
      .replace(/\[FOLLOWUP:[^\]]*\]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] flex items-start gap-2.5">
          <div className="bg-brand-600/20 border border-brand-500/20 rounded-2xl rounded-tr-md px-4 py-3">
            <p className="text-[14px] text-white/90 whitespace-pre-wrap leading-relaxed">{message.content}</p>
            <p className="text-[10px] text-white/25 mt-2">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const displayContent = message.content ? clean(message.content) : "";

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex items-start gap-2.5">
        {/* AI avatar */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand-500/20">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl rounded-tl-md px-4 py-3">
            {displayContent ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-[14px] text-white/80 mb-3 last:mb-0 leading-relaxed">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-brand-300 not-italic font-medium">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside ml-4 space-y-1.5 text-white/70 my-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside ml-4 space-y-1.5 text-white/70 my-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-[14px] text-white/70 leading-relaxed">{children}</li>
                    ),
                    h1: ({ children }) => (
                      <h3 className="text-base font-semibold text-white mt-4 mb-2">{children}</h3>
                    ),
                    h2: ({ children }) => (
                      <h4 className="text-[15px] font-semibold text-white mt-3 mb-2">{children}</h4>
                    ),
                    h3: ({ children }) => (
                      <h5 className="text-[14px] font-semibold text-white/90 mt-3 mb-1.5">{children}</h5>
                    ),
                    code: ({ children }) => (
                      <code className="px-1.5 py-0.5 bg-white/[0.06] rounded text-[13px] text-brand-300 font-mono">{children}</code>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-brand-500/30 pl-4 my-3 text-white/60">{children}</blockquote>
                    ),
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              </div>
            ) : (
              <LoadingDots />
            )}

            {displayContent && (
              <p className="text-[10px] text-white/20 mt-3">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>

          {/* Follow-up suggestions */}
          {message.followUpQuestions && message.followUpQuestions.length > 0 && (
            <FollowUpSuggestions
              questions={message.followUpQuestions}
              onSelect={handleFollowUp}
              disabled={isStreaming}
            />
          )}
        </div>
      </div>
    </div>
  );
}
