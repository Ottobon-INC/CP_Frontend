import React, { useState, useMemo } from "react";
import { MonitorPlay, ChevronLeft, PlayCircle, Lock } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";
import type { WidgetLesson } from "../WidgetContext";

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

export default function VideoGalleryPanel() {
  const { allLessons } = useWidgetContext();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const videos = useMemo(() => {
    return allLessons.filter(l => Boolean(l.videoUrl?.trim()));
  }, [allLessons]);

  const activeVideoLesson = useMemo(() => {
    if (selectedVideoId) {
      return videos.find(v => v.topicId === selectedVideoId) ?? null;
    }
    return null;
  }, [selectedVideoId, videos]);

  const activeVideoUrl = useMemo(() => {
    return normalizeVideoUrl(activeVideoLesson?.videoUrl);
  }, [activeVideoLesson]);

  const isYoutube = useMemo(() => isYouTubeUrl(activeVideoUrl), [activeVideoUrl]);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#4a4845]/8 flex items-center justify-center mb-3">
          <MonitorPlay size={24} className="text-[#4a4845]/40" />
        </div>
        <p className="text-sm font-semibold text-[#000000]/70">No Videos Available</p>
        <p className="text-xs text-[#4a4845]/60 mt-1">
          There are no videos available in this course.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e8e1d8] pb-3 px-4 pt-4 shrink-0">
        {activeVideoLesson ? (
          <button 
            onClick={() => setSelectedVideoId(null)}
            className="flex items-center gap-2 text-[#4a4845] hover:text-[#000000] font-semibold transition"
          >
            <ChevronLeft size={16} />
            <span className="text-xs sm:text-sm">Back to Gallery</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-[#4a4845]">
            <MonitorPlay size={16} className="text-[#bf2f1f]" />
            <span className="text-xs sm:text-sm font-semibold text-[#000000]">Course Videos ({videos.length})</span>
          </div>
        )}
      </div>

      {activeVideoLesson && activeVideoUrl ? (
        /* ── Video Player View ── */
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 min-h-0">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Video Player */}
            <div className="rounded-xl border border-[#e8e1d8] bg-black overflow-hidden shadow-lg">
              <div className="aspect-video w-full relative">
                {isYoutube ? (
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    src={`${activeVideoUrl}?autoplay=1`}
                    title={activeVideoLesson.topicName}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="absolute inset-0 w-full h-full"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    title={activeVideoLesson.topicName}
                  >
                    <source src={activeVideoUrl} />
                  </video>
                )}
              </div>
            </div>

            {/* Lesson Info Card */}
            <div className="bg-white rounded-xl border border-[#e8e1d8] p-5 shadow-sm">
              <span className="inline-block text-[10px] font-bold text-[#bf2f1f] tracking-widest uppercase bg-[#bf2f1f]/8 px-2.5 py-1 rounded-full mb-2">
                Module {activeVideoLesson.moduleNo}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-[#000000] leading-snug">
                {activeVideoLesson.topicName}
              </h2>
            </div>
          </div>
        </div>
      ) : (
        /* ── Gallery Grid View ── */
        <div className="flex-1 overflow-y-auto min-h-0 p-4 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((v) => {
              const isLocked = v.unlocked === false;
              return (
              <button
                key={v.topicId}
                onClick={() => !isLocked && setSelectedVideoId(v.topicId)}
                disabled={isLocked}
                className={`group flex flex-col text-left rounded-xl border bg-white overflow-hidden shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#bf2f1f]/50
                  ${isLocked ? "border-[#e8e1d8]/50 opacity-70 cursor-not-allowed" : "border-[#e8e1d8] hover:shadow-md hover:border-[#4a4845]/30"}
                `}
              >
                <div className="aspect-video w-full bg-[#111] relative flex items-center justify-center overflow-hidden">
                  {isLocked ? (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <Lock size={24} className="text-white/80 mb-2" />
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Locked</span>
                    </div>
                  ) : (
                    <>
                      <PlayCircle size={40} className="text-white/60 group-hover:text-white transition-transform transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[10px] font-bold text-[#bf2f1f] mb-1">MODULE {v.moduleNo}</div>
                  <div className="text-sm font-semibold text-[#000000] line-clamp-2 leading-tight">
                    {v.topicName}
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
