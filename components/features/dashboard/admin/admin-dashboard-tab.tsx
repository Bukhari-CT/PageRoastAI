"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Calendar, Key } from "lucide-react";
import type { AdminStat } from "../admin-portal";

export function AdminDashboardTab({ adminStats }: { adminStats: AdminStat[] }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat, i) => (
          <Card key={i} className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest actions performed across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { user: "Dan R.", action: "upgraded to", target: "Agency Plan", time: "2 mins ago", icon: Package, color: "text-indigo-400" },
              { user: "Priya K.", action: "ran an audit for", target: "flowbase.io", time: "15 mins ago", icon: Calendar, color: "text-violet-400" },
              { user: "System", action: "processed", target: "12 recurring payments", time: "1 hour ago", icon: Key, color: "text-green-400" },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className={`p-2 rounded-lg bg-background ${act.color}`}>
                  <act.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-bold">{act.user}</span> {act.action} <span className="font-bold">{act.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{act.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>Live status of your core services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { service: "API Engine", status: "Operational", health: 100, color: "bg-green-500" },
              { service: "AI Roaster", status: "High Load", health: 85, color: "bg-amber-500" },
              { service: "Database", status: "Operational", health: 99, color: "bg-green-500" },
              { service: "Storage", status: "Operational", health: 100, color: "bg-green-500" },
            ].map((srv, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground">{srv.service}</span>
                  <span className="text-muted-foreground text-xs">{srv.status}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${srv.color}`} style={{ width: `${srv.health}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
