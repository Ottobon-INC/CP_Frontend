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

export default function MediaPlayer({ onComplete }: { onComplete?: () => void }) {
  const { activeLesson } = useWidgetContext();
  const [activeVideoIndex, setActiveVideoIndex] = React.useState(0);

  // Reset active video index when activeLesson changes
  React.useEffect(() => {
    setActiveVideoIndex(0);
  }, [activeLesson?.topicId]);

  const videos = useMemo(() => {
    return activeLesson?.videos ?? [];
  }, [activeLesson?.videos]);

  const currentVideo = useMemo(() => {
    if (videos.length > 0) {
      return videos[activeVideoIndex] ?? videos[0];
    }
    return activeLesson?.videoUrl ? { url: activeLesson.videoUrl } : null;
  }, [videos, activeVideoIndex, activeLesson?.videoUrl]);

  const videoUrl = useMemo(() => {
    const url = normalizeVideoUrl(currentVideo?.url);
    if (!url) return null;
    if (isYouTubeUrl(url)) {
      try {
        const u = new URL(url);
        u.searchParams.set("enablejsapi", "1");
        return u.toString();
      } catch {
        return url;
      }
    }
    return url;
  }, [currentVideo?.url]);

  const isYoutube = useMemo(() => isYouTubeUrl(videoUrl), [videoUrl]);

  // Track YouTube completion
  React.useEffect(() => {
    if (!isYoutube) return;
    const handleMessage = (e: MessageEvent) => {
      if (!e.origin.includes("youtube.com") && !e.origin.includes("youtu.be")) return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data && data.event === "onStateChange" && data.info === 0) {
          // YouTube video ended
          onComplete?.();
        }
      } catch (err) {
        // Ignore JSON parse errors
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isYoutube, onComplete]);

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
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[#4a4845]">
          <Play size={14} className="text-[#bf2f1f]" />
          <span className="text-xs font-semibold">Media Player (Videos: {videos.length})</span>
        </div>
        {currentVideo?.url && (
          <a
            href={currentVideo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-[#4a4845]/10 text-[#4a4845]/60 hover:text-[#000000] transition"
            title="Open in new tab"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* Video Selector if there are multiple videos */}
      {videos.length > 1 && (
        <div className="flex flex-wrap gap-2 pb-2 border-b border-[#e8e1d8] shrink-0">
          {videos.map((vid, idx) => {
            const isActive = idx === activeVideoIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveVideoIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-[#bf2f1f] text-white border-[#bf2f1f] shadow-[0_2px_8px_rgba(191,47,31,0.25)]"
                    : "bg-white text-[#4a4845] border-[#e8e1d8] hover:bg-[#f8f1e6] hover:text-[#bf2f1f]"
                }`}
              >
                {vid.title || `Video ${idx + 1}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Player */}
      <div className="flex-1 rounded-xl border border-[#e8e1d8] bg-black overflow-hidden shadow-sm relative min-h-0">
        {isYoutube ? (
          <iframe
            key={videoUrl}
            className="absolute inset-0 w-full h-full border-0"
            src={videoUrl}
            title={currentVideo?.title ?? activeLesson?.topicName ?? "Lesson media"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            key={videoUrl}
            className="absolute inset-0 w-full h-full"
            controls
            playsInline
            preload="metadata"
            title={currentVideo?.title ?? activeLesson?.topicName ?? "Lesson media"}
            onEnded={() => onComplete?.()}
          >
            <source src={videoUrl} />
          </video>
        )}
      </div>

      {(currentVideo?.title || activeLesson?.topicName) && (
        <p className="text-[11px] text-[#4a4845]/70 font-medium truncate shrink-0">
          {currentVideo?.title || activeLesson?.topicName}
        </p>
      )}
      <div className="text-[9px] text-gray-400 shrink-0 font-mono">
        DEBUG URLs ({videos.length}): {videos.map(v => v.url.slice(-15)).join(", ")}
      </div>
    </div>
  );
}
