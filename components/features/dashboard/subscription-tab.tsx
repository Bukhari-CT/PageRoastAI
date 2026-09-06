"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, CheckCircle as CheckCircleIcon } from "lucide-react";
import { PLAN_LIST, resolvePlan } from "@/shared/config/plans";
import { formatUsage, usageResetNote } from "@/lib/formatting";
import type { User } from "@/types";
import type { AuditUsage } from "@application/Usage/AuditUsageTypes";

interface SubscriptionTabProps {
  user: User;
  usage: AuditUsage;
}

export function SubscriptionTab({ user, usage }: SubscriptionTabProps) {
  const currentPlan = resolvePlan(user.plan);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground mb-1">Subscription</h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your plan and billing.</p>

      <Card className="mb-8 border-border bg-card">
        <CardContent className="p-6 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Current Plan</p>
            <p className="text-foreground font-bold text-2xl">{currentPlan.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{formatUsage(usage)}</p>
            {usageResetNote(usage) && (
              <p className="text-muted-foreground text-xs mt-1">{usageResetNote(usage)}</p>
            )}
          </div>
          {currentPlan.id === "free" && (
            <Button size="lg" disabled title="Payments are not enabled yet">
              Payments coming soon
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {PLAN_LIST.map((plan) => (
          <Card key={plan.id} className={`border-border bg-card ${currentPlan.id === plan.id ? 'ring-2 ring-indigo-600' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-indigo-400">${plan.price}</span>
                {plan.billingInterval && (
                  <span className="text-muted-foreground text-sm">/{plan.billingInterval}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentPlan.id === plan.id && (
                <div className="inline-block bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] uppercase font-bold tracking-wider px-3 py-1 mb-4">
                  Current Plan
                </div>
              )}
              <ul className="space-y-3 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentPlan.id !== plan.id && plan.id !== "free" && (
                <Button className="w-full" disabled title="Payments are not enabled yet">
                  Payments coming soon
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div>
        <h4 className="text-foreground font-semibold text-xl mb-4">Billing History</h4>
        <Card className="border-dashed border-border bg-transparent">
          <CardContent className="p-12 text-center">
            <Receipt className="mx-auto h-10 w-10 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">
              Billing will become available after payments are enabled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
