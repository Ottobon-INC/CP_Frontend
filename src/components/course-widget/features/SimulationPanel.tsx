import React from "react";
import { Cpu } from "lucide-react";
import { useWidgetContext } from "../WidgetContext";
import SimulationExercise from "@/components/SimulationExercise";

export default function SimulationPanel() {
  const { activeLesson } = useWidgetContext();

  if (!activeLesson?.simulation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#4a4845]/8 flex items-center justify-center mb-3">
          <Cpu size={24} className="text-[#4a4845]/40" />
        </div>
        <p className="text-sm font-semibold text-[#000000]/70">No simulation available</p>
        <p className="text-xs text-[#4a4845]/60 mt-1">
          This lesson doesn't have an interactive simulation exercise.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#4a4845] border-b border-[#e8e1d8] pb-3 mb-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#bf2f1f]/10 flex items-center justify-center">
          <Cpu size={16} className="text-[#bf2f1f]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#000000]">Simulation Lab</h4>
          <p className="text-[10px] text-[#4a4845]/60">Hands-on interactive practice</p>
        </div>
      </div>

      {/* Main Simulation View Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="mt-[-2rem] space-y-4">
          <SimulationExercise simulation={activeLesson.simulation as any} />
        </div>
      </div>
    </div>
  );
}
