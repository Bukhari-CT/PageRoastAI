"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LandingNavbar } from "@/components/features/landing/landing-navbar";
import { ReportHeader } from "@/components/features/report/report-header";
import { ReportStats } from "@/components/features/report/report-stats";
import { ReportSections } from "@/components/features/report/report-sections";
import { ActionItems } from "@/components/features/report/action-items";

import type { AppView, ActiveReport, User } from "@/types";

interface ReportViewProps {
  reportId?: string;
  report?: ActiveReport;
  user?: User | null;
  onNavigate?: (view: AppView) => void;
}

export function ReportView({ reportId, report: initialReport, user: initialUser, onNavigate: customNavigate }: ReportViewProps) {
  const router = useRouter();
  
  const [user] = useState<User>(initialUser || {
    name: "Alex Kim",
    email: "alex@example.com",
    role: "user",
    plan: "free",
    auditsUsed: 2,
  });

  const report: ActiveReport = initialReport || { 
    url: reportId ? reportId.replace(/-/g, ".") : "example.com", 
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), 
    score: 42, 
    issues: 5 
  };

  const onNavigate = customNavigate || ((view: AppView) => router.push(`/${view === "landing" ? "" : view}`));

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <LandingNavbar />
      
      <div style={{ paddingTop: "72px" }}>
        <ReportHeader report={report} onNavigate={onNavigate} />

        <div className="max-w-[80rem] mx-auto px-6 py-8">
          <ReportStats report={report} />
          <ReportSections url={report.url} />
          <ActionItems />

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
    </div>
  );
}
