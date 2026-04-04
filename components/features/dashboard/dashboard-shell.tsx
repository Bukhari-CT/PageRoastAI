"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, TrendingUp, CheckCircle, Zap, Users, DollarSign } from "lucide-react";

import { DashboardSidebar } from "@/components/features/dashboard/dashboard-sidebar";
import { OverviewTab } from "@/components/features/dashboard/overview-tab";
import { RoastTab } from "@/components/features/dashboard/roast-tab";
import { SubscriptionTab } from "@/components/features/dashboard/subscription-tab";
import { AdminPortal } from "@/components/features/dashboard/admin-portal";
import { PaymentDialog } from "@/components/features/dashboard/payment-dialog";
import { AuditTable } from "@/components/features/dashboard/audit-table";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { useLoadingSteps } from "@/hooks/useLoadingSteps";
import { getPlanBadgeClass } from "@/lib/formatting";
import { isValidUrl } from "@/lib/validators";
import {
  USER_NAV_ITEMS, ADMIN_NAV_ITEMS,
  PLAN_LABELS, MOCK_AUDIT_HISTORY,
} from "@/constants";
import type { AppView, User, UserTab, AdminTab } from "@/types";

interface DashboardShellProps {
  user?: User;
  onNavigate?: (view: AppView) => void;
  onLogout?: () => void;
  onUpdateUser?: (user: User) => void;
}

export function DashboardShell({ user: initialUser, onLogout: customLogout, onUpdateUser: customUpdateUser }: DashboardShellProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User>(initialUser || {
    name: "Alex Kim",
    email: "alex@example.com",
    role: "user",
    plan: "free",
    auditsUsed: 2,
  });

  const user = currentUser;
  const onLogout = customLogout || (() => router.push("/"));
  const onUpdateUser = (newUser: User) => {
    setCurrentUser(newUser);
    if (customUpdateUser) customUpdateUser(newUser);
  };

  const [userTab, setUserTab] = useState<UserTab>("dashboard");
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("pro");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ name: "", card: "", expiry: "", cvc: "" });

  const { activeStep, completedSteps } = useLoadingSteps(isLoading);

  const isAdmin = user.role === "admin";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
  const activeTab = isAdmin ? adminTab : userTab;

  function handleRoastClick() {
    const trimmed = auditUrl.trim();
    if (!trimmed) return setUrlError("Please enter a URL to audit.");
    if (!isValidUrl(trimmed)) return setUrlError("Enter a valid URL (e.g. https://example.com)");

    setUrlError("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 3000);
  }

  const adminStats = [
    { icon: Users, label: "Total Users", value: "1,284", trend: "+48 this week", color: "text-indigo-400" },
    { icon: FileSearch, label: "Audits Run", value: "9,420", trend: "+312 today", color: "text-violet-400" },
    { icon: DollarSign, label: "MRR", value: "$4,180", trend: "+$340 this month", color: "text-green-400" },
    { icon: TrendingUp, label: "Avg Score", value: "54", trend: "across all audits", color: "text-yellow-400" },
  ];

  const userStats = [
    { icon: FileSearch, label: "Total Audits", value: "12", trend: "+3 this week", color: "text-indigo-400" },
    { icon: TrendingUp, label: "Avg. Score", value: "58", trend: "↑ 12 pts from last month", color: "text-yellow-400" },
    { icon: CheckCircle, label: "Issues Fixed", value: "34", trend: "across all audits", color: "text-green-400" },
    { icon: Zap, label: "Audits Used", value: "2/3", trend: "1 remaining this month", color: "text-indigo-400" },
  ];

  function handlePaymentSuccess(plan: "pro" | "agency") {
    onUpdateUser({ ...user, plan });
    setShowPaymentModal(false);
    setShowPaymentSuccess(true);
    setTimeout(() => setShowPaymentSuccess(false), 3000);
    setPaymentForm({ name: "", card: "", expiry: "", cvc: "" });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <DashboardSidebar
          user={user}
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={(id) => isAdmin ? setAdminTab(id as AdminTab) : setUserTab(id as UserTab)}
          onLogout={onLogout}
        />

        <SidebarInset className="flex-1 overflow-auto bg-background">
          <header className="h-16 flex items-center px-8 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mx-4 h-4" />
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${getPlanBadgeClass(user.plan)}`}>
                {PLAN_LABELS[user.plan] || user.plan}
              </span>
            </div>
          </header>
          <main className="p-8">
            {!isAdmin && userTab === "dashboard" && (
              <OverviewTab user={user} userStats={userStats} onViewHistory={() => setUserTab("history")} />
            )}
            {!isAdmin && userTab === "roast" && (
              <RoastTab
                user={user}
                auditUrl={auditUrl}
                urlError={urlError}
                isLoading={isLoading}
                showResults={showResults}
                activeStep={activeStep}
                completedSteps={completedSteps}
                onAuditUrlChange={(val) => { setAuditUrl(val); setUrlError(""); }}
                onRoast={handleRoastClick}
                onReset={() => { setShowResults(false); setAuditUrl(""); }}
                onUpgrade={() => setUserTab("subscription")}
              />
            )}
            {!isAdmin && userTab === "history" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-bold text-foreground mb-8">Audit History</h1>
                <AuditTable rows={MOCK_AUDIT_HISTORY} />
              </div>
            )}
            {!isAdmin && userTab === "subscription" && (
              <SubscriptionTab user={user} onUpgrade={(plan) => { setSelectedPlan(plan); setShowPaymentModal(true); }} />
            )}
            {isAdmin && <AdminPortal adminStats={adminStats} />}
          </main>
        </SidebarInset>
      </div>

      {showPaymentSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 z-50 animate-in slide-in-from-right-10">
          Payment successful! Plan upgraded.
        </div>
      )}

      <PaymentDialog
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        selectedPlan={selectedPlan}
        onSuccess={handlePaymentSuccess}
        form={paymentForm}
        onFormChange={setPaymentForm}
      />
    </SidebarProvider>
  );
}
