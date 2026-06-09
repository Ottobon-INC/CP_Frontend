/**
 * ModuleFeatureManager
 * --------------------
 * Pure utility that inspects lesson data and determines which widget
 * features are available for the current module / lesson.
 *
 * Each feature maps to a widget panel tab rendered in the dock.
 */

export type WidgetFeatureId =
  | "study"
  | "notes"
  | "ppt"
  | "pdf"
  | "listen"
  | "media"
  | "assessment"
  | "resources"
  | "bookmarks"
  | "progress"
  | "course-videos"
  | "simulation"
  | "cold-calling";

export interface WidgetFeature {
  id: WidgetFeatureId;
  label: string;
  /** Lucide icon name used by the dock */
  icon: string;
  /** Short tooltip text */
  tooltip: string;
  /** Whether this feature is currently available for the active lesson */
  available: boolean;
  /** Priority for ordering in the dock (lower = higher priority) */
  order: number;
}

export interface LessonFeatureInput {
  topicId?: string | null;
  videoUrl?: string | null;
  textContent?: string | null;
  pptUrl?: string | null;
  /** Whether textContent contains structured content blocks */
  hasContentBlocks?: boolean;
  /** Whether any content block is of type "quiz" */
  hasQuizBlocks?: boolean;
  /** Whether the lesson has a simulation */
  hasSimulation?: boolean;
}

const ALWAYS_AVAILABLE_FEATURES: WidgetFeatureId[] = [
  "notes",
];

/**
 * Determines which widget features are available for a given lesson.
 * Returns a sorted list of feature descriptors.
 */
export function resolveModuleFeatures(
  lesson: LessonFeatureInput | null | undefined,
  allLessons: { videoUrl?: string | null }[] = []
): WidgetFeature[] {
  const hasVideo = Boolean(lesson?.videoUrl?.trim());
  const hasCourseVideos = allLessons.some((l) => Boolean(l.videoUrl?.trim()));
  const hasText = Boolean(lesson?.textContent?.trim());
  const hasPpt = Boolean(lesson?.pptUrl?.trim());
  const hasQuiz = Boolean(lesson?.hasQuizBlocks);
  const hasSimulation = Boolean(lesson?.hasSimulation);
  const hasColdCalling = Boolean(lesson?.topicId);

  const features: WidgetFeature[] = [
    {
      id: "study",
      label: "Analogy",
      icon: "BookOpen",
      tooltip: "Analogy",
      available: hasText,
      order: 1,
    },
    {
      id: "notes",
      label: "Notes",
      icon: "PenLine",
      tooltip: "My Notes",
      available: true,
      order: 3,
    },
    {
      id: "listen",
      label: "Listen",
      icon: "Headphones",
      tooltip: "Listen to content",
      available: hasText,
      order: 4,
    },
    {
      id: "ppt",
      label: "Slides",
      icon: "Presentation",
      tooltip: "Presentation Slides",
      available: hasPpt,
      order: 5,
    },
    {
      id: "pdf",
      label: "PDF",
      icon: "FileText",
      tooltip: "PDF Document",
      available: false, // No PDF data in current model
      order: 6,
    },
    {
      id: "media",
      label: "Media",
      icon: "Play",
      tooltip: "Media Player",
      available: hasVideo,
      order: 7,
    },
    {
      id: "course-videos",
      label: "Videos",
      icon: "MonitorPlay",
      tooltip: "Course Video Gallery",
      available: true,
      order: 7.5,
    },
    {
      id: "assessment",
      label: "Quiz",
      icon: "ClipboardCheck",
      tooltip: "Assessment",
      available: hasQuiz,
      order: 8,
    },
    {
      id: "simulation",
      label: "Simulation",
      icon: "Cpu",
      tooltip: "Simulation Lab",
      available: hasSimulation,
      order: 8.5,
    },
    {
      id: "cold-calling",
      label: "Cold Calling",
      icon: "PhoneCall",
      tooltip: "Cold Calling",
      available: hasColdCalling,
      order: 8.7,
    },
    {
      id: "resources",
      label: "Resources",
      icon: "FolderDown",
      tooltip: "Downloadable Resources",
      available: false,
      order: 9,
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: "Bookmark",
      tooltip: "Saved Bookmarks",
      available: false,
      order: 10,
    },
    {
      id: "progress",
      label: "Progress",
      icon: "BarChart3",
      tooltip: "Course Progress",
      available: false,
      order: 11,
    },
  ];

  return features
    .filter((f) => f.available)
    .sort((a, b) => a.order - b.order);
}

/**
 * Check if a feature is always available regardless of lesson content.
 */
export function isAlwaysAvailable(featureId: WidgetFeatureId): boolean {
  return ALWAYS_AVAILABLE_FEATURES.includes(featureId);
}
