"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Download, CheckCircle as CheckCircleIcon, Loader2 } from "lucide-react";
import { PLAN_LABELS, MOCK_BILLING_HISTORY } from "@/constants";
import { getActivePlansAction } from "@/app/actions/plan.actions";
import type { User } from "@/types";

interface SubscriptionTabProps {
  user: User;
  onUpgrade: (plan: any) => void;
}

export function SubscriptionTab({ user, onUpgrade }: SubscriptionTabProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      const { data } = await getActivePlansAction();
      if (data) {
        setPlans(data);
      }
      setLoading(false);
    }
    loadPlans();
  }, []);
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground mb-1">Subscription</h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your plan and billing.</p>

      <Card className="mb-8 border-border bg-card">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Current Plan</p>
            <p className="text-foreground font-bold text-2xl">{PLAN_LABELS[user.plan] || user.plan}</p>
            <p className="text-muted-foreground text-sm mt-1">
              {user.plan === "free" ? "2 of 3 audits used · Resets Feb 1, 2025"
                : user.plan === "pro" ? "Unlimited audits · Renews Feb 1, 2025"
                  : "Unlimited audits + API · Renews Feb 1, 2025"}
            </p>
            {user.plan === "free" && (
              <div className="w-64 h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: "66%" }} />
              </div>
            )}
          </div>
          {user.plan === "free" && (
            <Button onClick={() => onUpgrade("pro")} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : plans.map((plan) => (
          <Card key={plan.id} className={`border-border bg-card flex flex-col ${user.plan === plan.id || user.plan === plan.name ? 'ring-2 ring-indigo-600' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-indigo-400 mt-2">{plan.price}</div>
            </CardHeader>
            <CardContent className="flex-1">
              {(user.plan === plan.id || user.plan === plan.name) && (
                <div className="inline-block bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] uppercase font-bold tracking-wider px-3 py-1 mb-4">
                  Current Plan
                </div>
              )}
              <ul className="space-y-3 text-sm text-muted-foreground">
                {plan.features.map((f: string, i: number) => <li key={i} className="flex items-start gap-2"><CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> <span className="leading-tight">{f}</span></li>)}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              {user.plan !== plan.id && user.plan !== plan.name && (
                <Button
                  onClick={() => onUpgrade(plan)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Upgrade
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div>
        <h4 className="text-foreground font-semibold text-xl mb-4">Billing History</h4>
        {user.plan === "free" ? (
          <Card className="border-dashed border-border bg-transparent">
            <CardContent className="p-12 text-center">
              <Receipt className="mx-auto h-10 w-10 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">No payments yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Invoice</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_BILLING_HISTORY.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-foreground">{row.id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{row.date}</td>
                      <td className="px-6 py-4 text-foreground">{row.amount}</td>
                      <td className="px-6 py-4"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500" /> Paid</span></td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-300">
                          <Download size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
