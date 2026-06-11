import React from "react";
import { useWidgetContext } from "./WidgetContext";
import WidgetDock from "./WidgetDock";
import WidgetPanel from "./WidgetPanel";
import WidgetContentArea from "./WidgetContentArea";
import "./widget.css";

interface WidgetContainerProps {
  chatProps?: Record<string, unknown> | null;
  studyProps?: Record<string, unknown> | null;
  analogyProps?: Record<string, unknown> | null;
  ttsProps?: Record<string, unknown> | null;
  quizProps?: Record<string, unknown> | null;
  coldCallingProps?: Record<string, unknown> | null;
  hidden?: boolean;
}

export default function WidgetContainer({
  chatProps,
  studyProps,
  analogyProps,
  ttsProps,
  quizProps,
  coldCallingProps,
  hidden = false,
}: WidgetContainerProps) {
  const { isExpanded, closeWidget } = useWidgetContext();

  if (hidden) return null;

  return (
    <>
      {/* 
        The floating trigger button and menu are inside WidgetDock. 
        It is rendered unconditionally so the user can open it.
      */}
      <WidgetDock />

      {/* Full-screen Overlay Panel */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm widget-backdrop"
            onClick={closeWidget}
            role="button"
            aria-label="Close widget"
          />

          {/* Full-screen Panel Container */}
          <div className="fixed inset-4 md:inset-8 lg:inset-12 z-[61] flex shadow-2xl rounded-2xl overflow-hidden bg-[#f8f1e6] widget-panel-enter">
            <WidgetPanel>
              <WidgetContentArea
                chatProps={chatProps}
                studyProps={studyProps}
                analogyProps={analogyProps}
                ttsProps={ttsProps}
                quizProps={quizProps}
                coldCallingProps={coldCallingProps}
              />
            </WidgetPanel>
          </div>
        </>
      )}
    </>
  );
}

