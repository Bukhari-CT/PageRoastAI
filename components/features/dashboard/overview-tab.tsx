"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { AuditTable } from "@/components/features/dashboard/audit-table";
import { formatPlanAllowance, resolvePlan } from "@/shared/config/plans";
import type { AuditRow, User } from "@/types";

/** Recent audits shown on the overview before sending the user to History. */
const RECENT_LIMIT = 5;

interface OverviewTabProps {
  user: User;
  history: AuditRow[];
  onStartRoast: () => void;
  onViewHistory: () => void;
}

export function OverviewTab({ user, history, onStartRoast, onViewHistory }: OverviewTabProps) {
  const plan = resolvePlan(user.plan);
  const recent = history.slice(0, RECENT_LIMIT);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground mb-1">Welcome, {user.name} 👋</h1>
      <p className="text-muted-foreground text-sm mb-8">
        You&apos;re on the {plan.name} plan — {formatPlanAllowance(plan)}.
      </p>

      {recent.length === 0 ? (
        <Card className="border-dashed border-border bg-transparent">
          <CardContent className="p-12 text-center flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Flame className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-foreground font-semibold">No audits yet</p>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                Run your first audit and your results will show up here.
              </p>
            </div>
            <Button onClick={onStartRoast} className="bg-indigo-600 hover:bg-indigo-500 mt-2">
              Roast a page →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-foreground font-semibold text-lg">Recent Audits</h2>
            {history.length > RECENT_LIMIT && (
              <Button variant="link" onClick={onViewHistory} className="text-indigo-400 p-0 h-auto">
                View all →
              </Button>
            )}
          </div>
          <AuditTable rows={recent} />
          <div className="mt-6">
            <Button onClick={onStartRoast} className="bg-indigo-600 hover:bg-indigo-500">
              Roast another page →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
