import React from "react";
import { BarChart3, CheckCircle2, Circle, Lock } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";

export default function ProgressTracker() {
  const { modules, courseProgress, courseTitle, activeLesson } = useWidgetContext();

  const passedCount = modules.filter((m) => m.passed).length;
  const totalModules = modules.filter((m) => m.id > 0).length;
  const progressPercent = Math.round(courseProgress);

  return (
    <div className="p-4 space-y-4">
      {/* Overall progress */}
      <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#bf2f1f]/10 flex items-center justify-center">
            <BarChart3 size={16} className="text-[#bf2f1f]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#000000]">Course Progress</h4>
            {courseTitle && (
              <p className="text-[10px] text-[#4a4845]/60 truncate max-w-[220px]">
                {courseTitle}
              </p>
            )}
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#e8e1d8"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#bf2f1f"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(progressPercent / 100) * 175.93} 175.93`}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black text-[#000000]">
                {progressPercent}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#4a4845]">
              <span className="font-bold text-[#000000]">{passedCount}</span> of{" "}
              <span className="font-bold text-[#000000]">{totalModules}</span> modules
              completed
            </p>
            {progressPercent >= 100 ? (
              <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Course complete!
              </p>
            ) : (
              <p className="text-[10px] text-[#4a4845]/60">
                Keep going — you're making progress!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Module breakdown */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase tracking-wider text-[#4a4845]/50 font-semibold">
          Module Breakdown
        </span>

        <div className="space-y-1">
          {modules
            .filter((m) => m.id > 0)
            .map((module) => {
              const isCurrent = activeLesson?.moduleNo === module.id;
              return (
                <div
                  key={module.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all
                    ${isCurrent
                      ? "border-[#bf2f1f]/20 bg-[#bf2f1f]/5"
                      : "border-[#e8e1d8]/50 hover:border-[#e8e1d8]"
                    }
                  `}
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {!module.unlocked ? (
                      <Lock size={14} className="text-[#4a4845]/30" />
                    ) : module.passed ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Circle size={14} className={isCurrent ? "text-[#bf2f1f]" : "text-[#4a4845]/30"} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[11px] font-medium truncate
                        ${!module.unlocked
                          ? "text-[#4a4845]/40"
                          : module.passed
                            ? "text-green-700"
                            : isCurrent
                              ? "text-[#bf2f1f]"
                              : "text-[#000000]"
                        }
                      `}
                    >
                      Module {module.id}: {module.title}
                    </p>
                    <p className="text-[9px] text-[#4a4845]/50">
                      {module.submoduleCount} lessons
                      {!module.unlocked && " • Locked"}
                      {module.passed && " • Passed"}
                      {isCurrent && !module.passed && " • In progress"}
                    </p>
                  </div>

                  {/* Progress indicator */}
                  {isCurrent && !module.passed && (
                    <div className="w-2 h-2 rounded-full bg-[#bf2f1f] animate-pulse shrink-0" />
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
