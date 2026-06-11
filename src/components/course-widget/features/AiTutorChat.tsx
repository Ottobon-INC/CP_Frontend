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
    <div className="flex flex-col h-full bg-[#0f0f0f] text-[#f8f1e6]/80 overflow-hidden">
      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 widget-scrollbar"
      >
        {isHistoryLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#ff5a3c] border-t-transparent"></div>
          </div>
        ) : (
          displayMessages.map((msg) => {
            const showThinking = msg.isBot && isLoading && !msg.error && msg.text.trim().length === 0;
            const followUps = inlineFollowUps[msg.id] ?? [];

            return (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`p-3 rounded-xl ${
                    msg.isBot 
                      ? "bg-white/5 border border-white/10" 
                      : "bg-[#bf2f1f]/20 border border-[#bf2f1f]/40"
                  } ${msg.error ? "border-red-500/60 text-red-200" : ""}`}
                >
                  <div className="text-[11px] uppercase tracking-wide opacity-70 mb-1.5 font-semibold">
                    {msg.isBot ? "Tutor" : "You"}
                  </div>
                  
                  {showThinking ? (
                    <div className="mt-1 rounded-lg border border-[#bf2f1f]/30 bg-gradient-to-br from-[#1a0b09] via-[#100809] to-[#070707] p-3 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-[#f8f1e6]/90 font-medium">
                        <span className="relative flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-[#ff5a3c]/50 animate-ping" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ff5a3c]" />
                        </span>
                        <span>{loadingMessage}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#ff5a3c] animate-[pulse_1.1s_ease-in-out_infinite] [animation-delay:0ms] shadow-[0_0_8px_rgba(255,90,60,0.65)]" />
                        <span className="h-2 w-2 rounded-full bg-[#ff5a3c] animate-[pulse_1.1s_ease-in-out_infinite] [animation-delay:140ms] shadow-[0_0_8px_rgba(255,90,60,0.65)]" />
                        <span className="h-2 w-2 rounded-full bg-[#ff5a3c] animate-[pulse_1.1s_ease-in-out_infinite] [animation-delay:280ms] shadow-[0_0_8px_rgba(255,90,60,0.65)]" />
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-[13px] leading-relaxed text-[#f8f1e6]/90">
                      {msg.text}
                    </div>
                  )}
                </div>

                {/* Follow-up / Starter suggestions inline */}
                {(followUps.length > 0 || (msg.id === starterAnchorMessageId && starterSuggestions.length > 0)) && !isLoading && (
                  <div className="pl-3 border-l border-white/10 ml-2 space-y-2 mt-2">
                    <div className="text-[10px] uppercase tracking-wide text-[#f8f1e6]/60">
                      {msg.id === starterAnchorMessageId ? "Curious about this topic? Choose one to get started." : "More to explore"}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(msg.id === starterAnchorMessageId ? starterSuggestions : followUps).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSuggestionClick(s)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                            isLoading
                              ? "opacity-40 cursor-not-allowed border-[#4a4845]/40 text-[#f8f1e6]/40"
                              : "border-white/25 text-white/80 hover:border-white hover:text-white"
                          }`}
                        >
                          {s.promptText}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Suggestion skeleton */}
      {suggestionsLoading && (
        <div className="p-3 bg-white/5 border-t border-[#4a4845]/30 space-y-2">
          <div className="widget-skeleton h-6 w-48 bg-white/10" />
          <div className="widget-skeleton h-6 w-56 bg-white/10" />
          <div className="widget-skeleton h-6 w-40 bg-white/10" />
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#bf2f1f]/20 bg-[#111] flex gap-2 items-center">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-[#1a1a1a] border border-[#bf2f1f]/30 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#bf2f1f] transition-colors"
          placeholder="Ask AI..."
          value={currentInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !currentInput.trim()}
          className="p-2 disabled:opacity-40 hover:bg-[#bf2f1f]/10 rounded-lg transition-colors"
        >
          <Send size={16} className="text-[#bf2f1f]" />
        </button>
      </div>
    </div>
  );
}
