import React, { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { BookOpen, Check } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  h1: (props) => (
    <h1 data-tts-segment className="text-xl font-black text-[#1c242c] mb-4 tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2
      data-tts-segment
      className="text-lg font-bold text-[#bf2f1f] mt-6 mb-3 border-l-3 border-[#bf2f1f] pl-2.5"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 data-tts-segment className="text-base font-semibold text-[#1e3a47] mt-4 mb-2 uppercase tracking-wide" {...props} />
  ),
  p: (props) => (
    <p data-tts-segment className="text-sm leading-6 text-[#2c3e50] mb-3" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc marker:text-[#bf2f1f] pl-5 space-y-1.5 text-[#2c3e50] text-sm" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-5 space-y-1.5 text-[#2c3e50] text-sm" {...props} />
  ),
  li: (props) => <li data-tts-segment className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      data-tts-segment
      className="border-l-3 border-[#bf2f1f]/50 bg-white/80 rounded-r-xl px-3 py-2 text-[#4a4845] italic text-sm shadow-sm"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-[#111827]" {...props} />,
  em: (props) => <em className="italic text-[#374151]" {...props} />,
  code: (props) => (
    <code className="text-xs bg-[#f3ede4] px-1.5 py-0.5 rounded text-[#bf2f1f]" {...props} />
  ),
};

const resolveTextVariant = (data: Record<string, unknown> | undefined) => {
  if (!data) return "";
  const variants =
    typeof data.variants === "object" && data.variants
      ? (data.variants as Record<string, unknown>)
      : null;
  const fromVariants =
    variants && typeof variants.default === "string"
      ? (variants.default as string)
      : variants && typeof variants.normal === "string"
        ? (variants.normal as string)
        : variants
          ? (Object.values(variants).find((value) => typeof value === "string") as string | undefined)
          : null;
  const content = typeof data.content === "string" && data.content ? data.content : undefined;
  const markdown = typeof data.markdown === "string" && data.markdown ? data.markdown : undefined;
  const text = typeof data.text === "string" && data.text ? data.text : undefined;
  return (fromVariants ?? content ?? markdown ?? text ?? "").trim();
};

interface StudyMaterialViewerProps {
  autoStartTts?: boolean;
  formattedStudyText?: string;
  onToggleTts?: () => void;
  ttsStatus?: "idle" | "playing" | "paused" | "unavailable";
  onComplete?: () => void;
}

export default function StudyMaterialViewer({
  formattedStudyText: externalText,
  onToggleTts,
  ttsStatus = "idle",
  autoStartTts = false,
  onComplete,
}: StudyMaterialViewerProps) {
  const { activeLesson, activeTab, completedFeatures } = useWidgetContext();
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const wasPlayingRef = React.useRef(false);

  const isCompleted = activeTab ? completedFeatures.includes(activeTab) : false;

  // Track Audio completion
  React.useEffect(() => {
    if (ttsStatus === "playing") {
      wasPlayingRef.current = true;
    } else if (ttsStatus === "idle" && wasPlayingRef.current) {
      wasPlayingRef.current = false;
      if (activeTab === "listen") {
        onComplete?.();
      }
    }
  }, [ttsStatus, onComplete, activeTab]);

  // Track Reading completion automatically with a 3-second dwell time at the bottom
  React.useEffect(() => {
    if (activeTab !== "study" && activeTab !== "analogy") return;
    const el = bottomRef.current;
    if (!el) return;

    let hasIntersected = false;
    let timer: number;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (!hasIntersected) {
            hasIntersected = true;
            timer = window.setTimeout(() => {
              onComplete?.();
            }, 3000);
          }
        } else {
          hasIntersected = false;
          window.clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [onComplete, activeTab]);

  const studyText = useMemo(() => {
    return externalText || activeLesson?.textContent?.trim() || "";
  }, [externalText, activeLesson?.textContent]);

  const blocks = useMemo(() => {
    const raw = studyText.trim();
    if (raw.startsWith("{") && raw.endsWith("}")) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
          // If valid JSON blocks format, ALWAYS return it, even if empty.
          // This prevents it from falling back to raw markdown text rendering for JSON strings.
          return parsed.blocks as any[];
        }
      } catch (e) {
        // Fall back to null
      }
    }
    return null;
  }, [studyText]);

  // If blocks is an array but contains no resolvable text or image, treat it as empty.
  const hasEmptyBlocks = useMemo(() => {
    if (!blocks) return false;
    return !blocks.some(
      (b: any) =>
        (b.type === "text" && resolveTextVariant(b.data)) || b.type === "image"
    );
  }, [blocks]);

  // Signal to CoursePlayerPage that widget study content is now mounted
  // so it can re-build TTS segments from the newly-rendered DOM.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("widget-study-mounted"));
    }, 100);
    return () => {
      window.clearTimeout(timer);
      window.dispatchEvent(new CustomEvent("widget-study-unmounted"));
    };
  }, [studyText]);

  if (!studyText || hasEmptyBlocks) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#4a4845]/8 flex items-center justify-center mb-3">
          <BookOpen size={24} className="text-[#4a4845]/40" />
        </div>
        <p className="text-sm font-semibold text-[#000000]/70">No study material</p>
        <p className="text-xs text-[#4a4845]/60 mt-1">
          This lesson doesn't have reading content yet.
        </p>
      </div>
    );
  }

  return (
    <div id="widget-study-content" className="p-4 space-y-4 flex-1 overflow-y-auto min-h-0">
      {/* TTS Control */}
      {onToggleTts && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onToggleTts}
            disabled={ttsStatus === "unavailable"}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all
              ${ttsStatus === "playing"
                ? "bg-[#bf2f1f] text-white border-[#bf2f1f] shadow-sm"
                : "bg-white text-[#1c242c] border-[#e8e1d8] hover:border-[#bf2f1f] hover:text-[#bf2f1f]"
              }
              ${ttsStatus === "unavailable" ? "opacity-40 cursor-not-allowed" : ""}
            `}
          >
            {ttsStatus === "playing" ? "⏸ Pause" : ttsStatus === "paused" ? "▶ Resume" : "🎧 Listen"}
          </button>
        </div>
      )}

      {/* Study Content */}
      <div className="space-y-4">
        {blocks ? (
          blocks.map((block, index) => {
            const key = block.id || `${block.type}-${index}`;
            const data = block.data;
            if (block.type === "text") {
              const textContent = resolveTextVariant(data);
              if (!textContent) return null;
              return (
                <div key={key} className="rounded-2xl border border-[#000000]/10 bg-white shadow-sm p-4 prose prose-sm max-w-none text-[#1e293b]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={markdownComponents}
                  >
                    {textContent}
                  </ReactMarkdown>
                </div>
              );
            }
            if (block.type === "image") {
              const url = typeof data?.url === "string" ? data.url.trim() : "";
              if (!url) return null;
              const alt = typeof data?.alt === "string" ? data.alt.trim() : "Lesson visual";
              const caption = typeof data?.caption === "string" ? data.caption.trim() : "";
              return (
                <figure key={key} className="rounded-2xl border border-[#000000]/10 bg-white overflow-hidden shadow-sm">
                  <img src={url} alt={alt} className="w-full object-cover" loading="lazy" />
                  {caption && (
                    <figcaption className="px-4 py-2.5 text-xs text-[#4a4845] bg-[#f8f1e6]/60 border-t border-[#f2ebe0]">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            return null;
          })
        ) : (
          <div className="rounded-2xl border border-[#000000]/8 bg-white shadow-sm p-4 prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={markdownComponents}
            >
              {studyText}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Lesson context */}
      {activeLesson?.topicName && (
        <p className="text-[10px] text-[#4a4845]/50 text-center">
          Companion reading for "{activeLesson.topicName}"
        </p>
      )}

      {/* Sentinel for reading completion tracking */}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
