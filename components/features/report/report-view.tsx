"use client";

import { Check, Download } from "lucide-react";
import { ScoreRing } from "@/components/features/report/score-ring";
import {
  getGradeLabel, getGradeColor, getScoreColor, getScoreBgColor, getScoreBorderColor,
} from "@/lib/formatting";
import {
  STRENGTHS, ROAST_LINES, ELEMENT_GRADES, ACTION_FIXES,
  REPORT_CRITICAL_ISSUES,
} from "@/constants";
import type { AppView, ActiveReport, User } from "@/types";

interface ReportViewProps {
  report: ActiveReport;
  user: User | null;
  onNavigate: (view: AppView) => void;
}

export function ReportView({ report, user, onNavigate }: ReportViewProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]" style={{ paddingTop: "64px" }}>
      {/* Top Bar */}
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

      <div className="max-w-[80rem] mx-auto px-6 py-8">
        {/* Score + Grades + Stats */}
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

        {/* Strengths + Issues */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
            <h4 className="text-[var(--text-primary)] font-semibold mb-4">What&apos;s Working</h4>
            <div className="space-y-3">
              {STRENGTHS.map((item, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg p-3" style={{ borderLeft: "3px solid var(--success)" }}>
                  <div className="flex gap-2 mb-1">
                    <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.headline}</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-[22px]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
            <h4 className="text-[var(--text-primary)] font-semibold mb-4">Critical Issues</h4>
            <div className="space-y-3">
              {REPORT_CRITICAL_ISSUES.map((item, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg p-3" style={{ borderLeft: "3px solid var(--danger)" }}>
                  <div className="flex gap-2 mb-1">
                    <span className="text-[var(--danger)] text-sm">✕</span>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] ml-[22px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Roast */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🔥</span>
            <h4 className="text-[var(--text-primary)] font-semibold">The Roast</h4>
            <span className="text-xs text-[var(--text-muted)]">Personalized for {report.url}</span>
          </div>
          <div className="space-y-3 mb-4">
            {ROAST_LINES.map((item, i) => (
              <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg p-3" style={{ borderLeft: "3px solid var(--danger)" }}>
                <div className="flex gap-2 mb-1">
                  <span className="text-[var(--danger)]">✕</span>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.headline}</p>
                </div>
                <p className="text-xs text-[var(--text-muted)] ml-[22px]">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="italic text-[var(--text-muted)] text-sm">Honestly? We&apos;ve seen worse. But not much.</p>
        </div>

        {/* Action Items */}
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

        {user?.plan === "free" && (
          <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-8 text-center mt-6">
            <h4 className="text-[var(--text-primary)] text-lg font-semibold mb-2">Unlock the Developer Fix Pack</h4>
            <p className="text-[var(--text-muted)] text-sm mb-4">Get the full rewritten copy doc + annotated component file for every fix on this page.</p>
            <button onClick={() => onNavigate("checkout")} className="bg-[var(--pr-accent)] text-white rounded-lg px-8 py-3 font-semibold text-sm cursor-pointer border-none">
              Upgrade to Pro — $19
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
