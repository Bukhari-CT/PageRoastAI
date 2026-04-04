"use client";

import { ACTION_FIXES } from "@/constants";

export function ActionItems() {
  return (
    <div>
      <h4 className="text-[var(--text-primary)] font-semibold text-base mb-4">Action Items — Fix These First</h4>
      {ACTION_FIXES.map((fix, i) => (
        <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5 mb-4">
          <div className="flex gap-3 items-start mb-4">
            <span className="text-[11px] font-bold px-2 py-1 rounded" style={{
              background: fix.priority === "CRITICAL" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
              color: fix.priority === "CRITICAL" ? "var(--danger)" : "var(--warning)",
              border: fix.priority === "CRITICAL" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(234,179,8,0.2)",
            }}>
              {fix.priority}
            </span>
            <p className="text-sm font-medium text-[var(--text-primary)]">{fix.title}</p>
          </div>
          {fix.copy && (
            <div className="mb-4">
              <p className="text-xs text-[var(--text-muted)] mb-1.5">Suggested copy</p>
              <textarea readOnly value={fix.copy} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-sm text-[var(--text-primary)] font-mono resize-none outline-none" rows={2} />
            </div>
          )}
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1.5">Code fix</p>
            <pre className="bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg p-4 text-xs text-[var(--text-primary)] font-mono overflow-x-auto" style={{ borderLeft: "3px solid var(--pr-accent)" }}>
              {fix.code}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
