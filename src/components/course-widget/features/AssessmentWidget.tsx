import React from "react";
import { ClipboardCheck, Sparkles } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

interface QuizQuestion {
  questionId: string;
  prompt: string;
  options: Array<{ optionId: string; text: string }>;
}

interface QuizAttemptResult {
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  passed: boolean;
  thresholdPercent: number;
}

interface InlineQuizRuntime {
  assessmentId: string;
  mode: "local" | "remote";
  correctOptionByQuestionId: Record<string, string | null>;
  phase: "intro" | "loading" | "active" | "submitting" | "result" | "error";
  attemptId: string | null;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  result: QuizAttemptResult | null;
  errorMessage: string | null;
}

interface AssessmentWidgetProps {
  runtimeKey?: string;
  assessmentId?: string | null;
  inlineQuestions?: QuizQuestion[];
  inlineQuestionsRaw?: unknown[];
  hasRemoteAssessment?: boolean;
  hasLocalQuestions?: boolean;
  title?: string;
  passThresholdPercent?: number;
  runtime?: InlineQuizRuntime | null;
  startInlineQuiz?: (
    runtimeKey: string,
    params: {
      assessmentId: string | null;
      moduleNo: number | null;
      inlineQuestions: QuizQuestion[];
      inlineQuestionsRaw: unknown[];
    }
  ) => Promise<void>;
  selectInlineQuizAnswer?: (runtimeKey: string, questionId: string, optionId: string) => void;
  submitInlineQuiz?: (runtimeKey: string, moduleNo: number | null) => Promise<void>;
  moduleNo?: number | null;
  onComplete?: () => void;
}

export default function AssessmentWidget({
  runtimeKey,
  assessmentId,
  inlineQuestions = [],
  inlineQuestionsRaw = [],
  hasRemoteAssessment = false,
  hasLocalQuestions = false,
  title = "Knowledge Check",
  passThresholdPercent = 70,
  runtime,
  startInlineQuiz,
  selectInlineQuizAnswer,
  submitInlineQuiz,
  moduleNo,
  onComplete,
}: AssessmentWidgetProps) {
  const { activeLesson } = useWidgetContext();

  React.useEffect(() => {
    if (runtime?.phase === "result" && runtime.result?.passed) {
      onComplete?.();
    }
  }, [runtime?.phase, runtime?.result?.passed, onComplete]);

  // If no quiz block is parsed for this topic, render the placeholder
  if (!runtimeKey) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#bf2f1f]/10 flex items-center justify-center">
            <ClipboardCheck size={16} className="text-[#bf2f1f]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#000000]">Assessment</h4>
            <p className="text-[10px] text-[#4a4845]/60">Topic knowledge check</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#e8e1d8] bg-white p-4 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#bf2f1f]/5 flex items-center justify-center mx-auto">
            <ClipboardCheck size={20} className="text-[#bf2f1f]/60" />
          </div>
          <p className="text-sm text-[#4a4845]/80 font-semibold">
            No assessment for this topic
          </p>
          <p className="text-[10px] text-[#4a4845]/50 leading-relaxed">
            This topic doesn't have an inline assessment. You can explore other learning tools in the menu!
          </p>
        </div>

        {activeLesson?.topicName && (
          <p className="text-[10px] text-[#4a4845]/50 text-center">
            Current topic: {activeLesson.topicName}
          </p>
        )}
      </div>
    );
  }

  const unresolvedCount = runtime
    ? runtime.questions.filter((question) => !runtime.answers[question.questionId]).length
    : 0;

  const canSubmit =
    runtime &&
    runtime.questions.length > 0 &&
    unresolvedCount === 0 &&
    runtime.phase !== "submitting";

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#e8e1d8] pb-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#bf2f1f]/10 flex items-center justify-center">
            <ClipboardCheck size={16} className="text-[#bf2f1f]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#000000]">{title}</h4>
            <p className="text-[10px] text-[#4a4845]/60">Topic Assessment</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#bf2f1f] bg-[#bf2f1f]/5 px-2 py-0.5 rounded-full">
          Pass {passThresholdPercent}%
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {(!runtime || runtime.phase === "intro") && (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#bf2f1f]/5 flex items-center justify-center mx-auto shadow-inner">
              <ClipboardCheck size={28} className="text-[#bf2f1f]" />
            </div>
            <div className="space-y-1 max-w-[280px] mx-auto">
              <p className="text-sm font-bold text-[#1f2937]">Test your understanding</p>
              <p className="text-xs text-[#4a4845]/70 leading-relaxed">
                This quick assessment will verify your comprehension of the lesson concepts.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                startInlineQuiz?.(runtimeKey, {
                  assessmentId,
                  moduleNo,
                  inlineQuestions,
                  inlineQuestionsRaw,
                })
              }
              className="inline-flex items-center rounded-xl bg-[#bf2f1f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a62619] transition shadow-[0_4px_12px_rgba(191,47,31,0.2)] active:scale-95 duration-150"
            >
              Start Assessment
            </button>
          </div>
        )}

        {runtime?.phase === "loading" && (
          <div className="py-12 text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bf2f1f] mx-auto" />
            <p className="text-sm text-[#4a4845] font-semibold">Loading questions...</p>
          </div>
        )}

        {runtime?.phase === "error" && (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm font-bold text-red-600">Error Loading Quiz</p>
            <p className="text-xs text-[#4a4845]">{runtime.errorMessage || "Something went wrong."}</p>
            <button
              type="button"
              onClick={() =>
                startInlineQuiz?.(runtimeKey, {
                  assessmentId,
                  moduleNo,
                  inlineQuestions,
                  inlineQuestionsRaw,
                })
              }
              className="inline-flex items-center rounded-xl bg-[#bf2f1f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a62619] transition"
            >
              Try Again
            </button>
          </div>
        )}

        {(runtime?.phase === "active" || runtime?.phase === "submitting") && (
          <div className="space-y-6">
            {runtime.questions.map((question, questionIndex) => (
              <div key={question.questionId} className="space-y-3 border-b border-[#e8e1d8]/50 pb-5 last:border-0 last:pb-0">
                <p className="text-[13px] font-bold text-[#1f2937] leading-relaxed">
                  {questionIndex + 1}. {question.prompt}
                </p>
                <div className="flex flex-col gap-2">
                  {question.options.map((option) => {
                    const selected = runtime.answers[question.questionId] === option.optionId;
                    return (
                      <button
                        type="button"
                        key={option.optionId}
                        onClick={() => selectInlineQuizAnswer?.(runtimeKey, question.questionId, option.optionId)}
                        className={`rounded-xl border px-3.5 py-3 text-left text-xs transition duration-150 font-medium ${selected
                          ? "border-[#bf2f1f] bg-[#fff1ee] text-[#000000] shadow-[0_2px_8px_rgba(191,47,31,0.05)]"
                          : "border-[#e8e1d8] bg-white hover:border-[#bf2f1f]/50 hover:bg-[#bf2f1f]/5 text-[#4a4845]"
                          }`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {runtime?.phase === "result" && runtime.result && (
          <div className="py-6 text-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md ${runtime.result.passed ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              <ClipboardCheck size={28} />
            </div>
            <div className="space-y-1">
              <h5 className={`text-base font-bold ${runtime.result.passed ? "text-emerald-700" : "text-rose-700"}`}>
                {runtime.result.passed ? "Passed!" : "Keep Practicing"}
              </h5>
              <div className="flex justify-center items-center gap-1.5 mt-2">
                <span className="text-sm font-bold text-[#1f2937] bg-[#f4ece3] px-3 py-1 rounded-lg">
                  Score: {runtime.result.scorePercent}%
                </span>
              </div>
              <p className="text-xs text-[#4a4845]/70 mt-1">
                Correct: {runtime.result.correctCount} / {runtime.result.totalQuestions} (Passing: {passThresholdPercent}%)
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                startInlineQuiz?.(runtimeKey, {
                  assessmentId,
                  moduleNo,
                  inlineQuestions,
                  inlineQuestionsRaw,
                })
              }
              className="inline-flex items-center rounded-xl border-2 border-black bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-[#f8f1e6] active:scale-95 transition duration-150"
            >
              Retake Assessment
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {(runtime?.phase === "active" || runtime?.phase === "submitting") && (
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e8e1d8] mt-4 flex-shrink-0">
          <p className="text-xs text-[#4a4845]/70 font-semibold flex items-center gap-1">
            <Sparkles size={12} className="text-[#bf2f1f]" />
            {unresolvedCount > 0
              ? `${unresolvedCount} question(s) left`
              : "Ready to submit!"}
          </p>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void submitInlineQuiz?.(runtimeKey, moduleNo)}
            className="inline-flex items-center rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-black/85 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_6px_rgba(0,0,0,0.1)]"
          >
            {runtime.phase === "submitting" ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
