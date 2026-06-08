import React, { useCallback } from "react";
import {
  BookOpen,
  Bot,
  PenLine,
  Headphones,
  Presentation,
  FileText,
  Play,
  ClipboardCheck,
  FolderDown,
  Bookmark,
  BarChart3,
  MonitorPlay,
  Menu,
  X,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { useWidgetContext } from "./WidgetContext";
import type { WidgetFeatureId } from "./ModuleFeatureManager";

/* ── Icon map ── */
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Bot,
  PenLine,
  Headphones,
  Presentation,
  FileText,
  Play,
  ClipboardCheck,
  FolderDown,
  Bookmark,
  BarChart3,
  MonitorPlay,
  Cpu,
};

export default function WidgetDock() {
  const { features, activeTab, setActiveTab, isMenuOpen, toggleMenu, isExpanded, viewport } =
    useWidgetContext();

  const handleIconClick = useCallback(
    (featureId: WidgetFeatureId) => {
      setActiveTab(featureId);
      // Optional: auto-close menu after selecting on mobile
      if (viewport === "mobile") {
        toggleMenu();
      }
    },
    [setActiveTab, viewport, toggleMenu]
  );

  // We place the dock in the bottom right corner as a FAB.
  // We use pointer-events-none on the container so it doesn't block clicks,
  // and pointer-events-auto on the interactive elements.
  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-0 z-[62] flex flex-col items-end gap-4 pointer-events-none">
      {/* Floating Menu */}
      {isMenuOpen && (
        <div 
          className="mr-6 bg-[#f8f1e6]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#4a4845]/10 p-2 flex flex-col gap-1 pointer-events-auto origin-bottom-right"
          style={{ animation: 'widget-panel-enter 0.2s cubic-bezier(0.32, 0.72, 0, 1) forwards' }}
        >
          {features.map((feature) => {
            const Icon = ICON_MAP[feature.icon];
            const isActive = activeTab === feature.id && isExpanded;

            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleIconClick(feature.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-52 text-left
                  ${isActive
                    ? "text-[#bf2f1f] bg-[#bf2f1f]/10 shadow-[0_0_8px_rgba(191,47,31,0.1)] font-bold"
                    : "text-[#000000] hover:bg-[#4a4845]/5 font-semibold"
                  }`}
                aria-label={feature.tooltip}
              >
                {Icon && <Icon size={20} className={isActive ? "text-[#bf2f1f]" : "text-[#4a4845]"} />}
                <span className="text-sm tracking-wide">
                  {feature.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* FAB Trigger Button */}
      <button
        type="button"
        onClick={toggleMenu}
        className={`
          h-14 bg-[#bf2f1f] text-white shadow-[0_4px_20px_rgba(191,47,31,0.4)] flex items-center pointer-events-auto transition-all duration-300 ease-out
          ${isMenuOpen 
            ? "w-14 rounded-full justify-center mr-6 hover:bg-[#a02619] hover:shadow-[0_6px_24px_rgba(191,47,31,0.5)] active:scale-95" 
            : "w-16 rounded-l-2xl justify-start pl-2 translate-x-8 hover:translate-x-0 opacity-70 hover:opacity-100 hover:bg-[#a02619]"
          }
        `}
        aria-label={isMenuOpen ? "Close menu" : "Open features"}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}

