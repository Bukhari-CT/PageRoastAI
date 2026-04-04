"use client";

import { useState } from "react";
import { X, Check, CheckCircle, Lock, Copy } from "lucide-react";
import { ScoreRing } from "@/components/features/report/score-ring";
import { useClipboard } from "@/hooks/useClipboard";
import {
  ROAST_LINES, STRENGTHS, CODE_SNIPPET, AI_REWRITTEN_HERO_COPY,
  CRITICAL_ISSUES_LIST, SCORE_BREAKDOWN_METRICS, AUDIT_ISSUES,
  DEMO_AUDIT_SCORE, PAYMENT_INCLUDES,
} from "@/constants";
import type { AppView, PlanId, User } from "@/types";

interface LandingResultsPreviewProps {
  onNavigate: (view: AppView) => void;
}

export function LandingResultsPreview({ onNavigate }: LandingResultsPreviewProps) {
  const { copied, copy } = useClipboard();
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="px-6 py-16 max-w-5xl mx-auto space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Score + link */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col items-center gap-4">
          <ScoreRing score={DEMO_AUDIT_SCORE} />
          <button
            onClick={() => setShowModal(true)}
            className="text-indigo-400 hover:text-indigo-300 underline text-sm mt-2 transition-colors cursor-pointer bg-transparent border-none"
          >
            View Full Report →
          </button>
        </div>

        {/* Critical Issues */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
          <h3 className="text-[var(--text-primary)] font-semibold mb-6">Critical Issues</h3>
          <ul className="space-y-4">
            {CRITICAL_ISSUES_LIST.map((truth, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✕</span>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{truth}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rewritten Copy + Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
          <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-4">AI-Rewritten Hero Copy</h3>
          <textarea
            readOnly
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-4 text-sm text-[var(--text-muted)] font-mono resize-none outline-none leading-relaxed"
            rows={5}
            defaultValue={AI_REWRITTEN_HERO_COPY}
          />
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Suggested Fix</h3>
            <button
              onClick={() => copy(CODE_SNIPPET)}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent border-none"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-indigo-500" />
                  <span className="text-xs font-mono">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span className="text-xs font-mono">Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-6 overflow-x-auto text-xs font-mono text-[var(--text-muted)] leading-relaxed bg-[#0F0F0F]">
            <code>{CODE_SNIPPET}</code>
          </pre>
        </div>
      </div>

      {/* Paywall */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden relative min-h-64">
        <div className="p-8 blur-sm pointer-events-none select-none" aria-hidden="true">
          <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-4">Advanced SEO Insights</h3>
          <ul className="space-y-2 text-xs text-[var(--text-muted)] font-mono">
            <li className="flex items-center gap-2">
              <div className="h-2 w-12 bg-zinc-700 rounded" /> Core Web Vitals score
            </li>
          </ul>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl gap-3">
          <Lock size={32} className="text-indigo-500" />
          <button
            onClick={() => onNavigate("signup")}
            className="mt-4 px-6 py-2 font-semibold text-white text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer border-none"
          >
            Sign Up to Unlock →
          </button>
        </div>
      </div>

      {/* Full Audit Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-[var(--text-primary)] font-bold text-xl">Full Audit Report</h3>
                <p className="text-zinc-500 text-sm mt-1">pageexample.com · Audited just now</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent border-none">
                <X size={24} />
              </button>
            </div>

            <div className="px-8 pb-8 space-y-8">
              <div className="pt-4">
                <h4 className="text-[var(--text-primary)] font-semibold mb-4">Score Breakdown</h4>
                <div className="space-y-4">
                  {SCORE_BREAKDOWN_METRICS.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[var(--text-muted)] text-sm">{metric.label}</span>
                        <span className="text-[var(--text-primary)] font-semibold text-sm">{metric.score}/100</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${metric.color} rounded-full transition-all`} style={{ width: `${metric.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[var(--text-primary)] font-semibold mb-4">What&apos;s Working</h4>
                <div className="space-y-3">
                  {STRENGTHS.map((s, i) => (
                    <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg p-4" style={{ borderLeft: "3px solid var(--success)" }}>
                      <div className="flex gap-2 items-start mb-1">
                        <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[var(--text-primary)] text-sm font-medium">{s.headline}</p>
                      </div>
                      <p className="text-[var(--text-muted)] text-xs ml-[22px]">{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[var(--text-primary)] font-semibold mb-4">All Issues Found</h4>
                <div className="space-y-3">
                  {AUDIT_ISSUES.map((issue) => (
                    <div key={issue.title} className="bg-[var(--input-bg)] rounded-lg p-4">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-2 ${issue.color}`}>
                        {issue.severity}
                      </div>
                      <h5 className="text-[var(--text-primary)] text-sm font-medium">{issue.title}</h5>
                      <p className="text-[var(--text-muted)] text-xs mt-1">{issue.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] px-8 py-4">
              <button
                onClick={() => onNavigate("signup")}
                className="w-full py-2 font-semibold text-white text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer border-none"
              >
                Upgrade to Fix My Page →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
