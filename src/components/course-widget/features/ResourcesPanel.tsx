import React, { useMemo } from "react";
import { FolderDown, FileText, Video, Presentation as PresentationIcon, ExternalLink } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

interface Resource {
  id: string;
  label: string;
  url: string;
  type: "ppt" | "video" | "document";
  icon: React.ReactNode;
}

export default function ResourcesPanel() {
  const { activeLesson } = useWidgetContext();

  const resources = useMemo<Resource[]>(() => {
    const list: Resource[] = [];

    if (activeLesson?.pptUrl?.trim()) {
      list.push({
        id: "ppt",
        label: "Presentation Slides",
        url: activeLesson.pptUrl.trim(),
        type: "ppt",
        icon: <PresentationIcon size={16} className="text-[#bf2f1f]" />,
      });
    }

    if (activeLesson?.videoUrl?.trim()) {
      list.push({
        id: "video",
        label: "Lesson Video",
        url: activeLesson.videoUrl.trim(),
        type: "video",
        icon: <Video size={16} className="text-[#244855]" />,
      });
    }

    return list;
  }, [activeLesson?.pptUrl, activeLesson?.videoUrl]);

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#4a4845]/8 flex items-center justify-center mb-3">
          <FolderDown size={24} className="text-[#4a4845]/40" />
        </div>
        <p className="text-sm font-semibold text-[#000000]/70">No resources</p>
        <p className="text-xs text-[#4a4845]/60 mt-1">
          This lesson doesn't have downloadable assets yet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FolderDown size={14} className="text-[#bf2f1f]" />
        <span className="text-xs font-semibold text-[#4a4845]">
          Resources ({resources.length})
        </span>
      </div>

      <div className="space-y-2">
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-[#e8e1d8] bg-white hover:border-[#bf2f1f]/30 hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#f8f1e6] flex items-center justify-center shrink-0">
              {resource.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#000000] group-hover:text-[#bf2f1f] transition truncate">
                {resource.label}
              </p>
              <p className="text-[10px] text-[#4a4845]/50 uppercase tracking-wider">
                {resource.type}
              </p>
            </div>
            <ExternalLink
              size={13}
              className="text-[#4a4845]/30 group-hover:text-[#bf2f1f] transition shrink-0"
            />
          </a>
        ))}
      </div>

      <p className="text-[10px] text-[#4a4845]/40 text-center mt-2">
        Click to open in a new tab
      </p>
    </div>
  );
}
