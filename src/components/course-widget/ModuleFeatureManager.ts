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
  | "cold-calling"
  | "tbq"
  | "collab"
  | "assignment"
  | "chat"
  | "analogy";

export interface WidgetFeature {
  id: WidgetFeatureId;
  label: string;
  /** Lucide icon name used by the dock */
  icon: string;
  /** Optional avatar image used in place of the dock icon */
  avatarUrl?: string | null;
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
  chatAvatarUrl?: string | null;
  /** Whether textContent contains structured content blocks */
  hasContentBlocks?: boolean;
  /** Whether any content block is of type "quiz" */
  hasQuizBlocks?: boolean;
  /** Whether the lesson has a simulation */
  hasSimulation?: boolean;
  /** Whether the lesson has a cold calling prompt */
  hasColdCalling?: boolean;
  /** Whether the lesson has a slides block */
  hasSlidesBlocks?: boolean;
  /** Whether the lesson has text/image blocks for study mode */
  hasStudyBlocks?: boolean;
  /** Whether the lesson has analogy blocks */
  hasAnalogyBlocks?: boolean;
}

const ALWAYS_AVAILABLE_FEATURES: WidgetFeatureId[] = [];

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
  const hasText = lesson?.hasContentBlocks 
    ? Boolean(lesson.hasStudyBlocks)
    : Boolean(lesson?.textContent?.trim());
  const hasPpt = Boolean(lesson?.pptUrl?.trim()) || Boolean(lesson?.hasSlidesBlocks);
  const hasQuiz = Boolean(lesson?.hasQuizBlocks);
  const hasSimulation = Boolean(lesson?.hasSimulation);
  const hasColdCalling = Boolean(lesson?.hasColdCalling);
  const hasAnalogy = Boolean(lesson?.hasAnalogyBlocks);

  const features: WidgetFeature[] = [
    {
      id: "analogy",
      label: "Analogy",
      icon: "UserRound",
      tooltip: "Analogy",
      available: hasAnalogy,
      order: 1.5,
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
      id: "pdf",
      label: "PDF",
      icon: "FileText",
      tooltip: "PDF Document",
      available: false, // No PDF data in current model
      order: 6,
    },
    {
      id: "course-videos",
      label: "Videos",
      icon: "MonitorPlay",
      tooltip: "Course Video Gallery",
      available: false,
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
      label: "Social Collaboration",
      icon: "Handshake",
      tooltip: "Social Collaboration",
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
    {
      id: "tbq",
      label: "TBQ",
      icon: "Clock",
      tooltip: "Time-Bounded Questions",
      available: false, // hidden per user request
      order: 14,
    },
    {
      id: "collab",
      label: "Collab",
      icon: "Users",
      tooltip: "Collaboration",
      available: false, // hidden per user request
      order: 15,
    },
    {
      id: "assignment",
      label: "Assignments",
      icon: "ClipboardCheck",
      tooltip: "Assignments",
      available: false, // hidden per user request
      order: 16,
    },
    {
      id: "chat",
      label: "AI Tutor",
      icon: "MessageSquare",
      avatarUrl: lesson?.chatAvatarUrl?.trim() || null,
      tooltip: "AI Tutor",
      available: true,
      order: 99,
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
