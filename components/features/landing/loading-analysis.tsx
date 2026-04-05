"use client";

import { LoadingStepList } from "@/components/ui/loading-step-list";

interface LoadingAnalysisProps {
  activeStep: number;
  completedSteps: number[];
  totalSteps: number;
}

export function LoadingAnalysis({ activeStep, completedSteps, totalSteps }: LoadingAnalysisProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-8 max-w-lg w-full mx-auto">
        <p className="text-[var(--text-primary)] font-semibold mb-6">Analyzing your page...</p>
        <LoadingStepList activeStep={activeStep} completedSteps={completedSteps} />
        <div className="mt-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
