"use client";

import { ScoreRing } from "@/components/features/report/score-ring";
import { getGradeLabel, getGradeColor } from "@/lib/formatting";
import type { StoredReport } from "@services/ReportStore";

interface ReportStatsProps {
  report: StoredReport;
}

export function ReportStats({ report }: ReportStatsProps) {
  const criticalCount = report.criticalIssues.filter((i) => i.severity === "CRITICAL").length;
  const warningCount = report.criticalIssues.filter((i) => i.severity === "WARNING").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-card border border-border rounded-xl p-6 text-center flex items-center justify-center">
        <ScoreRing score={report.score} />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="text-foreground font-semibold mb-4">Element Grades</h4>
        {report.elementGrades.map((item, i) => (
          <div
            key={i}
            className={`flex justify-between items-center ${i < report.elementGrades.length - 1 ? "pb-3 mb-3 border-b border-border" : ""}`}
          >
            <span className="text-sm text-foreground">{item.label}</span>
            <span className="text-xs font-semibold px-2 py-1 rounded" style={{
              color: getGradeColor(item.score),
              background: `${getGradeColor(item.score)}15`,
              border: `1px solid ${getGradeColor(item.score)}33`,
            }}>
              {getGradeLabel(item.score)}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="text-foreground font-semibold mb-4">Quick Stats</h4>
        {[
          { label: "Issues Found", value: String(report.criticalIssues.length) },
          { label: "Critical", value: String(criticalCount) },
          { label: "Warnings", value: String(warningCount) },
          { label: "Audit Date", value: report.date },
        ].map((item, i, arr) => (
          <div
            key={i}
            className={`flex justify-between ${i < arr.length - 1 ? "pb-3 mb-3 border-b border-border" : ""}`}
          >
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
