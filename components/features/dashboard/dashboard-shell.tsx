"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardSidebar } from "@/components/features/dashboard/dashboard-sidebar";
import { OverviewTab } from "@/components/features/dashboard/overview-tab";
import { RoastTab } from "@/components/features/dashboard/roast-tab";
import { SubscriptionTab } from "@/components/features/dashboard/subscription-tab";
import { AdminPortal } from "@/components/features/dashboard/admin-portal";
import { AuditTable } from "@/components/features/dashboard/audit-table";
import { UserSettingsTab } from "@/components/features/settings/user-settings-tab";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { useLoadingSteps } from "@/hooks/useLoadingSteps";
import { useLogout } from "@/hooks/useAuth";
import { getPlanBadgeClass } from "@/lib/formatting";
import { isValidUrl } from "@/lib/utils";
import { roastUrlAction } from "@/app/actions/roast.actions";
import { auditFailureMessage, takePendingAuditUrl } from "@/lib/auditFeedback";
import type { StoredReport } from "@services/ReportStore";
import type { AuditUsage } from "@application/Usage/AuditUsageTypes";
import { resolvePlan } from "@/shared/config/plans";
import { USER_NAV_ITEMS, ADMIN_NAV_ITEMS } from "@/constants";
import type { AppView, AuditRow, User, UserTab } from "@/types";

interface DashboardShellProps {
  user?: User;
  /** Persisted audit history, loaded server-side in app/dashboard/page.tsx. */
  history?: AuditRow[];
  /** Real usage, computed server-side by the usage service. */
  usage: AuditUsage;
  onNavigate?: (view: AppView) => void;
  onLogout?: () => void;
  onUpdateUser?: (user: User) => void;
}

export function DashboardShell({
  user: initialUser,
  history = [],
  usage,
  onLogout: customLogout,
  onUpdateUser: customUpdateUser,
}: DashboardShellProps) {
  const router = useRouter();

  // Use server-provided user as the source of truth, but still support local state for UI updates
  const [currentUser, setCurrentUser] = useState<User>(initialUser || {
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    plan: "free",
  });

  const user = currentUser;
  const { logout } = useLogout();

  const onLogout = customLogout || (async () => {
    await logout();
  });
  const onUpdateUser = (newUser: User) => {
    setCurrentUser(newUser);
    if (customUpdateUser) customUpdateUser(newUser);
  };

  const [userTab, setUserTab] = useState<UserTab>("dashboard");
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [roastResult, setRoastResult] = useState<StoredReport | null>(null);
  const [liveUsage, setLiveUsage] = useState<AuditUsage>(usage);

  const { activeStep, completedSteps } = useLoadingSteps(isLoading);

  // A visitor who typed a URL before signing in gets it back here rather than
  // having to remember it. Cleared on read, so it is offered only once.
  useEffect(() => {
    const pending = takePendingAuditUrl();
    if (pending) {
      setAuditUrl(pending);
      setUserTab("roast");
    }
  }, []);

  const isAdmin = user.role === "admin";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
  const plan = resolvePlan(user.plan);

  async function handleRoastClick() {
    const trimmed = auditUrl.trim();
    if (!trimmed) return setUrlError("Please enter a URL to audit.");
    if (!isValidUrl(trimmed)) return setUrlError("Enter a valid URL (e.g. https://example.com)");

    setUrlError("");
    setIsLoading(true);
    const result = await roastUrlAction(trimmed);
    setIsLoading(false);

    if (result.status === "success") {
      setRoastResult(result.report);
      setLiveUsage((current) => ({ ...current, ...result.usage }));
      setShowResults(true);
      return;
    }

    if (result.status === "auth_required") {
      // The session expired mid-visit; send them back through login.
      router.push("/login?callbackUrl=%2Fdashboard");
      return;
    }

    if (result.status === "limit_reached") {
      setLiveUsage((current) => ({ ...current, ...result.usage }));
    }

    setUrlError(auditFailureMessage(result.status));
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <DashboardSidebar
          user={user}
          navItems={navItems}
          activeTab={isAdmin ? "dashboard" : userTab}
          onTabChange={(id) => { if (!isAdmin) setUserTab(id as UserTab); }}
          onLogout={onLogout}
        />

        <SidebarInset className="flex-1 overflow-auto bg-background">
          <header className="h-16 flex items-center px-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mx-4 h-4" />
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${getPlanBadgeClass(plan.id)}`}>
                {plan.name}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <ThemeToggle />
            </div>
          </header>
          <main className="p-8">
            {!isAdmin && userTab === "dashboard" && (
              <OverviewTab
                user={user}
                history={history}
                usage={liveUsage}
                onStartRoast={() => setUserTab("roast")}
                onViewHistory={() => setUserTab("history")}
              />
            )}
            {!isAdmin && userTab === "roast" && (
              <RoastTab
                user={user}
                auditUrl={auditUrl}
                urlError={urlError}
                isLoading={isLoading}
                showResults={showResults}
                roastResult={roastResult}
                usage={liveUsage}
                activeStep={activeStep}
                completedSteps={completedSteps}
                onAuditUrlChange={(val) => { setAuditUrl(val); setUrlError(""); }}
                onRoast={handleRoastClick}
                onReset={() => { setShowResults(false); setAuditUrl(""); setRoastResult(null); }}
                onViewReport={(reportId) => router.push(`/report/${reportId}`)}
                onUpgrade={() => setUserTab("subscription")}
              />
            )}
            {!isAdmin && userTab === "history" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-bold text-foreground mb-8">Audit History</h1>
                <AuditTable rows={history} />
              </div>
            )}
            {!isAdmin && userTab === "subscription" && (
              <SubscriptionTab user={user} usage={liveUsage} />
            )}
            {!isAdmin && userTab === "settings" && (
              <UserSettingsTab user={user} onUpdateUser={onUpdateUser} />
            )}
            {isAdmin && <AdminPortal />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
