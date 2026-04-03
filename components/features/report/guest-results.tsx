"use client";

import { Copy, Check, Lock } from "lucide-react";
import { ScoreRing } from "@/components/features/report/score-ring";
import { useClipboard } from "@/hooks/use-clipboard";
import { ROAST_LINES, CODE_SNIPPET, AI_REWRITTEN_HERO_COPY, DEMO_AUDIT_SCORE } from "@/constants";
import type { AppView } from "@/types";

interface GuestResultsProps {
  onNavigate: (view: AppView) => void;
  onShowModal: () => void;
}

export function GuestResults({ onNavigate, onShowModal }: GuestResultsProps) {
  const { copied, copy } = useClipboard();

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => onNavigate("landing")}
          className="text-[var(--text-primary)] font-bold text-lg hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
        >
          🔥 PageRoast
        </button>
        <div className="flex items-center gap-4">
          <span className="text-[var(--text-muted)] text-sm">Create free account to save this report</span>
          <button
            onClick={() => onNavigate("signup")}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer border-none"
          >
            Sign Up Free →
          </button>
        </div>
      </div>

      <div className="px-6 py-16 max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Audit Report</h1>
          <p className="text-[var(--text-muted)] text-sm mb-4">example.com · Analyzed just now</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <span className="text-red-400 text-sm font-mono font-semibold">Score: {DEMO_AUDIT_SCORE}/100</span>
          </div>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col items-center gap-4">
            <ScoreRing score={DEMO_AUDIT_SCORE} />
            <button
              onClick={onShowModal}
              className="text-indigo-400 hover:text-indigo-300 underline text-sm mt-2 transition-colors cursor-pointer bg-transparent border-none"
            >
              View Full Report →
            </button>
          </div>

          <div className="col-span-2">
            <p className="italic text-[var(--text-muted)] text-sm mb-4">
              Honestly? We&apos;ve seen worse. But not much.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {ROAST_LINES.map((roast, i) => (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-color)] border-l-3 border-l-[var(--danger)] rounded-lg p-4" style={{ borderLeft: "3px solid var(--danger)" }}>
                  <div className="flex gap-2 items-start mb-1">
                    <span className="text-[var(--danger)] text-sm mt-0.5 flex-shrink-0">✕</span>
                    <p className="text-[var(--text-primary)] text-sm font-medium">{roast.headline}</p>
                  </div>
                  <p className="text-[var(--text-muted)] text-xs mt-1 ml-[22px]">{roast.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rewritten Copy + Code */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-4">AI-Rewritten Hero Copy</h3>
            <textarea
              readOnly
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-4 text-sm text-[var(--text-muted)] font-mono resize-none outline-none"
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

        {/* Paywall teaser */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden relative min-h-64 mb-8">
          <div className="p-8 blur-sm pointer-events-none select-none" aria-hidden="true">
            <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-4">Advanced SEO Insights</h3>
            <ul className="space-y-2 text-xs text-[var(--text-muted)] font-mono">
              <li className="flex items-center gap-2">
                <div className="h-2 w-12 bg-zinc-700 rounded" />
                Core Web Vitals score
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-24 bg-zinc-700 rounded" />
                Missing meta descriptions
              </li>
            </ul>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl gap-3">
            <Lock size={32} className="text-indigo-500" />
            <div className="text-center">
              <p className="text-[var(--text-primary)] font-semibold text-lg">Advanced SEO Insights</p>
            </div>
            <button
              onClick={() => onNavigate("signup")}
              className="mt-4 px-6 py-2 font-semibold text-white text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer border-none"
            >
              Unlock Full Report →
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-[var(--text-primary)] font-bold text-2xl mb-2">Save this report and fix 5x more issues</h2>
          <p className="text-[var(--text-muted)] mb-6">Free account includes full audit history and copy-paste code fixes.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onNavigate("signup")}
              className="px-6 py-3 font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer border-none"
            >
              Sign Up Free →
            </button>
            <button
              onClick={() => onNavigate("landing")}
              className="px-6 py-3 font-semibold text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer bg-transparent"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
