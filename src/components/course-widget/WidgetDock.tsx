import React, { useCallback, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useWidgetContext } from "./WidgetContext";
import type { WidgetFeatureId } from "./ModuleFeatureManager";

const toPascalCase = (str: string) => {
  if (!str) return "HelpCircle";
  return str
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

function getIconComponent(iconName: string): React.ComponentType<any> {
  if (!iconName) return LucideIcons.HelpCircle;
  // Try exact match
  if (iconName in LucideIcons) {
    return (LucideIcons as any)[iconName];
  }
  // Try converting kebab-case/camelCase to PascalCase
  const pascal = toPascalCase(iconName);
  if (pascal in LucideIcons) {
    return (LucideIcons as any)[pascal];
  }
  return LucideIcons.HelpCircle;
}

export default function WidgetDock() {
  const {
    features,
    activeTab,
    setActiveTab,
    isExpanded,
    viewport,
    completedFeatures,
    setChatOpen,
    chatOpen,
  } = useWidgetContext();

  const [mobileExpanded, setMobileExpanded] = useState(false);

  const handleIconClick = useCallback(
    (featureId: WidgetFeatureId) => {
      if (featureId === "chat") {
        const nextChatOpen = !chatOpen;
        setChatOpen?.(nextChatOpen);
        if (nextChatOpen) {
          setActiveTab(null);
        }
        if (viewport === "mobile") setMobileExpanded(false);
        return;
      }

      if (activeTab === featureId && isExpanded) {
        setActiveTab(null);
      } else {
        setActiveTab(featureId);
        setChatOpen?.(false);
      }
      if (viewport === "mobile") setMobileExpanded(false);
    },
    [setActiveTab, viewport, setChatOpen, chatOpen, activeTab, isExpanded]
  );

  const isDesktop = viewport === "desktop" || viewport === "tablet";

  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-4 z-[62] flex flex-col items-center gap-3 pointer-events-none">
      {/* Mobile Toggle Button */}
      {!isDesktop && (
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-12 h-12 bg-white text-[#bf2f1f] shadow-lg rounded-full flex items-center justify-center pointer-events-auto border border-[#bf2f1f]/20 hover:bg-[#f8f1e6]"
        >
          {mobileExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      )}

      {/* Dock Rail */}
      <div
        className={`flex flex-col gap-3 pointer-events-auto transition-all duration-300 ease-in-out ${
          !isDesktop && !mobileExpanded ? "opacity-0 scale-95 pointer-events-none absolute top-16" : "opacity-100 scale-100 relative"
        }`}
      >
        {features.map((feature) => {
          const isChat = feature.id === "chat";
          const isActive = isChat ? chatOpen : activeTab === feature.id && isExpanded;
          const isHiddenCompletion = ["study", "analogy", "listen"].includes(feature.id);
          const isCompleted = completedFeatures.includes(feature.id) && !isHiddenCompletion;
          const hasAvatar = Boolean(isChat && feature.avatarUrl);

          return (
            <div key={feature.id} className="relative group">
              {/* Tooltip */}
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1c242c] text-white text-xs font-semibold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {feature.label}
              </div>

              {/* Icon Button */}
              <button
                type="button"
                onClick={() => handleIconClick(feature.id)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border relative ${
                  isActive
                    ? "bg-[#bf2f1f] text-white border-[#bf2f1f] shadow-[0_4px_15px_rgba(191,47,31,0.5)] scale-110"
                    : isCompleted
                    ? "bg-white text-[#22c55e] border-[#22c55e]/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:bg-[#f0fdf4]"
                    : "bg-white text-[#4a4845] border-[#4a4845]/20 shadow-sm hover:bg-[#f8f1e6] hover:text-[#bf2f1f] hover:border-[#bf2f1f]/30"
                }`}
                aria-label={feature.tooltip}
              >
                {hasAvatar ? (
                  <img
                    src={feature.avatarUrl ?? undefined}
                    alt={feature.label}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (() => {
                  const Icon = getIconComponent(feature.icon);
                  return <Icon size={20} className={isActive ? "text-white" : ""} />;
                })()}

                {/* Completion Badge */}
                {isCompleted && !isActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#22c55e] text-white rounded-full flex items-center justify-center shadow-sm">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

