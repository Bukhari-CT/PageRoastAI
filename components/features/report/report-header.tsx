"use client";

import { Download } from "lucide-react";
import { getScoreBgColor, getScoreColor, getScoreBorderColor } from "@/lib/formatting";
import type { AppView, ActiveReport } from "@/types";

interface ReportHeaderProps {
  report: ActiveReport;
  onNavigate: (view: AppView) => void;
}

export function ReportHeader({ report, onNavigate }: ReportHeaderProps) {
  return (
    <div className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center z-40">
      <button onClick={() => onNavigate("user-dashboard")} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer bg-transparent border-none transition-colors">
        ← Back to Dashboard
      </button>
      <div className="text-center">
        <p className="text-[var(--text-primary)] font-medium text-sm">{report.url}</p>
        <p className="text-[var(--text-muted)] text-xs">Audited {report.date}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs font-semibold px-2 py-1 rounded" style={{
          background: getScoreBgColor(report.score),
          color: getScoreColor(report.score),
          border: `1px solid ${getScoreBorderColor(report.score)}`,
        }}>
          {report.score}/100
        </div>
        <button className="border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg px-4 py-2 text-sm flex items-center gap-1.5 cursor-pointer bg-transparent hover:text-[var(--text-primary)] transition-colors">
          <Download size={16} /> Download PDF
        </button>
      </div>
    </div>
  );
}
