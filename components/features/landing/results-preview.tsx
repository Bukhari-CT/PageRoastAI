"use client";

import { useState } from "react";
import { X, Check, CheckCircle, Lock, Copy, ArrowRight, Zap, Code, TrendingUp, FileText, BarChart3, AlertTriangle } from "lucide-react";
import { ScoreRing } from "@/components/features/report/score-ring";
import { Button } from "@/components/ui/button";
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
    <section className="px-6 py-20 max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Score + link */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-10 flex flex-col items-center gap-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors" />
          <ScoreRing score={DEMO_AUDIT_SCORE} />
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-1">Your UX Score</h3>
            <p className="text-muted-foreground text-sm">Below average for your industry</p>
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
            {CRITICAL_ISSUES_LIST.map((truth, i) => (
              <li key={i} className="flex items-start gap-4 group">
                <div className="mt-1 h-6 w-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-colors">
                  <X className="h-3.5 w-3.5 text-red-500" />
                </div>
                <p className="text-base text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{truth}</p>
              </li>
            ))}
          </ul>
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
              defaultValue={AI_REWRITTEN_HERO_COPY}
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
              <h3 className="text-lg font-bold text-foreground">Implementation Fix</h3>
            </div>
            <button
              onClick={() => copy(CODE_SNIPPET)}
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
            <code className="text-indigo-300/90">{CODE_SNIPPET}</code>
          </pre>
        </div>
      </div>

      {/* Paywall */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden relative min-h-[300px] shadow-xl border-dashed border-2">
        <div className="p-10 blur-[6px] pointer-events-none select-none opacity-40" aria-hidden="true">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-foreground">Conversion Optimization Matrix</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-24 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md gap-6 text-center px-8">
          <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <Lock size={32} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Unlock 12+ Professional Insights</h3>
            <p className="text-muted-foreground">Get the full report including page performance, trust signals, and revenue leak detectors.</p>
          </div>
          <Button
            onClick={() => onNavigate("signup")}
            size="lg"
            className="px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/25"
          >
            Unlock Full Report →
          </Button>
        </div>
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
                  <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mt-0.5">pageroast-ai-v2 · Generated 4m ago</p>
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
                  {SCORE_BREAKDOWN_METRICS.map((metric) => (
                    <div key={metric.label} className="group">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{metric.label}</span>
                        <span className="text-sm font-bold text-foreground">{metric.score}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${metric.color} rounded-full transition-all duration-1000`} style={{ width: `${metric.score}%` }} />
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
                  {STRENGTHS.map((s, i) => (
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
                  {AUDIT_ISSUES.map((issue) => (
                    <div key={issue.title} className="bg-muted/30 border border-border rounded-2xl p-5 relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${issue.color} rounded-bl-xl opacity-70`}>
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
                Get Private Dashboard & Fixes →
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
