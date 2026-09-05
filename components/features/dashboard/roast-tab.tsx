"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreRing } from "@/components/features/report/score-ring";
import { LoadingStepList } from "@/components/ui/loading-step-list";
import { formatPlanAllowance, resolvePlan } from "@/shared/config/plans";
import type { User } from "@/types";
import type { RoastActionResult } from "@/app/actions/roast.actions";

interface RoastTabProps {
  user: User;
  auditUrl: string;
  urlError: string;
  isLoading: boolean;
  showResults: boolean;
  roastResult: RoastActionResult | null;
  activeStep: number;
  completedSteps: number[];
  onAuditUrlChange: (val: string) => void;
  onRoast: () => void;
  onReset: () => void;
  onViewReport: (url: string) => void;
  onUpgrade: () => void;
}

export function RoastTab({
  user,
  auditUrl,
  urlError,
  isLoading,
  showResults,
  roastResult,
  activeStep,
  completedSteps,
  onAuditUrlChange,
  onRoast,
  onReset,
  onViewReport,
  onUpgrade
}: RoastTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Roast a New Page</h1>
        <p className="text-muted-foreground text-sm">Paste any public URL for an instant UX audit.</p>
      </div>

      <Card className="border-border bg-card shadow-xl overflow-hidden">
        <CardContent className="p-10">
          {user.plan === "free" && (
            <div className="mb-8 flex flex-wrap justify-between items-center gap-2 text-sm">
              <p className="text-muted-foreground">
                Free plan — {formatPlanAllowance(resolvePlan(user.plan))}
              </p>
              <Button variant="link" onClick={onUpgrade} className="text-indigo-400 p-0 h-auto text-xs">
                See Pro
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="https://yourlandingpage.com"
                value={auditUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAuditUrlChange(e.target.value)}
                className={`h-14 text-lg bg-input ${urlError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {urlError && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {urlError}
                </p>
              )}
            </div>
            <p className="text-muted-foreground text-xs text-center">Works with any public URL — Webflow, Framer, Squarespace, custom domains.</p>

            <Button
              onClick={onRoast}
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 transition-all shadow-lg"
            >
              {isLoading ? "Analyzing..." : "Roast This Page →"}
            </Button>
          </div>

          {isLoading && (
            <div className="mt-8 p-6 bg-muted/40 rounded-xl border border-border">
              <LoadingStepList activeStep={activeStep} completedSteps={completedSteps} />
            </div>
          )}

          {showResults && roastResult && (
            <div className="mt-8 p-6 bg-muted/40 rounded-xl border border-border animate-in zoom-in-95 duration-300">
              <div className="flex gap-6 mb-6">
                <ScoreRing score={roastResult.score} size={80} />
                <div className="flex-1">
                  <p className="text-foreground font-semibold mb-2">Quick Issues Found</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {roastResult.roastLines.slice(0, 2).map((line, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-red-500 font-bold">✕</span> {line.headline}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => onViewReport(roastResult.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-500">View Full Report →</Button>
                <Button variant="outline" onClick={onReset} className="flex-1">Start New Audit</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
