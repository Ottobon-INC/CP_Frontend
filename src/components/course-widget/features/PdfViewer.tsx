import React from "react";
import { FileText } from "lucide-react";

export default function PdfViewer() {
  // PDF viewer ready — no PDF data currently available in the data model
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#4a4845]/8 flex items-center justify-center mb-3">
        <FileText size={24} className="text-[#4a4845]/40" />
      </div>
      <p className="text-sm font-semibold text-[#000000]/70">PDF Viewer</p>
      <p className="text-xs text-[#4a4845]/60 mt-1 max-w-[220px]">
        PDF documents will appear here when available for this lesson.
      </p>
      <div className="mt-4 px-3 py-2 rounded-lg bg-[#bf2f1f]/5 border border-[#bf2f1f]/10">
        <p className="text-[10px] text-[#bf2f1f]/70 font-medium">
          Coming soon — PDF support is being added
        </p>
      </div>
    </div>
  );
}
