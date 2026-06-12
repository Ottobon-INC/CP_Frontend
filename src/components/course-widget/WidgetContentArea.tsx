import React, { lazy, Suspense, useMemo } from "react";
import { useWidgetContext } from "./WidgetContext";
import type { WidgetFeatureId } from "./ModuleFeatureManager";

/* ── Lazy-loaded feature panels ── */
const StudyMaterialViewer = lazy(() => import("./features/StudyMaterialViewer"));
const NotesEditor = lazy(() => import("./features/NotesEditor"));
const PptViewer = lazy(() => import("./features/PptViewer"));
const PdfViewer = lazy(() => import("./features/PdfViewer"));
const MediaPlayer = lazy(() => import("./features/MediaPlayer"));
const AssessmentWidget = lazy(() => import("./features/AssessmentWidget"));
const ResourcesPanel = lazy(() => import("./features/ResourcesPanel"));
const BookmarksPanel = lazy(() => import("./features/BookmarksPanel"));
const ProgressTracker = lazy(() => import("./features/ProgressTracker"));
const VideoGalleryPanel = lazy(() => import("./features/VideoGalleryPanel"));
const SimulationPanel = lazy(() => import("./features/SimulationPanel"));
const ColdCalling = lazy(() => import("@/components/ColdCalling"));

/* ── Loading skeleton ── */
function PanelSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="widget-skeleton h-4 w-3/4" />
      <div className="widget-skeleton h-4 w-full" />
      <div className="widget-skeleton h-4 w-5/6" />
      <div className="widget-skeleton h-20 w-full mt-4" />
      <div className="widget-skeleton h-4 w-2/3 mt-3" />
      <div className="widget-skeleton h-4 w-full" />
    </div>
  );
}

/* ── Feature → Component mapping ── */
const FEATURE_COMPONENTS: Partial<Record<WidgetFeatureId, React.LazyExoticComponent<React.FC<any>>>> = {
  study: StudyMaterialViewer,
  notes: NotesEditor,
  listen: StudyMaterialViewer, // Listen uses same viewer with TTS auto-start flag
  ppt: PptViewer,
  pdf: PdfViewer,
  media: MediaPlayer,
  assessment: AssessmentWidget,
  resources: ResourcesPanel,
  bookmarks: BookmarksPanel,
  progress: ProgressTracker,
  "course-videos": VideoGalleryPanel,
  simulation: SimulationPanel,
  "cold-calling": ColdCalling,
  analogy: StudyMaterialViewer,
};

function PlaceholderPanel({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#bf2f1f]/10 text-[#bf2f1f] flex items-center justify-center text-2xl">
        🚧
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#000000]">{title ?? "Coming Soon"}</h3>
        <p className="text-sm text-[#4a4845] mt-1 max-w-xs mx-auto">
          This feature is currently under development. Please check back later!
        </p>
      </div>
    </div>
  );
}

interface WidgetContentAreaProps {
  /** Extra props passed through to feature components */
  chatProps?: Record<string, unknown> | null;
  studyProps?: Record<string, unknown> | null;
  analogyProps?: Record<string, unknown> | null;
  ttsProps?: Record<string, unknown> | null;
  quizProps?: Record<string, unknown> | null;
  coldCallingProps?: Record<string, unknown> | null;
}

export default function WidgetContentArea({
  chatProps,
  studyProps,
  analogyProps,
  ttsProps,
  quizProps,
  coldCallingProps,
}: WidgetContentAreaProps) {
  const { activeTab, markFeatureComplete } = useWidgetContext();

  const content = useMemo(() => {
    if (!activeTab) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#bf2f1f]/10 flex items-center justify-center mb-3">
            <span className="text-lg">📚</span>
          </div>
          <p className="text-sm font-semibold text-[#000000]/80">
            Select a feature
          </p>
          <p className="text-xs text-[#4a4845]/60 mt-1 max-w-[200px]">
            Choose from the dock icons to open a learning tool
          </p>
        </div>
      );
    }

    const Component = FEATURE_COMPONENTS[activeTab as WidgetFeatureId];
    if (!Component) {
      let title = "Feature";
      if (activeTab === "tbq") title = "Time-Bounded Questions";
      else if (activeTab === "collab") title = "Collaboration";
      else if (activeTab === "assignment") title = "Assignments";
      return <PlaceholderPanel title={title} />;
    }

    // Build props depending on the active tab
    const extraProps: Record<string, unknown> = {
      onComplete: () => markFeatureComplete(activeTab as WidgetFeatureId),
    };
    if ((activeTab === "study" || activeTab === "listen") && studyProps) {
      Object.assign(extraProps, studyProps);
    }
    if (activeTab === "analogy" && analogyProps) {
      Object.assign(extraProps, analogyProps);
    }
    if (activeTab === "listen") {
      extraProps.autoStartTts = true;
    }
    if (activeTab === "listen" && ttsProps) {
      Object.assign(extraProps, ttsProps);
    }
    if (activeTab === "assessment" && quizProps) {
      Object.assign(extraProps, quizProps);
    }
    if (activeTab === "cold-calling" && coldCallingProps) {
      Object.assign(extraProps, coldCallingProps);
    }

    return (
      <Suspense fallback={<PanelSkeleton />}>
        <div className="p-6 h-full flex flex-col min-h-0">
          <Component {...extraProps} />
        </div>
      </Suspense>
    );
  }, [activeTab, chatProps, studyProps, analogyProps, ttsProps, quizProps, coldCallingProps, markFeatureComplete]);

  return <>{content}</>;
}
