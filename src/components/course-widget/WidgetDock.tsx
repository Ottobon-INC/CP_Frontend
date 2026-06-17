import React, { useCallback, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
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
  if (iconName in LucideIcons) {
    return (LucideIcons as any)[iconName];
  }
  const pascal = toPascalCase(iconName);
  if (pascal in LucideIcons) {
    return (LucideIcons as any)[pascal];
  }
  return LucideIcons.HelpCircle;
}

type DockItemProps = {
  mouseY: MotionValue<number>;
  isDesktop: boolean;
  isActive: boolean;
  isCompleted: boolean;
  label: string;
  tooltip: string;
  iconName: string;
  avatarUrl?: string | null;
  onClick: () => void;
};

function VerticalDockItem({
  mouseY,
  isDesktop,
  isActive,
  isCompleted,
  label,
  tooltip,
  iconName,
  avatarUrl,
  onClick,
}: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseY, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return value - bounds.y - bounds.height / 2;
  });

  const slotHeightRaw = useTransform(
    distance,
    isDesktop ? [-180, 0, 180] : [-120, 0, 120],
    isDesktop ? [52, 78, 52] : [48, 62, 48],
  );
  const slotHeight = useSpring(slotHeightRaw, {
    mass: 0.18,
    stiffness: 260,
    damping: 20,
  });

  const buttonScaleRaw = useTransform(
    distance,
    isDesktop ? [-180, 0, 180] : [-120, 0, 120],
    isDesktop ? [1, 1.38, 1] : [1, 1.18, 1],
  );
  const buttonScale = useSpring(buttonScaleRaw, {
    mass: 0.18,
    stiffness: 260,
    damping: 20,
  });

  const iconScaleRaw = useTransform(buttonScale, [1, isDesktop ? 1.38 : 1.18], [1, isDesktop ? 1.08 : 1.04]);
  const iconScale = useSpring(iconScaleRaw, {
    mass: 0.18,
    stiffness: 260,
    damping: 20,
  });

  const Icon = getIconComponent(iconName);

  return (
    <motion.div
      style={{ height: slotHeight }}
      className="relative group flex items-center justify-end widget-rail-slot"
    >
      <div className="widget-rail-tooltip absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all whitespace-nowrap">
        <span className="widget-rail-tooltip-title">{label}</span>
      </div>

      <div
        className={`widget-rail-active-marker ${isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"}`}
        aria-hidden="true"
      />

      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        style={{ scale: buttonScale }}
        className={`widget-dock-icon widget-rail-button ${
          isActive
            ? "widget-rail-button-active"
            : isCompleted
            ? "widget-rail-button-complete"
            : "widget-rail-button-idle"
        }`}
        aria-label={tooltip}
      >
        <div className="widget-rail-button-inner" aria-hidden="true" />
        <motion.div style={{ scale: iconScale }} className="relative z-[1] flex h-full w-full items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={label} className="h-full w-full rounded-full object-cover" />
          ) : (
            <Icon size={20} className={isActive ? "text-[#22c55e]" : ""} />
          )}
        </motion.div>

        {isCompleted && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#22c55e] text-white rounded-full flex items-center justify-center shadow-[0_8px_18px_rgba(34,197,94,0.35)] border-2 border-white z-[2]">
            <Check size={10} strokeWidth={3} />
          </div>
        )}
      </motion.button>
    </motion.div>
  );
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
  const mouseY = useMotionValue(Infinity);

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
    [activeTab, chatOpen, isExpanded, setActiveTab, setChatOpen, viewport],
  );

  const isDesktop = viewport === "desktop" || viewport === "tablet";

  return (
    <>
      <GlassFilter />
      <div className="fixed top-1/2 -translate-y-1/2 right-6 xl:right-8 z-[62] flex flex-col items-center gap-3 pointer-events-none">
      {!isDesktop && (
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="w-14 h-14 rounded-[20px] bg-white/95 text-[#bf2f1f] shadow-[0_18px_40px_rgba(20,22,30,0.18)] flex items-center justify-center pointer-events-auto border border-white/80 hover:bg-[#f8f1e6] transition-all"
        >
          {mobileExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      )}

      <motion.div
        onMouseMove={(event) => {
          if (isDesktop) {
            mouseY.set(event.clientY);
          }
        }}
        onMouseLeave={() => mouseY.set(Infinity)}
        className={`widget-rail-shell pointer-events-auto transition-all duration-300 ease-in-out ${
          !isDesktop && !mobileExpanded ? "opacity-0 scale-95 pointer-events-none absolute top-16" : "opacity-100 scale-100 relative"
        }`}
      >
        <div className="widget-rail-shell-shadow" aria-hidden="true" />
        <div className="widget-rail-shell-glass" aria-hidden="true" />
        <div className="flex flex-col">
          {features.map((feature) => {
            const isChat = feature.id === "chat";
            const isActive = isChat ? chatOpen : activeTab === feature.id && isExpanded;
            const isHiddenCompletion = ["study", "analogy", "listen"].includes(feature.id);
            const isCompleted = completedFeatures.includes(feature.id) && !isHiddenCompletion;

            return (
              <VerticalDockItem
                key={feature.id}
                mouseY={mouseY}
                isDesktop={isDesktop}
                isActive={isActive}
                isCompleted={isCompleted}
                label={feature.label}
                tooltip={feature.tooltip}
                iconName={feature.icon}
                avatarUrl={isChat ? feature.avatarUrl ?? null : null}
                onClick={() => handleIconClick(feature.id)}
              />
            );
          })}
        </div>
      </motion.div>
      </div>
    </>
  );
}

function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id="widget-rail-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
