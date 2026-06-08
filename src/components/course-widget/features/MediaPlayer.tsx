import React, { useMemo } from "react";
import { Play, ExternalLink } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

const normalizeVideoUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const toEmbed = (id: string | null) =>
      id ? `https://www.youtube.com/embed/${id}` : trimmed;
    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/"))
        return `https://www.youtube.com${parsed.pathname}`;
      if (parsed.pathname === "/watch") return toEmbed(parsed.searchParams.get("v"));
      if (parsed.pathname.startsWith("/shorts/"))
        return toEmbed(parsed.pathname.split("/").pop() ?? null);
    }
    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\/+/, "");
      return toEmbed(id || null);
    }
    return trimmed;
  } catch {
    return trimmed;
  }
};

const isYouTubeUrl = (url?: string | null) => {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("youtube.com") || host === "youtu.be";
  } catch {
    return false;
  }
};

export default function MediaPlayer() {
  const { activeLesson } = useWidgetContext();

  const videoUrl = useMemo(
    () => normalizeVideoUrl(activeLesson?.videoUrl),
    [activeLesson?.videoUrl]
  );

  const isYoutube = useMemo(() => isYouTubeUrl(videoUrl), [videoUrl]);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#4a4845]/8 flex items-center justify-center mb-3">
          <Play size={24} className="text-[#4a4845]/40" />
        </div>
        <p className="text-sm font-semibold text-[#000000]/70">No media available</p>
        <p className="text-xs text-[#4a4845]/60 mt-1">
          This lesson doesn't have a video or audio file.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#4a4845]">
          <Play size={14} className="text-[#bf2f1f]" />
          <span className="text-xs font-semibold">Media Player</span>
        </div>
        {activeLesson?.videoUrl && (
          <a
            href={activeLesson.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-[#4a4845]/10 text-[#4a4845]/60 hover:text-[#000000] transition"
            title="Open in new tab"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Player */}
      <div className="flex-1 rounded-xl border border-[#e8e1d8] bg-black overflow-hidden shadow-sm relative min-h-0">
        {isYoutube ? (
          <iframe
            className="absolute inset-0 w-full h-full border-0"
            src={videoUrl}
            title={activeLesson?.topicName ?? "Lesson media"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="absolute inset-0 w-full h-full"
            controls
            playsInline
            preload="metadata"
            title={activeLesson?.topicName ?? "Lesson media"}
          >
            <source src={videoUrl} />
          </video>
        )}
      </div>

      {activeLesson?.topicName && (
        <p className="text-[11px] text-[#4a4845]/70 font-medium truncate">
          {activeLesson.topicName}
        </p>
      )}
    </div>
  );
}
