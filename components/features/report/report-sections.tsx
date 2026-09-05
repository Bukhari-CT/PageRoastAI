"use client";

import { Check } from "lucide-react";
import type { StoredReport } from "@services/ReportStore";

export function ReportSections({ report }: { report: StoredReport }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h4 className="text-foreground font-semibold mb-4">What&apos;s Working</h4>
          <div className="space-y-3">
            {report.strengths.map((item, i) => (
              <div key={i} className="bg-muted/40 border border-border border-l-[3px] border-l-green-500 rounded-lg p-3">
                <div className="flex gap-2 mb-1">
                  <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-foreground">{item.headline}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-[22px]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h4 className="text-foreground font-semibold mb-4">Critical Issues</h4>
          <div className="space-y-3">
            {report.criticalIssues.map((item, i) => (
              <div key={i} className="bg-muted/40 border border-border border-l-[3px] border-l-red-500 rounded-lg p-3">
                <div className="flex gap-2 mb-1">
                  <span className="text-red-500 text-sm">✕</span>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-[22px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">🔥</span>
          <h4 className="text-foreground font-semibold">The Roast</h4>
          <span className="text-xs text-muted-foreground">Personalized for {report.url}</span>
        </div>
        <div className="space-y-3 mb-4">
          {report.roastLines.map((item, i) => (
            <div key={i} className="bg-muted/40 border border-border border-l-[3px] border-l-red-500 rounded-lg p-3">
              <div className="flex gap-2 mb-1">
                <span className="text-red-500">✕</span>
                <p className="text-sm font-medium text-foreground">{item.headline}</p>
              </div>
              <p className="text-xs text-muted-foreground ml-[22px]">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="italic text-muted-foreground text-sm">Honestly? We&apos;ve seen worse. But not much.</p>
      </div>
    </>
  );
}
