import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  resolveModuleFeatures,
  type LessonFeatureInput,
  type WidgetFeature,
  type WidgetFeatureId,
} from "./ModuleFeatureManager";

/* ─────────────── Types ─────────────── */

export interface WidgetVideo {
  url: string;
  title?: string;
}

export interface WidgetLesson {
  topicId: string;
  courseId: string;
  moduleNo: number;
  topicName: string;
  videoUrl?: string | null;
  videos?: WidgetVideo[];
  textContent?: string | null;
  pptUrl?: string | null;
  slug: string;
  simulation?: unknown | null;
  unlocked?: boolean;
}

export interface WidgetModule {
  id: number;
  title: string;
  passed: boolean;
  unlocked: boolean;
  submoduleCount: number;
}

export interface WidgetQuizSection {
  assessmentId: string;
  moduleNo: number;
  title: string;
  passed: boolean;
  questionCount: number;
}

interface WidgetContextValue {
  /* ── Feature tabs ── */
  activeTab: WidgetFeatureId | null;
  setActiveTab: (tab: WidgetFeatureId | null) => void;
  features: WidgetFeature[];

  /* ── Panel state ── */
  isExpanded: boolean;
  toggleWidget: () => void;
  openWidget: (tab?: WidgetFeatureId) => void;
  closeWidget: () => void;

  /* ── Menu state ── */
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;

  /* ── Mobile drawer ── */
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;

  /* ── Viewport ── */
  viewport: "desktop" | "tablet" | "mobile";

  /* ── Lesson data ── */
  activeLesson: WidgetLesson | null;
  allLessons: WidgetLesson[];
  modules: WidgetModule[];
  quizSections: WidgetQuizSection[];
  courseKey: string | null;
  courseProgress: number;
  courseTitle: string;

  /* ── Completion Tracking ── */
  completedFeatures: WidgetFeatureId[];
  markFeatureComplete: (id: WidgetFeatureId) => void;

  /* ── Chat State ── */
  chatOpen?: boolean;
  setChatOpen?: (open: boolean) => void;
}

const WidgetCtx = createContext<WidgetContextValue | null>(null);

/* ─────────────── Provider ─────────────── */

interface WidgetProviderProps {
  children: React.ReactNode;
  activeLesson: WidgetLesson | null;
  allLessons?: WidgetLesson[];
  modules: WidgetModule[];
  quizSections: WidgetQuizSection[];
  courseKey: string | null;
  courseProgress: number;
  courseTitle: string;
  /** Feature input derived from the active lesson for the ModuleFeatureManager */
  featureInput: LessonFeatureInput | null;
  chatOpen?: boolean;
  setChatOpen?: (open: boolean) => void;
}

export function WidgetProvider({
  children,
  activeLesson,
  allLessons = [],
  modules,
  quizSections,
  courseKey,
  courseProgress,
  courseTitle,
  featureInput,
  chatOpen,
  setChatOpen,
}: WidgetProviderProps) {
  const [activeTab, setActiveTab] = useState<WidgetFeatureId | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // ai-tutor is now rendered as a standalone floating chat outside the widget,
  // so no sync between widget context and chatOpen is needed.

  // Responsive detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setViewport("mobile");
      else if (w < 1024) setViewport("tablet");
      else setViewport("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Resolve available features for current lesson
  const features = useMemo(() => resolveModuleFeatures(featureInput, allLessons), [featureInput, allLessons]);

  // Reset active tab when lesson changes if current tab is no longer available
  useEffect(() => {
    if (!activeTab) return;
    const stillAvailable = features.some((f) => f.id === activeTab);
    if (!stillAvailable) {
      setActiveTab(null);
      setIsExpanded(false);
    }
  }, [features, activeTab]);

  // Completion Tracking logic backed by localStorage
  const storageKey = `widget-completed-v2-${courseKey ?? "unknown"}-${activeLesson?.topicId ?? "unknown"}`;
  const [completedFeatures, setCompletedFeatures] = useState<WidgetFeatureId[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored) as WidgetFeatureId[];
        } catch (e) {
          // Ignore
        }
      }
    }
    return [];
  });

  useEffect(() => {
    setCompletedFeatures(() => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored) as WidgetFeatureId[];
        } catch (e) {
          return [];
        }
      }
      return [];
    });
  }, [storageKey]);

  const markFeatureComplete = useCallback(
    (id: WidgetFeatureId) => {
      setCompletedFeatures((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey]
  );

  const toggleWidget = useCallback(() => {
    setIsExpanded((prev) => {
      if (prev) {
        // Collapsing
        if (viewport === "mobile") setMobileDrawerOpen(false);
        return false;
      }
      // Expanding: open first available tab if none is active
      if (!activeTab && features.length > 0) {
        setActiveTab(features[0].id);
      }
      if (viewport === "mobile") setMobileDrawerOpen(true);
      return true;
    });
  }, [activeTab, features, viewport]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const openWidget = useCallback(
    (tab?: WidgetFeatureId) => {
      const targetTab = tab ?? features[0]?.id ?? null;
      setActiveTab(targetTab);
      setIsExpanded(true);
      setChatOpen?.(false);
      if (viewport === "mobile") setMobileDrawerOpen(true);
    },
    [features, viewport, setChatOpen]
  );

  const closeWidget = useCallback(() => {
    setIsExpanded(false);
    if (viewport === "mobile") setMobileDrawerOpen(false);
  }, [viewport]);

  const handleSetActiveTab = useCallback(
    (tab: WidgetFeatureId | null) => {
      setActiveTab(tab);
      if (tab && !isExpanded) {
        setIsExpanded(true);
        if (viewport === "mobile") setMobileDrawerOpen(true);
      }
      if (tab) {
        setChatOpen?.(false);
      }
      if (!tab) {
        setIsExpanded(false);
        if (viewport === "mobile") setMobileDrawerOpen(false);
      }
    },
    [isExpanded, viewport, setChatOpen]
  );

  const value = useMemo<WidgetContextValue>(
    () => ({
      activeTab,
      setActiveTab: handleSetActiveTab,
      features,
      isExpanded,
      toggleWidget,
      openWidget,
      closeWidget,
      isMenuOpen,
      setMenuOpen,
      toggleMenu,
      isMobileDrawerOpen,
      setMobileDrawerOpen,
      viewport,
      activeLesson,
      allLessons,
      modules,
      quizSections,
      courseKey,
      courseProgress,
      courseTitle,
      completedFeatures,
      markFeatureComplete,
      chatOpen,
      setChatOpen,
    }),
    [
      activeTab,
      handleSetActiveTab,
      features,
      isExpanded,
      toggleWidget,
      openWidget,
      closeWidget,
      isMenuOpen,
      isMobileDrawerOpen,
      setMobileDrawerOpen,
      viewport,
      activeLesson,
      allLessons,
      modules,
      quizSections,
      courseKey,
      courseProgress,
      courseTitle,
      completedFeatures,
      markFeatureComplete,
      chatOpen,
      setChatOpen,
    ]
  );

  return <WidgetCtx.Provider value={value}>{children}</WidgetCtx.Provider>;
}

/* ─────────────── Hook ─────────────── */

export function useWidgetContext(): WidgetContextValue {
  const ctx = useContext(WidgetCtx);
  if (!ctx) {
    throw new Error("useWidgetContext must be used within a WidgetProvider");
  }
  return ctx;
}
