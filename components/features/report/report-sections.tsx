"use client";

import { Check } from "lucide-react";
import { STRENGTHS, ROAST_LINES, REPORT_CRITICAL_ISSUES } from "@/constants";

export function ReportSections({ url }: { url: string }) {
  return (
    <>
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

      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🔥</span>
          <h4 className="text-[var(--text-primary)] font-semibold">The Roast</h4>
          <span className="text-xs text-[var(--text-muted)]">Personalized for {url}</span>
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
    </>
  );
}
