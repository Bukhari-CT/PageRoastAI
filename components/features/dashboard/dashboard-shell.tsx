"use client";

import { useState } from "react";
import { LogOut, FileSearch, TrendingUp, CheckCircle, Zap, Users, DollarSign, Eye, Trash2, Ban, Download, Receipt, X, Lock, CheckCircle as CheckCircleIcon } from "lucide-react";
import { AuditTable } from "@/components/features/dashboard/audit-table";
import { ScoreRing } from "@/components/features/report/score-ring";
import { LoadingStepList } from "@/components/ui/loading-step-list";
import { useLoadingSteps } from "@/hooks/use-loading-steps";
import { getPlanBadgeClass, getStatusBadgeClass } from "@/lib/formatting";
import { isValidUrl } from "@/lib/validators";
import {
  USER_NAV_ITEMS, ADMIN_NAV_ITEMS,
  MOCK_AUDIT_HISTORY, ADMIN_USERS, ADMIN_USERS_FULL, MOCK_BILLING_HISTORY,
  SUBSCRIPTION_PLANS, ADMIN_PLAN_CONFIGS,
  PLAN_LABELS, FREE_AUDIT_LIMIT, FREE_AUDITS_USED,
  DEMO_QUICK_SCORE, LOADING_STEPS, PAYMENT_INCLUDES,
} from "@/constants";
import type { AppView, User, UserTab, AdminTab, PlanId } from "@/types";

interface DashboardShellProps {
  user: User;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export function DashboardShell({ user, onNavigate, onLogout, onUpdateUser }: DashboardShellProps) {
  const [userTab, setUserTab] = useState<UserTab>("dashboard");
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("pro");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
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
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      {/* SIDEBAR */}
      <div className="w-64 fixed left-0 top-0 bottom-0 bg-[#0D0D0D] border-r border-[var(--border-color)] overflow-y-auto flex flex-col">
        <div className="p-6">
          <p className="text-[var(--text-primary)] font-bold text-lg">🔥 PageRoast</p>
          <div className="mt-2">
            <span className={`text-xs px-2 py-0.5 rounded inline-block ${getPlanBadgeClass(user.plan)}`}>
              {PLAN_LABELS[user.plan] || user.plan}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-8">
          <p className="text-zinc-600 text-xs font-semibold tracking-widest px-3 mb-2">MENU</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => isAdmin ? setAdminTab(item.id as AdminTab) : setUserTab(item.id as UserTab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 cursor-pointer bg-transparent border-none text-left ${activeTab === item.id
                ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-l-indigo-500 pl-[10px]"
                : "text-[var(--text-muted)] hover:bg-zinc-800/50 hover:text-[var(--text-primary)]"
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-[var(--border-color)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.[0]}
            </div>
            <div>
              <p className="text-[var(--text-primary)] text-sm font-medium">{user.name}</p>
              <p className="text-zinc-500 text-xs">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="ml-auto text-zinc-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ml-64 min-h-screen bg-[var(--bg-base)] p-8 w-full">
        {/* USER: Dashboard Tab */}
        {!isAdmin && userTab === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Good morning, {user.name} 👋</h1>
            <p className="text-[var(--text-muted)] text-sm mb-8">Here&apos;s your PageRoast overview.</p>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {userStats.map((stat, i) => (
                <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
                  <stat.icon size={20} className={stat.color} />
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-mono mt-3">{stat.value}</p>
                  <p className="text-[var(--text-muted)] text-sm">{stat.label}</p>
                  <p className="text-xs text-green-400 mt-1">{stat.trend}</p>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[var(--text-primary)] font-semibold text-lg">Recent Audits</h2>
                <button onClick={() => setUserTab("history")} className="text-indigo-400 text-sm cursor-pointer hover:text-indigo-300 bg-transparent border-none">
                  View all →
                </button>
              </div>
              <AuditTable rows={MOCK_AUDIT_HISTORY} />
            </div>
          </div>
        )}

        {/* USER: Roast Tab */}
        {!isAdmin && userTab === "roast" && (
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Roast a New Page</h1>
            <p className="text-[var(--text-muted)] text-sm mb-10">Paste any public URL for an instant UX audit.</p>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-10 max-w-2xl mx-auto">
              {user.plan === "free" && (
                <div className="mb-8">
                  <p className="text-[var(--text-muted)] text-sm mb-2">{FREE_AUDITS_USED} of {FREE_AUDIT_LIMIT} free audits used this month</p>
                  <div className="bg-zinc-800 rounded-full h-2 mb-2">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(FREE_AUDITS_USED / FREE_AUDIT_LIMIT) * 100}%` }} />
                  </div>
                  <p className="text-indigo-400 text-xs cursor-pointer hover:text-indigo-300" onClick={() => setUserTab("subscription")}>
                    Upgrade for unlimited audits
                  </p>
                </div>
              )}

              <input
                type="url"
                placeholder="https://yourlandingpage.com"
                value={auditUrl}
                onChange={(e) => { setAuditUrl(e.target.value); setUrlError(""); }}
                className={`w-full bg-[var(--input-bg)] border rounded-lg px-4 py-4 text-[var(--text-primary)] placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-lg ${urlError ? "border-[var(--danger)]" : "border-[var(--input-border)]"}`}
              />
              {urlError && (
                <p className="text-[var(--danger)] text-xs mt-1 mb-3 flex items-center gap-1">
                  <span>⚠</span> {urlError}
                </p>
              )}
              <p className="text-zinc-600 text-xs mb-8 mt-4">Works with any public URL — Webflow, Framer, Squarespace, custom domains.</p>

              <button
                onClick={handleRoastClick}
                disabled={isLoading}
                className="w-full py-4 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer border-none"
              >
                {isLoading ? "Analyzing..." : "Roast This Page →"}
              </button>

              {isLoading && (
                <div className="mt-8 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl p-6">
                  <LoadingStepList activeStep={activeStep} completedSteps={completedSteps} />
                </div>
              )}

              {showResults && (
                <div className="mt-8 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl p-6">
                  <div className="flex gap-4 mb-4">
                    <ScoreRing score={DEMO_QUICK_SCORE} size={80} />
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)] font-semibold mb-3">Quick Issues Found</p>
                      <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                        <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✕</span> CTA button below fold on mobile</li>
                        <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✕</span> No trust signals in hero</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer border-none">
                      View Full Report →
                    </button>
                    <button
                      onClick={() => { setShowResults(false); setAuditUrl(""); }}
                      className="flex-1 py-2 text-sm font-semibold text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-zinc-900/50 transition-colors cursor-pointer bg-transparent"
                    >
                      Start New Audit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USER: History Tab */}
        {!isAdmin && userTab === "history" && (
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Audit History</h1>
            <AuditTable rows={MOCK_AUDIT_HISTORY} />
          </div>
        )}

        {/* USER: Subscription Tab */}
        {!isAdmin && userTab === "subscription" && (
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Subscription</h1>
            <p className="text-[var(--text-muted)] text-sm mb-8">Manage your plan and billing.</p>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 mb-8 flex justify-between items-center">
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-1">Current Plan</p>
                <p className="text-[var(--text-primary)] font-bold text-xl">{PLAN_LABELS[user.plan] || user.plan}</p>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  {user.plan === "free" ? "2 of 3 audits used · Resets Feb 1, 2025"
                    : user.plan === "pro" ? "Unlimited audits · Renews Feb 1, 2025"
                      : "Unlimited audits + API · Renews Feb 1, 2025"}
                </p>
                {user.plan === "free" && (
                  <div className="w-64 h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: "66%" }} />
                  </div>
                )}
              </div>
              {user.plan === "free" && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer border-none"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div key={plan.id} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
                  <p className="text-[var(--text-primary)] font-bold text-lg mb-1">{plan.name}</p>
                  <p className="text-indigo-400 font-bold text-2xl mb-6">{plan.price}</p>
                  {user.plan === plan.id && (
                    <div className="inline-block bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs px-3 py-1 mb-4">
                      Current Plan
                    </div>
                  )}
                  <ul className="space-y-2 text-sm text-[var(--text-muted)] mb-6">
                    {plan.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                  </ul>
                  {user.plan !== plan.id && plan.id !== "free" && (
                    <button
                      onClick={() => { setSelectedPlan(plan.id as "pro" | "agency"); setShowPaymentModal(true); }}
                      className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm cursor-pointer border-none"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-[var(--text-primary)] font-semibold text-lg mb-4">Billing History</h4>
              {user.plan === "free" ? (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-12 text-center">
                  <Receipt size={40} className="mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-500 text-sm">No payments yet</p>
                </div>
              ) : (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
                  <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-5 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                    <span>Invoice</span><span>Date</span><span>Amount</span><span>Status</span><span>Action</span>
                  </div>
                  {MOCK_BILLING_HISTORY.map((row, i) => (
                    <div key={i} className="px-4 py-3 grid grid-cols-5 gap-4 text-sm border-b border-zinc-800/50 last:border-0 items-center">
                      <span className="text-[var(--text-primary)] font-mono">{row.id}</span>
                      <span className="text-[var(--text-muted)]">{row.date}</span>
                      <span className="text-[var(--text-primary)]">{row.amount}</span>
                      <span className="text-green-400">●</span>
                      <button className="text-indigo-400 hover:text-indigo-300 cursor-pointer bg-transparent border-none"><Download size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN: Dashboard */}
        {isAdmin && adminTab === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Admin Overview</h1>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {adminStats.map((stat, i) => (
                <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[var(--text-muted)] text-sm mb-1">{stat.label}</p>
                      <p className="text-[var(--text-primary)] text-3xl font-bold">{stat.value}</p>
                      <p className={`text-xs mt-2 ${stat.trend.startsWith("+") || stat.trend.startsWith("↑") ? "text-green-400" : "text-zinc-500"}`}>{stat.trend}</p>
                    </div>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-lg mb-4">Recent Signups</h3>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
              <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-6 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                <span>User</span><span>Email</span><span>Plan</span><span>Audits</span><span>Joined</span><span>Status</span>
              </div>
              {ADMIN_USERS.map((row, i) => (
                <div key={i} className="px-4 py-3 grid grid-cols-6 gap-4 text-sm border-b border-zinc-800/50 last:border-0 items-center">
                  <span className="text-[var(--text-primary)]">{row.name}</span>
                  <span className="text-[var(--text-muted)]">{row.email}</span>
                  <span><span className={`text-xs px-2 py-0.5 rounded inline-block ${getPlanBadgeClass(row.plan)}`}>{row.plan}</span></span>
                  <span className="text-[var(--text-muted)]">{row.audits}</span>
                  <span className="text-[var(--text-muted)]">{row.joined}</span>
                  <span className={`text-xs px-2 py-0.5 rounded inline-block border ${getStatusBadgeClass(row.status)}`}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN: Users */}
        {isAdmin && adminTab === "users" && (
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">User Management</h1>
            <div className="flex gap-3 mb-6">
              <input placeholder="Search users..." className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm w-64 placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
              <select className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm w-36 outline-none focus:border-indigo-500">
                <option>All Plans</option><option>Free</option><option>Pro</option><option>Agency</option>
              </select>
              <select className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm w-36 outline-none focus:border-indigo-500">
                <option>All Status</option><option>Active</option><option>Suspended</option>
              </select>
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
              <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-7 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                <span>User</span><span>Email</span><span>Plan</span><span>Audits</span><span>Joined</span><span>Status</span><span>Actions</span>
              </div>
              {ADMIN_USERS_FULL.map((row, i) => (
                <div key={i} className="px-4 py-3 grid grid-cols-7 gap-4 text-sm border-b border-zinc-800/50 last:border-0 items-center">
                  <span className="text-[var(--text-primary)]">{row.name}</span>
                  <span className="text-[var(--text-muted)]">{row.email}</span>
                  <span><span className={`text-xs px-2 py-0.5 rounded inline-block ${getPlanBadgeClass(row.plan)}`}>{row.plan}</span></span>
                  <span className="text-[var(--text-muted)]">{row.audits}</span>
                  <span className="text-[var(--text-muted)]">{row.joined}</span>
                  <span><span className={`text-xs px-2 py-0.5 rounded inline-block border ${getStatusBadgeClass(row.status)}`}>{row.status}</span></span>
                  <div className="flex gap-2">
                    <button className="text-zinc-400 hover:text-indigo-400 cursor-pointer bg-transparent border-none"><Eye size={16} /></button>
                    <button className="text-zinc-400 hover:text-yellow-400 cursor-pointer bg-transparent border-none"><Ban size={16} /></button>
                    <button className="text-zinc-400 hover:text-red-400 cursor-pointer bg-transparent border-none"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN: Plans */}
        {isAdmin && adminTab === "plans" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Subscription Plans</h1>
                <p className="text-[var(--text-muted)] text-sm">Edit and manage your pricing tiers.</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer border-none">+ New Plan</button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {ADMIN_PLAN_CONFIGS.map((plan) => (
                <div key={plan.id} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
                  {editingPlan === plan.id ? (
                    <div className="space-y-4">
                      <input placeholder="Plan name" defaultValue={plan.name} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm outline-none focus:border-indigo-500" />
                      <input type="number" placeholder="Price" defaultValue={plan.price.replace("$", "")} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm outline-none focus:border-indigo-500" />
                      <textarea placeholder="Features (one per line)" defaultValue={plan.features.join("\n")} rows={5} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm font-mono outline-none focus:border-indigo-500 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setEditingPlan(null)} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 cursor-pointer border-none">Save Changes</button>
                        <button onClick={() => setEditingPlan(null)} className="flex-1 border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg py-2 text-sm hover:bg-zinc-800/50 cursor-pointer bg-transparent">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-[var(--text-primary)] font-bold text-lg mb-1">{plan.name}</h3>
                      <p className="text-indigo-400 font-bold text-2xl mb-2">{plan.price}</p>
                      <p className="text-zinc-500 text-xs mb-4">{plan.subscribers}</p>
                      <ul className="space-y-2 text-sm text-[var(--text-muted)] mb-6">
                        {plan.features.map((f, i) => <li key={i}>✓ {f}</li>)}
                      </ul>
                      <button onClick={() => setEditingPlan(plan.id)} className="w-full border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg px-4 py-2 text-sm hover:bg-zinc-800/50 cursor-pointer bg-transparent">Edit Plan</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl w-full max-w-md">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start border-b border-[var(--border-color)]">
              <div>
                <h3 className="text-[var(--text-primary)] font-bold text-xl">Upgrade to {selectedPlan === "pro" ? "Pro" : "Agency"}</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">${selectedPlan === "pro" ? "19" : "49"} · One-time payment</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer bg-transparent border-none">
                <X size={24} />
              </button>
            </div>
            <div className="px-8 py-6 space-y-6">
              <div>
                <h4 className="text-[var(--text-primary)] font-semibold mb-4">What&apos;s included</h4>
                <div className="space-y-3">
                  {PAYMENT_INCLUDES.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="text-[var(--text-muted)] text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[var(--text-muted)] text-xs uppercase tracking-wide mb-3">Card Information</p>
                <div className="space-y-3">
                  <input placeholder="Name on card" value={paymentForm.name} onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
                  <input placeholder="4242 4242 4242 4242" value={paymentForm.card} onChange={(e) => setPaymentForm({ ...paymentForm, card: e.target.value })} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="MM / YY" value={paymentForm.expiry} onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
                    <input placeholder="CVC" value={paymentForm.cvc} onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value })} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-2.5 text-[var(--text-primary)] placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center text-zinc-500 text-xs">
                <Lock size={14} /> <span>256-bit SSL encrypted</span> <span>·</span> <span>Powered by Stripe</span>
              </div>
              <button
                onClick={() => {
                  onUpdateUser({ ...user, plan: selectedPlan });
                  setShowPaymentModal(false);
                  setShowPaymentSuccess(true);
                  setTimeout(() => setShowPaymentSuccess(false), 3000);
                  setPaymentForm({ name: "", card: "", expiry: "", cvc: "" });
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer border-none"
              >
                Pay ${selectedPlan === "pro" ? "19" : "49"} Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Toast */}
      {showPaymentSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 z-50">
          Payment successful! Plan upgraded.
        </div>
      )}
    </div>
  );
}
