import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useWidgetContext } from "./WidgetContext";

interface WidgetPanelProps {
  children: React.ReactNode;
}

export default function WidgetPanel({ children }: WidgetPanelProps) {
  const { isExpanded, activeTab, features, closeWidget } = useWidgetContext();
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeFeature = features.find((f) => f.id === activeTab) ?? null;

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
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#4a4845]/12 bg-white/60 backdrop-blur-md shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-[#bf2f1f]" />
          <h2 className="text-lg font-black text-[#000000] tracking-tight uppercase">
            {activeFeature?.tooltip ?? "Widget"}
          </h2>
        </div>
        <button
          type="button"
          onClick={closeWidget}
          className="p-2 rounded-xl hover:bg-[#bf2f1f]/10 text-[#4a4845] hover:text-[#bf2f1f] transition-all bg-white shadow-sm border border-[#4a4845]/10"
          aria-label="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Panel content area */}
      <div
        key={activeTab ?? "empty"}
        className="flex-1 overflow-y-auto widget-scrollbar widget-content-enter relative"
      >
        {children}
      </div>
    </div>
  );
}

