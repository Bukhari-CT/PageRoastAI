"use client";

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Admin shell.
 *
 * The previous tabs (dashboard stats, users, plans, settings) rendered entirely
 * fabricated data — invented MRR, subscriber counts, an activity feed and
 * service-health bars — and none of their controls were wired to anything.
 * They have been removed rather than left looking operational. Admin
 * authentication and the `isAdmin` authorization gate are unchanged; real
 * views will be added when they can be backed by database queries.
 */
export function AdminPortal() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin</h1>
          <p className="text-muted-foreground mt-1">Signed in with administrator access.</p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 py-1 px-3">
          <Shield className="h-3 w-3 mr-1.5" />
          Admin
        </Badge>
      </div>

      <Card className="border-dashed border-border bg-transparent">
        <CardContent className="p-12 text-center">
          <p className="text-foreground font-semibold">Nothing to manage yet</p>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Admin dashboard functionality will be added after the MVP, once user,
            audit and subscription data is stored in the database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
