import React, { useCallback, useEffect, useRef, useState } from "react";
import { PenLine, Save, Download, Trash2 } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

const STORAGE_PREFIX = "ottolearn:notes:v1";

function buildStorageKey(courseKey: string | null, topicId: string | null): string {
  return `${STORAGE_PREFIX}:${courseKey ?? "unknown"}:${topicId ?? "global"}`;
}

function readNote(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function saveNote(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage full — silently ignore */
  }
}

export default function NotesEditor() {
  const { activeLesson, courseKey } = useWidgetContext();
  const topicId = activeLesson?.topicId ?? null;
  const storageKey = buildStorageKey(courseKey, topicId);

  const [text, setText] = useState(() => readNote(storageKey));
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reload text when lesson changes
  useEffect(() => {
    setText(readNote(storageKey));
    setLastSaved(null);
  }, [storageKey]);

  // Auto-save with debounce
  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setIsSaving(true);
        saveNote(storageKey, value);
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 600);
      }, 800);
    },
    [storageKey]
  );

  // Manual save
  const handleSave = useCallback(() => {
    saveNote(storageKey, text);
    setLastSaved(new Date());
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 600);
  }, [storageKey, text]);

  // Export as text file
  const handleExport = useCallback(() => {
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${activeLesson?.topicName?.replace(/\s+/g, "-").toLowerCase() ?? "lesson"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [text, activeLesson?.topicName]);

  // Clear notes
  const handleClear = useCallback(() => {
    setText("");
    saveNote(storageKey, "");
    setLastSaved(new Date());
  }, [storageKey]);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e8e1d8]/60 bg-white/40">
        <div className="flex items-center gap-1.5 text-[10px] text-[#4a4845]/60">
          <PenLine size={12} />
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            className="p-1.5 rounded-lg hover:bg-[#4a4845]/10 text-[#4a4845]/60 hover:text-[#000000] transition"
            title="Save"
          >
            <Save size={13} />
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!text.trim()}
            className="p-1.5 rounded-lg hover:bg-[#4a4845]/10 text-[#4a4845]/60 hover:text-[#000000] transition disabled:opacity-30"
            title="Export as .txt"
          >
            <Download size={13} />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!text.trim()}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#4a4845]/60 hover:text-red-500 transition disabled:opacity-30"
            title="Clear notes"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Topic indicator */}
      {activeLesson?.topicName && (
        <div className="px-3 py-1.5 bg-[#bf2f1f]/5 border-b border-[#bf2f1f]/10">
          <p className="text-[10px] text-[#bf2f1f]/70 font-semibold truncate">
            📌 {activeLesson.topicName}
          </p>
        </div>
      )}

      {/* Editor */}
      <textarea
        className="flex-1 p-4 bg-transparent resize-none text-[13px] text-[#000000] leading-relaxed focus:outline-none font-sans placeholder:text-[#4a4845]/30"
        placeholder="Start typing your notes here...

Tips:
• Summarize key takeaways
• Write questions to review later
• Note important concepts and examples"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck
      />

      {/* Status bar */}
      <div className="px-3 py-1.5 border-t border-[#e8e1d8]/60 bg-white/30 flex items-center justify-between">
        <span className="text-[9px] text-[#4a4845]/40">
          {isSaving
            ? "💾 Saving..."
            : lastSaved
              ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Auto-saves as you type"}
        </span>
        <span className="text-[9px] text-[#4a4845]/30">
          Stored locally
        </span>
      </div>
    </div>
  );
}
