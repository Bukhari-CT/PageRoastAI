"use client";

import { useState } from "react";
import { X, Check, CheckCircle, Copy, ArrowRight, Zap, Code, FileText, BarChart3, AlertTriangle } from "lucide-react";
import { ScoreRing } from "@/components/features/report/score-ring";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/useClipboard";
import { SCORE_THRESHOLD_GOOD, SCORE_THRESHOLD_MEDIUM } from "@/constants";
import { PRO_PLAN, formatPlanAllowance, formatPlanPrice } from "@/shared/config/plans";
import { formatReportDate } from "@/lib/formatting";
import type { AppView } from "@/types";
import type { RoastActionResult } from "@/app/actions/roast.actions";

function scoreBarColor(score: number): string {
  if (score >= SCORE_THRESHOLD_GOOD) return "bg-green-500";
  if (score >= SCORE_THRESHOLD_MEDIUM) return "bg-yellow-500";
  return "bg-red-500";
}

function severityBadgeClass(severity: "CRITICAL" | "WARNING" | "HIGH"): string {
  return severity === "WARNING" ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" : "bg-red-500/20 text-red-500 dark:text-red-400";
}

interface LandingResultsPreviewProps {
  result: RoastActionResult;
  onNavigate: (view: AppView) => void;
}

export function LandingResultsPreview({ result, onNavigate }: LandingResultsPreviewProps) {
  const { copied, copy } = useClipboard();
  const [showModal, setShowModal] = useState(false);

  // The first action fix from this audit — real model output, not a sample.
  const primaryFix = result.actionFixes[0];

  return (
    <section className="px-6 py-20 max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Score + link */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-10 flex flex-col items-center gap-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors" />
          <ScoreRing score={result.score} />
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-1">Your UX Score</h3>
            <p className="text-muted-foreground text-sm truncate max-w-[16rem]">{result.url}</p>
          </div>
          <Button
            variant="link"
            onClick={() => setShowModal(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold group/btn"
          >
            View Detailed Analysis 
            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Critical Issues */}
        <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-xl font-bold text-foreground">Critical Vulnerabilities</h3>
          </div>
          <ul className="space-y-6">
            {result.criticalIssues.map((issue, i) => (
              <li key={i} className="flex items-start gap-4 group">
                <div className="mt-1 h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-colors">
                  <X className="h-3.5 w-3.5 text-red-500" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">{issue.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">{issue.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The Roast */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🔥</span>
          <h3 className="text-lg font-bold text-foreground">The Roast</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.roastLines.map((line, i) => (
            <div key={i} className="bg-muted/30 border border-border border-l-[3px] border-l-red-500 rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground">{line.headline}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{line.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rewritten Copy + Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-foreground">Optimized Hero Copy</h3>
          </div>
          <div className="flex-1 min-h-[160px] bg-muted/30 border border-border rounded-2xl p-6 relative group">
            <textarea
              readOnly
              className="w-full h-full bg-transparent border-none text-base text-foreground font-medium resize-none outline-none leading-relaxed italic"
              defaultValue={result.rewrittenHeroCopy}
            />
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">AI Suggested</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl flex flex-col shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-muted/10">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-foreground">{primaryFix.title}</h3>
            </div>
            <button
              onClick={() => copy(primaryFix.code)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-indigo-500" />
                  <span className="text-xs font-mono font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="text-xs font-mono font-bold">Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-8 overflow-x-auto text-sm font-mono text-muted-foreground leading-relaxed bg-[#0F0F0F] dark:bg-black/40">
            <code className="text-indigo-300/90">{primaryFix.code}</code>
          </pre>
        </div>
      </div>

      {/* Next step */}
      <div className="bg-card border border-border rounded-3xl p-10 text-center shadow-sm">
        <div className="max-w-md mx-auto space-y-3">
          <h3 className="text-2xl font-bold text-foreground">Run audits from your dashboard</h3>
          <p className="text-muted-foreground">
            Create a free account to run your audits in one place. {PRO_PLAN.name} adds{" "}
            {formatPlanAllowance(PRO_PLAN)} with the full report for {formatPlanPrice(PRO_PLAN)} —
            payments coming soon.
          </p>
        </div>
        <Button
          onClick={() => onNavigate("signup")}
          size="lg"
          className="mt-6 px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/25"
        >
          Create free account →
        </Button>
      </div>

      {/* Full Audit Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-10 py-8 flex justify-between items-center border-b border-border bg-muted/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Audit Intelligence Report</h3>
                  <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mt-0.5">pageroast-ai · {result.tier} tier · {formatReportDate(result.createdAt)}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12">
              <div>
                <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Diagnostic Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                  {result.elementGrades.map((metric) => (
                    <div key={metric.label} className="group">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{metric.label}</span>
                        <span className="text-sm font-bold text-foreground">{metric.score}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${scoreBarColor(metric.score)} rounded-full transition-all duration-1000`} style={{ width: `${metric.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  Core Strengths
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {result.strengths.map((s, i) => (
                    <div key={i} className="bg-muted/20 border border-border rounded-2xl p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex gap-3 items-start mb-1.5">
                        <div className="mt-1 h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-emerald-500" />
                        </div>
                        <p className="text-sm font-bold text-foreground">{s.headline}</p>
                      </div>
                      <p className="text-xs text-muted-foreground ml-8 leading-relaxed">{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Identified Friction Points
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {result.criticalIssues.map((issue) => (
                    <div key={issue.title} className="bg-muted/30 border border-border rounded-2xl p-5 relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${severityBadgeClass(issue.severity)} rounded-bl-xl opacity-70`}>
                        {issue.severity}
                      </div>
                      <h5 className="text-sm font-bold text-foreground mb-1 group-hover:text-indigo-500 transition-colors">{issue.title}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed pr-20">{issue.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-muted/10 border-t border-border">
              <Button
                onClick={() => onNavigate("signup")}
                size="lg"
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20"
              >
                Create free account →
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
