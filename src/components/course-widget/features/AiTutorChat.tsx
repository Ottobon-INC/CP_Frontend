import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  error?: boolean;
}

interface PromptSuggestion {
  id: string;
  promptText: string;
}

interface AiTutorChatProps {
  /** Existing chat messages from the course player */
  messages?: ChatMessage[];
  /** Input value */
  inputValue?: string;
  /** On input change */
  onInputChange?: (value: string) => void;
  /** Send handler */
  onSend?: (options?: { suggestion?: PromptSuggestion }) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Loading message text */
  loadingMessage?: string;
  /** Starter suggestions */
  starterSuggestions?: PromptSuggestion[];
  /** Whether suggestions are loading */
  suggestionsLoading?: boolean;
  /** Follow-up suggestions keyed by message ID */
  inlineFollowUps?: Record<string, PromptSuggestion[]>;
  /** ID of the message to anchor starter suggestions to */
  starterAnchorMessageId?: string | null;
  /** Whether chat history is currently loading */
  isHistoryLoading?: boolean;
}

export default function AiTutorChat({
  messages = [],
  inputValue = "",
  onInputChange,
  onSend,
  isLoading = false,
  loadingMessage = "Thinking...",
  starterSuggestions = [],
  suggestionsLoading = false,
  inlineFollowUps = {},
  starterAnchorMessageId = null,
  isHistoryLoading = false,
}: AiTutorChatProps) {
  const { activeLesson } = useWidgetContext();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localInput, setLocalInput] = useState("");

  const currentInput = onInputChange ? inputValue : localInput;
  const handleInputChange = onInputChange ?? setLocalInput;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages.length, isLoading]);

  const handleSend = useCallback(() => {
    if (!currentInput.trim() || isLoading) return;
    onSend?.();
    if (!onInputChange) setLocalInput("");
  }, [currentInput, isLoading, onSend, onInputChange]);

  const handleSuggestionClick = useCallback(
    (suggestion: PromptSuggestion) => {
      if (isLoading) return;
      onSend?.({ suggestion });
    },
    [isLoading, onSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const displayMessages = messages.length > 0 ? messages : [
    {
      id: "welcome",
      text: activeLesson
        ? `Learning about "${activeLesson.topicName}"? I can help with summaries, explanations, or practice questions.`
        : "Hi! Ask me anything about this course.",
      isBot: true,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 widget-scrollbar"
      >
        {isHistoryLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#bf2f1f] border-t-transparent"></div>
          </div>
        ) : (
          displayMessages.map((msg) => {
            const showThinking = msg.isBot && isLoading && !msg.error && msg.text.trim().length === 0;
          const followUps = inlineFollowUps[msg.id] ?? [];

          return (
            <div key={msg.id} className="space-y-1.5">
              <div
                className={`rounded-xl px-3 py-2 text-[13px] leading-relaxed transition-all
                  ${msg.isBot
                    ? "bg-white border border-[#e8e1d8] text-[#1f2937] shadow-sm"
                    : "bg-[#bf2f1f]/10 border border-[#bf2f1f]/20 text-[#000000] ml-6"
                  }
                  ${msg.error ? "border-red-300 bg-red-50 text-red-700" : ""}
                `}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {msg.isBot ? (
                    <Bot size={12} className="text-[#bf2f1f]" />
                  ) : null}
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#4a4845]/50">
                    {msg.isBot ? "Tutor" : "You"}
                  </span>
                </div>

                {showThinking ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#bf2f1f]">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#bf2f1f]/40 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#bf2f1f]" />
                      </span>
                      <span>{loadingMessage}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 140, 280, 420].map((delay) => (
                        <span
                          key={delay}
                          className="h-1.5 w-1.5 rounded-full bg-[#bf2f1f]"
                          style={{
                            animation: `pulse 1.1s ease-in-out ${delay}ms infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line">{msg.text}</div>
                )}
              </div>

              {/* Follow-up / Starter suggestions inline */}
              {(followUps.length > 0 || (msg.id === starterAnchorMessageId && starterSuggestions.length > 0)) && !isLoading && (
                <div className="pl-2 space-y-1.5 mt-2">
                  <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#4a4845]/50 font-semibold">
                    <Sparkles size={10} />
                    <span>{msg.id === starterAnchorMessageId ? "Suggested questions" : "More to explore"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(msg.id === starterAnchorMessageId ? starterSuggestions : followUps).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-[#bf2f1f]/20 bg-white text-[#bf2f1f] hover:bg-[#bf2f1f] hover:text-white transition-all disabled:opacity-40 shadow-sm"
                      >
                        {s.promptText}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }))}
      </div>



      {/* Suggestion skeleton */}
      {suggestionsLoading && (
        <div className="px-3 py-2 border-t border-[#e8e1d8]/60 space-y-1.5">
          <div className="widget-skeleton h-6 w-48" />
          <div className="widget-skeleton h-6 w-56" />
          <div className="widget-skeleton h-6 w-40" />
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#e8e1d8]/60 bg-white/60 flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-white border border-[#e8e1d8] rounded-xl px-3 py-2 text-[13px] text-[#000000] placeholder:text-[#4a4845]/40 focus:outline-none focus:border-[#bf2f1f] focus:ring-1 focus:ring-[#bf2f1f]/20 transition-all"
          placeholder="Ask the AI Tutor..."
          value={currentInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !currentInput.trim()}
          className="p-2 rounded-xl bg-[#bf2f1f] text-white hover:bg-[#a62619] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
