"use client";

import { useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";

export function MarkdownEditor({
  name = "content",
  defaultValue = "",
  placeholder = "Konten (Markdown)",
  rows = 10,
}: {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-3">
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="field font-mono text-sm"
        spellCheck={false}
      />
      <div className="rounded-xl border border-border bg-base/40 p-4">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-muted">
          Preview
        </p>
        {value.trim() ? (
          <MarkdownContent content={value} />
        ) : (
          <p className="text-[13px] text-muted">Tulis Markdown di atas — preview muncul di sini.</p>
        )}
      </div>
    </div>
  );
}
