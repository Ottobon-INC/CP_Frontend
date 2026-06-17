import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useWidgetContext } from "./WidgetContext";

interface WidgetPanelProps {
  children: React.ReactNode;
}

const toPascalCase = (str: string) => {
  if (!str) return "HelpCircle";
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

function getIconComponent(iconName: string): React.ComponentType<any> {
  if (!iconName) return LucideIcons.HelpCircle;
  if (iconName in LucideIcons) {
    return (LucideIcons as any)[iconName];
  }
  const pascal = toPascalCase(iconName);
  if (pascal in LucideIcons) {
    return (LucideIcons as any)[pascal];
  }
  return LucideIcons.HelpCircle;
}

export default function WidgetPanel({ children }: WidgetPanelProps) {
  const { isExpanded, activeTab, features, closeWidget } = useWidgetContext();
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeFeature = features.find((f) => f.id === activeTab) ?? null;
  const ActiveIcon = getIconComponent(activeFeature?.icon ?? "");

  // Handle enter/exit animations
  useEffect(() => {
    if (isExpanded) {
      setVisible(true);
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(t);
    } else {
      setAnimating(true);
      const t = setTimeout(() => {
        setVisible(false);
        setAnimating(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [isExpanded]);

  if (!visible && !isExpanded) return null;

  return (
    <div
      ref={panelRef}
      className={`widget-panel-container flex flex-col w-full h-full overflow-hidden bg-[#f8f1e6]
        ${isExpanded && !animating ? "" : ""}
        ${isExpanded ? "widget-panel-enter" : "widget-panel-exit"}
      `}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#4a4845]/12 bg-white/70 backdrop-blur-xl shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="widget-panel-feature-chip">
            {activeFeature?.avatarUrl ? (
              <img
                src={activeFeature.avatarUrl}
                alt={activeFeature.label}
                className="h-full w-full rounded-[14px] object-cover"
              />
            ) : (
              <ActiveIcon size={18} className="text-[#bf2f1f]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#bf2f1f]">
              Learning Tool
            </div>
            <h2 className="text-lg font-black text-[#000000] tracking-tight">
              {activeFeature?.tooltip ?? "Widget"}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={closeWidget}
          className="p-2.5 rounded-2xl hover:bg-[#bf2f1f]/10 text-[#4a4845] hover:text-[#bf2f1f] transition-all bg-white shadow-[0_10px_24px_rgba(20,22,30,0.08)] border border-white/90"
          aria-label="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Panel content area */}
      <div
        key={activeTab ?? "empty"}
        className="flex-1 flex flex-col min-h-0 overflow-hidden widget-content-enter relative"
      >
        {children}
      </div>
    </div>
  );
}

