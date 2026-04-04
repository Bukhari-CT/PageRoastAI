"use client";

import { ScoreRing } from "@/components/features/report/score-ring";
import { getGradeLabel, getGradeColor } from "@/lib/formatting";
import { ELEMENT_GRADES } from "@/constants";
import type { ActiveReport } from "@/types";

interface ReportStatsProps {
  report: ActiveReport;
}

export function ReportStats({ report }: ReportStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 text-center">
        <ScoreRing score={report.score} />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
        <h4 className="text-[var(--text-primary)] font-semibold mb-4">Element Grades</h4>
        {ELEMENT_GRADES.map((item, i) => (
          <div key={i} className="flex justify-between items-center" style={{
            paddingBottom: i < ELEMENT_GRADES.length - 1 ? "12px" : "0",
            borderBottom: i < ELEMENT_GRADES.length - 1 ? "1px solid var(--border-color)" : "none",
            marginBottom: i < ELEMENT_GRADES.length - 1 ? "12px" : "0",
          }}>
            <span className="text-sm text-[var(--text-primary)]">{item.label}</span>
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

      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
        <h4 className="text-[var(--text-primary)] font-semibold mb-4">Quick Stats</h4>
        {[
          { label: "Issues Found", value: String(report.issues) },
          { label: "Critical", value: "2" },
          { label: "Warnings", value: "3" },
          { label: "Audit Date", value: report.date },
        ].map((item, i, arr) => (
          <div key={i} className="flex justify-between" style={{
            paddingBottom: i < arr.length - 1 ? "12px" : "0",
            borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
            marginBottom: i < arr.length - 1 ? "12px" : "0",
          }}>
            <span className="text-xs text-[var(--text-muted)]">{item.label}</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
