"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CreditCard, CheckCircle, ChevronDown, Check } from "lucide-react";
import { CHECKOUT_FEATURES } from "@/constants";
import type { AppView, User } from "@/types";

interface CheckoutPageProps {
  user?: User | null;
  onNavigate?: (view: string) => void;
  onUpdateUser?: (user: User) => void;
  reportId?: string;
}

export function CheckoutPage({ 
  user: initialUser, 
  onNavigate: customNavigate, 
  onUpdateUser: customUpdateUser,
  reportId = "demo-report"
}: CheckoutPageProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User>(initialUser || {
    name: "Alex Kim",
    firstName: "Alex",
    lastName: "Kim",
    email: "alex@example.com",
    role: "user",
    plan: "free",
    auditsUsed: 2,
  });

  const user = currentUser;
  const onNavigate = customNavigate || ((view: string) => router.push(`/${view === "landing" ? "" : view}`));
  const onUpdateUser = (newUser: User) => {
    setCurrentUser(newUser);
    if (customUpdateUser) customUpdateUser(newUser);
  };
  const [paymentForm, setPaymentForm] = useState({ email: user?.email || "", name: user?.name || "", card: "", expiry: "", cvc: "" });
  const [billingOpen, setBillingOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit() {
    if (user) onUpdateUser({ ...user, plan: "pro" });
    setSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]" style={{ paddingTop: "64px" }}>
      {/* Top Bar */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-lg text-[var(--text-primary)] cursor-pointer" onClick={() => onNavigate("landing")}>
          🔥 PageRoast
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Lock size={14} /> Secure Checkout
        </div>
      </div>

      <div className="max-w-[80rem] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
          {/* Form */}
          <div>
            {!success ? (
              <>
                <h1 className="text-[22px] font-bold text-[var(--text-primary)] mb-8">Complete your purchase</h1>

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Contact</p>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={paymentForm.email}
                    onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none"
                  />
                </div>

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Card Information</p>
                  <div className="mb-3 relative">
                    <input
                      type="text"
                      placeholder="1234 1234 1234 1234"
                      value={paymentForm.card}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\s/g, "").slice(0, 16);
                        val = val.replace(/(\d{4})/g, "$1 ").trim();
                        setPaymentForm({ ...paymentForm, card: val });
                      }}
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 pr-10 text-[var(--text-primary)] text-sm outline-none"
                    />
                    <CreditCard size={18} className="absolute right-3 top-3 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={paymentForm.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length >= 2) val = val.slice(0, 2) + " / " + val.slice(2, 4);
                        setPaymentForm({ ...paymentForm, expiry: val });
                      }}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      value={paymentForm.cvc}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-[var(--text-primary)] text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="mb-8 border-b border-[var(--border-color)] pb-8">
                  <button
                    onClick={() => setBillingOpen(!billingOpen)}
                    className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer bg-transparent border-none"
                  >
                    <ChevronDown size={16} style={{ transform: billingOpen ? "rotate(180deg)" : "rotate(0)" }} />
                    Add billing address (optional)
                  </button>
                  {billingOpen && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3">
                      <input placeholder="Name on card" className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-[var(--text-primary)] text-sm" />
                      <select className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-[var(--text-primary)] text-sm">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Pakistan</option>
                        <option>Other</option>
                      </select>
                      <input placeholder="ZIP / Postal code" className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-[var(--text-primary)] text-sm" />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-[var(--pr-accent)] text-white py-4 text-lg font-semibold rounded-xl cursor-pointer border-none"
                >
                  Pay $19.00 →
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <CheckCircle size={56} className="text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Payment Successful!</h2>
                <p className="text-[var(--text-muted)] text-sm mb-8">Your full audit report is now unlocked.</p>
                <div className="flex gap-3">
                  <button onClick={() => { router.push(`/report/${reportId}`); }} className="bg-[var(--pr-accent)] text-white rounded-lg px-6 py-3 font-semibold text-sm cursor-pointer border-none">
                    View My Report →
                  </button>
                  <button onClick={() => { onNavigate("dashboard"); }} className="border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg px-6 py-3 font-semibold text-sm cursor-pointer bg-transparent">
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6">
              <h4 className="text-[var(--text-primary)] font-semibold mb-4">Order Summary</h4>

              <div className="pb-4 mb-4 border-b border-[var(--border-color)]">
                <p className="text-[var(--text-primary)] font-medium mb-1">The Actionable Fix</p>
                <p className="text-[var(--text-muted)] text-xs mb-2">One-time purchase · Lifetime access</p>
                <p className="text-[var(--text-primary)] font-bold text-lg">$19.00</p>
              </div>

              <div className="mb-4 pb-4 border-b border-[var(--border-color)] space-y-2">
                {CHECKOUT_FEATURES.map((f, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Check size={13} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[var(--text-primary)]">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6 pb-6 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)] text-sm">Total today</span>
                <span className="text-[var(--text-primary)] font-bold text-xl">$19.00</span>
              </div>

              <div className="space-y-2">
                {["256-bit SSL encrypted", "No subscription. Pay once.", "Refund if not satisfied"].map((text, i) => (
                  <div key={i} className="flex gap-1.5 items-center text-xs text-[var(--text-muted)]">
                    <Lock size={13} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
