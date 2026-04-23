"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/features/dashboard/audit-table";
import { MOCK_AUDIT_HISTORY } from "@/constants";
import type { User } from "@/types";

interface UserStat {
  label: string;
  value: string | number;
  trend: string;
  icon: React.ElementType;
  color: string;
}

interface OverviewTabProps {
  user: User;
  userStats: UserStat[];
  onViewHistory: () => void;
}

export function OverviewTab({ user, userStats, onViewHistory }: OverviewTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground mb-1">Good morning, {user.name} 👋</h1>
      <p className="text-muted-foreground text-sm mb-8">Here&apos;s your PageRoast overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {userStats.map((stat, i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
              <p className={`text-xs ${stat.trend.includes('pts') || stat.trend.includes('Used') ? 'text-indigo-400' : 'text-green-400'} mt-1`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-foreground font-semibold text-lg">Recent Audits</h2>
          <Button variant="link" onClick={onViewHistory} className="text-indigo-400 p-0 h-auto">
            View all →
          </Button>
        </div>
        <AuditTable rows={MOCK_AUDIT_HISTORY} />
      </div>
    </div>
  );
}
