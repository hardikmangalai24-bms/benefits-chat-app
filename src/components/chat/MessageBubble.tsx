"use client";

import ReactMarkdown from "react-markdown";
import { Message } from "@/lib/types";
import CitationBadge from "@/components/ui/CitationBadge";
import BenefitCard from "./BenefitCard";
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

  const handleFollowUpSelect = (question: string) => {
    if (document) {
      sendMessage(question, document.id);
    }
  };

  if (isUser) {
    // User message bubble (right-aligned)
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] flex items-start gap-3">
          <div className="bg-accent-cyan/20 border border-accent-cyan/30 rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-white whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs text-white/40 mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-accent-cyan">U</span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message bubble (left-aligned)
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex items-start gap-3">
        {/* AI avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">AI</span>
        </div>

        <div className="flex-1 space-y-3">
          {/* Message content */}
          <div className="glass-card p-4 rounded-2xl rounded-tl-sm">
            {message.content ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-white/90 mb-3 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-accent-cyan">{children}</em>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 text-white/80">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 text-white/80">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-white/80">{children}</li>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Inline citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                    {message.citations.map((citation, index) => (
                      <CitationBadge
                        key={index}
                        sectionNumber={citation.sectionNumber}
                        pageNumber={citation.pageNumber}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <LoadingDots />
            )}

            {/* Timestamp */}
            {message.content && (
              <p className="text-xs text-white/40 mt-3">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Benefits cards */}
          {message.benefits && message.benefits.length > 0 && (
            <div className="space-y-2">
              {message.benefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </div>
          )}

          {/* Follow-up suggestions */}
          {message.followUpQuestions && message.followUpQuestions.length > 0 && (
            <FollowUpSuggestions
              questions={message.followUpQuestions}
              onSelect={handleFollowUpSelect}
              disabled={isStreaming}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
