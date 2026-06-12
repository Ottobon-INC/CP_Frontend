import React, { useMemo, useState } from "react";
import { Presentation, ExternalLink, Maximize2, Minimize2, Check } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

const buildOfficeViewerUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(trimmed)}`;
};

export default function PptViewer({ onComplete }: { onComplete?: () => void }) {
  const { activeLesson } = useWidgetContext();

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      onComplete?.();
    }, 10000);
    return () => window.clearTimeout(t);
  }, [onComplete]);

  const blockSlidesUrl = useMemo(() => {
    try {
      const raw = activeLesson?.textContent?.trim() || "";
      if (raw.startsWith("{") && raw.endsWith("}")) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.blocks)) {
          const slidesBlock = parsed.blocks.find((b: any) => b.type === "ppt");
          if (slidesBlock?.data?.url) {
            return slidesBlock.data.url as string;
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }, [activeLesson?.textContent]);

  const embedUrl = useMemo(
    () => buildOfficeViewerUrl(activeLesson?.pptUrl || blockSlidesUrl),
    [activeLesson?.pptUrl, blockSlidesUrl]
  );

  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#4a4845]/8 flex items-center justify-center mb-3">
          <Presentation size={24} className="text-[#4a4845]/40" />
        </div>
        <p className="text-sm font-semibold text-[#000000]/70">No slides available</p>
        <p className="text-xs text-[#4a4845]/60 mt-1">
          This lesson doesn't have a presentation attached.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#4a4845]">
          <Presentation size={14} className="text-[#bf2f1f]" />
          <span className="text-xs font-semibold">Presentation Slides</span>
        </div>
        <div className="flex items-center gap-1">
          {(activeLesson?.pptUrl || blockSlidesUrl) && (
            <a
              href={activeLesson?.pptUrl || blockSlidesUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-[#4a4845]/10 text-[#4a4845]/60 hover:text-[#000000] transition"
              title="Open in new tab"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 rounded-xl border border-[#e8e1d8] bg-white overflow-hidden shadow-sm relative min-h-0">
        <iframe
          title={`Slides for ${activeLesson?.topicName ?? "lesson"}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          referrerPolicy="no-referrer"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[10px] text-[#4a4845]/50 text-center">
          Use the embedded viewer controls to navigate between slides.
        </p>
      </div>
    </div>
  );
}
