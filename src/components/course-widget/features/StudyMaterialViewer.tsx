import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { BookOpen } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  h1: (props) => (
    <h1 className="text-xl font-black text-[#1c242c] mb-4 tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2
      className="text-lg font-bold text-[#bf2f1f] mt-6 mb-3 border-l-3 border-[#bf2f1f] pl-2.5"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="text-base font-semibold text-[#1e3a47] mt-4 mb-2 uppercase tracking-wide" {...props} />
  ),
  p: (props) => (
    <p className="text-sm leading-6 text-[#2c3e50] mb-3" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc marker:text-[#bf2f1f] pl-5 space-y-1.5 text-[#2c3e50] text-sm" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-5 space-y-1.5 text-[#2c3e50] text-sm" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
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

interface StudyMaterialViewerProps {
  autoStartTts?: boolean;
  formattedStudyText?: string;
  onToggleTts?: () => void;
  ttsStatus?: "idle" | "playing" | "paused" | "unavailable";
}

export default function StudyMaterialViewer({
  formattedStudyText: externalText,
  onToggleTts,
  ttsStatus = "idle",
  autoStartTts = false,
}: StudyMaterialViewerProps) {
  const { activeLesson } = useWidgetContext();

  // Use external formatted text if provided, otherwise fall back to raw lesson textContent
  const studyText = useMemo(() => {
    if (externalText) return externalText;
    const raw = activeLesson?.textContent?.trim();
    return raw || "";
  }, [externalText, activeLesson?.textContent]);

  if (!studyText) {
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
    <div className="p-4 space-y-4">
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
      <div className="rounded-2xl border border-[#000000]/8 bg-white shadow-sm overflow-hidden">
        <div className="p-4 prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={markdownComponents}
          >
            {studyText}
          </ReactMarkdown>
        </div>
      </div>

      {/* Lesson context */}
      {activeLesson?.topicName && (
        <p className="text-[10px] text-[#4a4845]/50 text-center">
          Companion reading for "{activeLesson.topicName}"
        </p>
      )}
    </div>
  );
}
