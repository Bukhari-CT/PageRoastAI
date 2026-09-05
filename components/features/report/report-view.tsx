"use client";

import { useRouter } from "next/navigation";

import { ReportHeader } from "@/components/features/report/report-header";
import { ReportStats } from "@/components/features/report/report-stats";
import { ReportSections } from "@/components/features/report/report-sections";
import { ActionItems } from "@/components/features/report/action-items";

import { PRO_PLAN, formatPlanAllowance, formatPlanPrice } from "@/shared/config/plans";
import type { AppView } from "@/types";
import type { StoredReport } from "@services/ReportStore";

interface ReportViewProps {
  report: StoredReport;
  onNavigate?: (view: AppView) => void;
}

export function ReportView({ report, onNavigate: customNavigate }: ReportViewProps) {
  const router = useRouter();

  const onNavigate =
    customNavigate ||
    ((view: AppView) => router.push(`/${view === "landing" ? "" : view}`));

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader report={report} onNavigate={onNavigate} />

      <div className="max-w-[80rem] mx-auto px-6 py-8">
        <ReportStats report={report} />
        <ReportSections report={report} />
        <ActionItems report={report} />

        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-8 text-center mt-6">
          <h4 className="text-foreground text-lg font-semibold mb-2">
            {PRO_PLAN.name} — {formatPlanAllowance(PRO_PLAN)}
          </h4>
          <p className="text-muted-foreground text-sm mb-4">
            {formatPlanPrice(PRO_PLAN)}, billed monthly. Payments aren&apos;t enabled yet —
            audits are free while we finish setting them up.
          </p>
          <button
            type="button"
            disabled
            title="Payments are not enabled yet"
            className="border border-border text-muted-foreground rounded-lg px-8 py-3 font-semibold text-sm bg-transparent cursor-not-allowed opacity-70"
          >
            Payments coming soon
          </button>
        </div>
      </div>
    </div>
  );
}
