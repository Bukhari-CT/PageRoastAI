"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, FileSearch, TrendingUp, CheckCircle, Zap, Users, DollarSign, Eye, Trash2, Ban, Download, Receipt, X, Lock, CheckCircle as CheckCircleIcon } from "lucide-react";
import { AuditTable } from "@/components/features/dashboard/audit-table";
import { ScoreRing } from "@/components/features/report/score-ring";
import { LoadingStepList } from "@/components/ui/loading-step-list";
import { useLoadingSteps } from "@/hooks/use-loading-steps";
import { getPlanBadgeClass } from "@/lib/formatting";
import { isValidUrl } from "@/lib/validators";
import {
  USER_NAV_ITEMS, ADMIN_NAV_ITEMS,
  MOCK_AUDIT_HISTORY, MOCK_BILLING_HISTORY,
  SUBSCRIPTION_PLANS,
  PLAN_LABELS, FREE_AUDIT_LIMIT, FREE_AUDITS_USED,
  DEMO_QUICK_SCORE, PAYMENT_INCLUDES,
} from "@/constants";
import type { AppView, User, UserTab, AdminTab } from "@/types";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface DashboardShellProps {
  user?: User;
  onNavigate?: (view: AppView) => void;
  onLogout?: () => void;
  onUpdateUser?: (user: User) => void;
}

export function DashboardShell({ user: initialUser, onNavigate: customNavigate, onLogout: customLogout, onUpdateUser: customUpdateUser }: DashboardShellProps) {
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
    if (!trimmed) {
      setUrlError("Please enter a URL to audit.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setUrlError("Enter a valid URL (e.g. https://example.com)");
      return;
    }
    setUrlError("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 3000);
  }

  // ─── Admin Stats ─────────────────────────────────────────────────────────
  const adminStats = [
    { icon: Users, label: "Total Users", value: "1,284", trend: "+48 this week", color: "text-indigo-400" },
    { icon: FileSearch, label: "Audits Run", value: "9,420", trend: "+312 today", color: "text-violet-400" },
    { icon: DollarSign, label: "MRR", value: "$4,180", trend: "+$340 this month", color: "text-green-400" },
    { icon: TrendingUp, label: "Avg Score", value: "54", trend: "across all audits", color: "text-yellow-400" },
  ];

  // ─── User Stats ──────────────────────────────────────────────────────────
  const userStats = [
    { icon: FileSearch, label: "Total Audits", value: "12", trend: "+3 this week", color: "text-indigo-400" },
    { icon: TrendingUp, label: "Avg. Score", value: "58", trend: "↑ 12 pts from last month", color: "text-yellow-400" },
    { icon: CheckCircle, label: "Issues Fixed", value: "34", trend: "across all audits", color: "text-green-400" },
    { icon: Zap, label: "Audits Used", value: "2/3", trend: "1 remaining this month", color: "text-indigo-400" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar collapsible="icon" className="border-r border-border bg-sidebar overflow-hidden">
          <SidebarHeader className="h-16 flex items-center px-6">
            <p className="text-foreground font-bold text-lg group-data-[collapsible=icon]:hidden">🔥 PageRoast</p>
            <p className="text-foreground font-bold text-lg hidden group-data-[collapsible=icon]:block">🔥</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={activeTab === item.id}
                        onClick={() => isAdmin ? setAdminTab(item.id as AdminTab) : setUserTab(item.id as UserTab)}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-600 text-white text-[10px]">
                  {user.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                <p className="text-foreground text-sm font-medium truncate">{user.name}</p>
                <p className="text-muted-foreground text-xs truncate">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:hidden"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

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
            {/* USER: Dashboard Tab */}
            {!isAdmin && userTab === "dashboard" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-bold text-foreground mb-1">Good morning, {user.name} 👋</h1>
                <p className="text-muted-foreground text-sm mb-8">Here&apos;s your PageRoast overview.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {userStats.map((stat, i) => (
                    <Card key={i} className="border-border bg-card">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.label}
                        </CardTitle>
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
                    <Button variant="link" onClick={() => setUserTab("history")} className="text-indigo-400 p-0 h-auto">
                      View all →
                    </Button>
                  </div>
                  <AuditTable rows={MOCK_AUDIT_HISTORY} />
                </div>
              </div>
            )}

            {/* USER: Roast Tab */}
            {!isAdmin && userTab === "roast" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Roast a New Page</h1>
                  <p className="text-muted-foreground text-sm">Paste any public URL for an instant UX audit.</p>
                </div>

                <Card className="border-border bg-card shadow-xl overflow-hidden">
                  <CardContent className="p-10">
                    {user.plan === "free" && (
                      <div className="mb-8">
                        <div className="flex justify-between text-sm mb-2">
                          <p className="text-muted-foreground">{FREE_AUDITS_USED} of {FREE_AUDIT_LIMIT} free audits used</p>
                          <Button variant="link" onClick={() => setUserTab("subscription")} className="text-indigo-400 p-0 h-auto text-xs">
                            Upgrade for unlimited
                          </Button>
                        </div>
                        <div className="bg-zinc-800 rounded-full h-2 mb-2">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${(FREE_AUDITS_USED / FREE_AUDIT_LIMIT) * 100}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          type="url"
                          placeholder="https://yourlandingpage.com"
                          value={auditUrl}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAuditUrl(e.target.value); setUrlError(""); }}
                          className={`h-14 text-lg bg-zinc-950/50 ${urlError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        />
                        {urlError && (
                          <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                            <span>⚠</span> {urlError}
                          </p>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs text-center">Works with any public URL — Webflow, Framer, Squarespace, custom domains.</p>

                      <Button
                        onClick={handleRoastClick}
                        disabled={isLoading}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 transition-all shadow-lg"
                      >
                        {isLoading ? "Analyzing..." : "Roast This Page →"}
                      </Button>
                    </div>

                    {isLoading && (
                      <div className="mt-8 p-6 bg-zinc-950/50 rounded-xl border border-border">
                        <LoadingStepList activeStep={activeStep} completedSteps={completedSteps} />
                      </div>
                    )}

                    {showResults && (
                      <div className="mt-8 p-6 bg-zinc-950/50 rounded-xl border border-border animate-in zoom-in-95 duration-300">
                        <div className="flex gap-6 mb-6">
                          <ScoreRing score={DEMO_QUICK_SCORE} size={80} />
                          <div className="flex-1">
                            <p className="text-foreground font-semibold mb-2">Quick Issues Found</p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✕</span> CTA button below fold on mobile</li>
                              <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✕</span> No trust signals in hero</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500">View Full Report →</Button>
                          <Button variant="outline" onClick={() => { setShowResults(false); setAuditUrl(""); }} className="flex-1">Start New Audit</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* USER: History Tab */}
            {!isAdmin && userTab === "history" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-bold text-foreground mb-8">Audit History</h1>
                <AuditTable rows={MOCK_AUDIT_HISTORY} />
              </div>
            )}

            {/* USER: Subscription Tab */}
            {!isAdmin && userTab === "subscription" && (
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
                      <Button onClick={() => setShowPaymentModal(true)} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                        Upgrade Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <Card key={plan.id} className={`border-border bg-card ${user.plan === plan.id ? 'ring-2 ring-indigo-600' : ''}`}>
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-indigo-400 mt-2">{plan.price}</div>
                      </CardHeader>
                      <CardContent>
                        {user.plan === plan.id && (
                          <div className="inline-block bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[10px] uppercase font-bold tracking-wider px-3 py-1 mb-4">
                            Current Plan
                          </div>
                        )}
                        <ul className="space-y-3 text-sm text-muted-foreground">
                          {plan.features.map((f, i) => <li key={i} className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-green-500" /> {f}</li>)}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        {user.plan !== plan.id && plan.id !== "free" && (
                          <Button
                            onClick={() => { setSelectedPlan(plan.id as "pro" | "agency"); setShowPaymentModal(true); }}
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
            )}

            {/* ADMIN Tabs - simplified for this pass */}
            {isAdmin && (
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
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Payment Success Toast (Replace with Sonner in Phase 3) */}
      {showPaymentSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 z-50 animate-in slide-in-from-right-10">
          Payment successful! Plan upgraded.
        </div>
      )}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Upgrade to {selectedPlan === "pro" ? "Pro" : "Agency"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              ${selectedPlan === "pro" ? "19" : "49"} · One-time payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h4 className="text-zinc-100 font-semibold mb-4 text-sm">What&apos;s included</h4>
              <div className="space-y-3">
                {PAYMENT_INCLUDES.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircleIcon size={16} className="text-green-500" />
                    <span className="text-zinc-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Card Information</p>
              <div className="space-y-3">
                <Input
                  placeholder="Name on card"
                  value={paymentForm.name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
                <Input
                  placeholder="4242 4242 4242 4242"
                  value={paymentForm.card}
                  onChange={(e) => setPaymentForm({ ...paymentForm, card: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="MM / YY"
                    value={paymentForm.expiry}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                  <Input
                    placeholder="CVC"
                    value={paymentForm.cvc}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center text-zinc-500 text-[10px]">
              <Lock size={12} /> <span>256-bit SSL encrypted</span> <span>·</span> <span>Powered by Stripe</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 transition-all font-semibold"
              onClick={() => {
                onUpdateUser({ ...user, plan: selectedPlan });
                setShowPaymentModal(false);
                setShowPaymentSuccess(true);
                setTimeout(() => setShowPaymentSuccess(false), 3000);
                setPaymentForm({ name: "", card: "", expiry: "", cvc: "" });
              }}
            >
              Pay ${selectedPlan === "pro" ? "19" : "49"} Now →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
