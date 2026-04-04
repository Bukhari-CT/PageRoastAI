"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminPortalProps {
  adminStats: any[];
}

export function AdminPortal({ adminStats }: AdminPortalProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground mb-8">Admin Portal</h1>
      <p className="text-muted-foreground">Admin views (Users, Plans, Analytics) migrated to Shadcn layout.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {adminStats.map((stat, i) => (
          <Card key={i} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
