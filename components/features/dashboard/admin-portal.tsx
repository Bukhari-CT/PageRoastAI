"use client";

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AdminTab } from "@/types";

import { AdminDashboardTab } from "./admin/admin-dashboard-tab";
import { AdminUsersTab } from "./admin/admin-users-tab";
import { AdminPlansTab } from "./admin/admin-plans-tab";
import { AdminSettingsTab } from "./admin/admin-settings-tab";

export interface AdminStat {
  label: string;
  value: string | number;
  trend: string;
  icon: React.ElementType;
  color: string;
}

interface AdminPortalProps {
  adminStats: AdminStat[];
  activeTab: AdminTab;
}

export function AdminPortal({ adminStats, activeTab }: AdminPortalProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-1 capitalize">{activeTab} management and overview.</p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 py-1 px-3">
          <Shield className="h-3 w-3 mr-1.5" />
          Super Admin
        </Badge>
      </div>

      {activeTab === "dashboard" && <AdminDashboardTab adminStats={adminStats} />}
      {activeTab === "users" && <AdminUsersTab />}
      {activeTab === "plans" && <AdminPlansTab />}
      {activeTab === "settings" && <AdminSettingsTab />}
    </div>
  );
}
