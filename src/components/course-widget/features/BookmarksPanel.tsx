import React, { useCallback, useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Trash2, ExternalLink } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

const STORAGE_KEY = "ottolearn:bookmarks:v1";

interface BookmarkEntry {
  topicId: string;
  courseKey: string;
  topicName: string;
  moduleNo: number;
  slug: string;
  createdAt: string;
}

function loadBookmarks(): BookmarkEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: BookmarkEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    /* storage full */
  }
}

export default function BookmarksPanel() {
  const { activeLesson, courseKey } = useWidgetContext();
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>(loadBookmarks);

  // Refresh on mount
  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  const courseBookmarks = bookmarks.filter(
    (b) => b.courseKey === courseKey
  );

  const isCurrentBookmarked = courseBookmarks.some(
    (b) => b.topicId === activeLesson?.topicId
  );

  const toggleBookmark = useCallback(() => {
    if (!activeLesson || !courseKey) return;

    setBookmarks((prev) => {
      const existing = prev.findIndex(
        (b) => b.topicId === activeLesson.topicId && b.courseKey === courseKey
      );

      let next: BookmarkEntry[];
      if (existing >= 0) {
        next = [...prev];
        next.splice(existing, 1);
      } else {
        next = [
          ...prev,
          {
            topicId: activeLesson.topicId,
            courseKey,
            topicName: activeLesson.topicName,
            moduleNo: activeLesson.moduleNo,
            slug: activeLesson.slug,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      saveBookmarks(next);
      return next;
    });
  }, [activeLesson, courseKey]);

  const removeBookmark = useCallback((topicId: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.topicId !== topicId);
      saveBookmarks(next);
      return next;
    });
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Bookmark current lesson */}
      {activeLesson && (
        <button
          type="button"
          onClick={toggleBookmark}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all
            ${isCurrentBookmarked
              ? "border-[#bf2f1f]/30 bg-[#bf2f1f]/5 text-[#bf2f1f]"
              : "border-[#e8e1d8] bg-white hover:border-[#bf2f1f]/30 text-[#4a4845]"
            }
          `}
        >
          {isCurrentBookmarked ? (
            <BookmarkCheck size={18} className="text-[#bf2f1f]" />
          ) : (
            <Bookmark size={18} />
          )}
          <div className="flex-1 text-left min-w-0">
            <p className="text-[12px] font-semibold truncate">
              {isCurrentBookmarked ? "Bookmarked" : "Bookmark this lesson"}
            </p>
            <p className="text-[10px] opacity-60 truncate">
              {activeLesson.topicName}
            </p>
          </div>
        </button>
      )}

      {/* Saved bookmarks list */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#4a4845]/50 font-semibold">
            Saved ({courseBookmarks.length})
          </span>
        </div>

        {courseBookmarks.length === 0 ? (
          <div className="text-center py-6">
            <Bookmark size={20} className="mx-auto text-[#4a4845]/20 mb-2" />
            <p className="text-xs text-[#4a4845]/50">No bookmarks yet</p>
            <p className="text-[10px] text-[#4a4845]/40 mt-0.5">
              Bookmark lessons to quickly find them later
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {courseBookmarks.map((bm) => {
              const isCurrent = bm.topicId === activeLesson?.topicId;
              return (
                <div
                  key={bm.topicId}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all group
                    ${isCurrent
                      ? "border-[#bf2f1f]/20 bg-[#bf2f1f]/5"
                      : "border-[#e8e1d8]/60 hover:border-[#4a4845]/20"
                    }
                  `}
                >
                  <BookmarkCheck size={13} className="text-[#bf2f1f]/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[#000000] truncate">
                      {bm.topicName}
                    </p>
                    <p className="text-[9px] text-[#4a4845]/50">
                      Module {bm.moduleNo}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBookmark(bm.topicId)}
                    className="p-1 rounded hover:bg-red-50 text-[#4a4845]/30 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                    title="Remove bookmark"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
