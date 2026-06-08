import React from "react";
import { useWidgetContext } from "./WidgetContext";
import WidgetDock from "./WidgetDock";
import WidgetPanel from "./WidgetPanel";
import WidgetContentArea from "./WidgetContentArea";
import "./widget.css";

interface WidgetContainerProps {
  chatProps?: Record<string, unknown>;
  studyProps?: Record<string, unknown>;
  ttsProps?: Record<string, unknown>;
  quizProps?: Record<string, unknown>;
  hidden?: boolean;
}

export default function WidgetContainer({
  chatProps,
  studyProps,
  ttsProps,
  quizProps,
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
                ttsProps={ttsProps}
                quizProps={quizProps}
              />
            </WidgetPanel>
          </div>
        </>
      )}
    </>
  );
}

