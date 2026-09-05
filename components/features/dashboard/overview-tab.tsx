"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { formatPlanAllowance, resolvePlan } from "@/shared/config/plans";
import type { User } from "@/types";

interface OverviewTabProps {
  user: User;
  onStartRoast: () => void;
}

export function OverviewTab({ user, onStartRoast }: OverviewTabProps) {
  const plan = resolvePlan(user.plan);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground mb-1">Welcome, {user.name} 👋</h1>
      <p className="text-muted-foreground text-sm mb-8">
        You&apos;re on the {plan.name} plan — {formatPlanAllowance(plan)}.
      </p>

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
    </div>
  );
}
