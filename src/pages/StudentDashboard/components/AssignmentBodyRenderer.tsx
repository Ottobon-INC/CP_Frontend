import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

type AssignmentBodyRendererProps = {
  body: unknown;
  emptyMessage?: string;
};

type AssignmentBlock = {
  type?: string;
  data?: Record<string, unknown> | null;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function extractBlockText(block: AssignmentBlock): string | null {
  const data = block.data;
  if (!data || typeof data !== "object") return null;

  const direct =
    readString(data.markdown) ??
    readString(data.content) ??
    readString(data.text) ??
    readString(data.body) ??
    readString(data.description) ??
    readString(data.instructions);

  if (direct) return direct;

  if (Array.isArray(data.items)) {
    const items = data.items
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return readString((item as Record<string, unknown>).text) ?? readString((item as Record<string, unknown>).content) ?? "";
        }
        return "";
      })
      .filter((item) => item.length > 0);

    if (items.length > 0) {
      return items.map((item) => `- ${item}`).join("\n");
    }
  }

  return null;
}

function extractAssignmentBody(body: unknown): string[] {
  const directBody = readString(body);
  if (directBody) {
    return [directBody];
  }

  if (Array.isArray(body)) {
    return body.flatMap((entry) => extractAssignmentBody(entry));
  }

  if (!body || typeof body !== "object") {
    return [];
  }

  const record = body as Record<string, unknown>;

  if (Array.isArray(record.blocks)) {
    const blockSections = record.blocks
      .map((block) => extractBlockText((block as AssignmentBlock) ?? {}))
      .filter((section): section is string => Boolean(section));
    if (blockSections.length > 0) {
      return blockSections;
    }
  }

  const directSection =
    readString(record.markdown) ??
    readString(record.content) ??
    readString(record.text) ??
    readString(record.body) ??
    readString(record.description) ??
    readString(record.instructions);

  return directSection ? [directSection] : [];
}

export function AssignmentBodyRenderer({
  body,
  emptyMessage = "No task description has been added for this assignment yet.",
}: AssignmentBodyRendererProps) {
  const sections = useMemo(() => extractAssignmentBody(body), [body]);

  if (sections.length === 0) {
    return <p className="text-sm text-gray-500 leading-relaxed">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div
          key={`${index}-${section.slice(0, 24)}`}
          className="prose prose-sm max-w-none text-gray-700 prose-p:my-2 prose-li:my-1 prose-strong:text-gray-900 prose-headings:text-gray-900"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {section}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
