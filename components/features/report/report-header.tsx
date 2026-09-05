"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getScoreBgColor, getScoreColor, getScoreBorderColor } from "@/lib/formatting";
import type { AppView } from "@/types";
import type { StoredReport } from "@services/ReportStore";

interface ReportHeaderProps {
  report: StoredReport;
  onNavigate: (view: AppView) => void;
}

export function ReportHeader({ report, onNavigate }: ReportHeaderProps) {
  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex justify-between items-center z-40">
      <div className="flex items-center gap-4">
        <button onClick={() => onNavigate("landing")} className="font-bold text-sm text-foreground hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none flex items-center gap-1.5">
          🔥 PageRoast
        </button>
        <span className="hidden sm:block h-4 w-px bg-border" />
        <button onClick={() => onNavigate("dashboard")} className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm cursor-pointer bg-transparent border-none transition-colors">
          ← Back to Dashboard
        </button>
      </div>
      <div className="text-center hidden md:block">
        <p className="text-foreground font-medium text-sm">{report.url}</p>
        <p className="text-muted-foreground text-xs">Audited {report.date}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs font-semibold px-2 py-1 rounded" style={{
          background: getScoreBgColor(report.score),
          color: getScoreColor(report.score),
          border: `1px solid ${getScoreBorderColor(report.score)}`,
        }}>
          {report.score}/100
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
