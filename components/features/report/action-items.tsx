"use client";

import type { StoredReport } from "@services/ReportStore";

export function ActionItems({ report }: { report: StoredReport }) {
  return (
    <div>
      <h4 className="text-foreground font-semibold text-base mb-4">Action Items — Fix These First</h4>
      {report.actionFixes.map((fix, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 mb-4">
          <div className="flex gap-3 items-start mb-4">
            <span
              className={`text-[11px] font-bold px-2 py-1 rounded border ${
                fix.priority === "CRITICAL"
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
              }`}
            >
              {fix.priority}
            </span>
            <p className="text-sm font-medium text-foreground">{fix.title}</p>
          </div>
          {fix.copy && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1.5">Suggested copy</p>
              <textarea readOnly value={fix.copy} className="w-full bg-input border border-border rounded-lg p-3 text-sm text-foreground font-mono resize-none outline-none" rows={2} />
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Code fix</p>
            <pre className="bg-muted/40 border border-border border-l-[3px] border-l-indigo-600 rounded-lg p-4 text-xs text-foreground font-mono overflow-x-auto">
              {fix.code}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
