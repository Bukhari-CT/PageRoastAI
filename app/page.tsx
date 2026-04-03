"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import {
  Copy, Check, Lock, Link, ScanSearch, Code2, ChevronDown, CheckCircle, X,
  LayoutDashboard, Flame, Clock, CreditCard, FileSearch, TrendingUp, Zap,
  LogOut, Eye, Trash2, Download, Receipt, Users, Package, Settings, DollarSign,
  Ban, Sun, Moon,
} from "lucide-react";

const LOADING_STEPS = [
  "Rendering DOM...",
  "Analyzing visual hierarchy...",
  "Scanning CTA placement...",
  "Judging your font choices...",
  "Calculating revenue loss...",
];

const CODE_SNIPPET = `<section className="flex flex-col items-start gap-4 px-6 py-12">
  <h1 className="text-5xl font-bold leading-tight">Your Value Prop</h1>
  <p className="text-lg text-zinc-400 max-w-xl">One clear benefit.</p>
  <button className="bg-indigo-600 text-white px-8 py-3 
    font-semibold rounded-lg">
    Start Free Trial →
  </button>
</section>`;

const roastLines = [
  {
    headline: "Your CTA is playing hide and seek.",
    detail: "It's below 840px on mobile. Your visitors scroll, get bored, and leave. The button might as well not exist."
  },
  {
    headline: "You have the font hierarchy of a ransom note.",
    detail: "3 competing sizes in the first viewport. Users don't know if they should read the headline, the subtext, or cry."
  },
  {
    headline: "Zero social proof. Lots of trust required.",
    detail: "You're asking strangers to give you money with no testimonials above the fold. That's bold. Not in a good way."
  }
];

const strengths = [
  {
    headline: "Clean visual weight on the logo.",
    detail: "Your logo doesn't fight the headline for attention. That's rarer than you think and immediately signals maturity."
  },
  {
    headline: "Page load under 2 seconds.",
    detail: "You're in the top 20% of landing pages we've audited. Fast pages convert better — you've already won this one."
  },
  {
    headline: "Mobile viewport is set correctly.",
    detail: "The meta viewport tag is present and correct. Many founders forget this. Your page doesn't fall apart on iPhone."
  }
];

type AppView = "landing" | "login" | "signup" | "results" | "user-dashboard" | "view-report" | "checkout";
type UserTab = "dashboard" | "roast" | "history" | "subscription";
type UserRole = "user" | "admin";

interface User {
  name: string;
  email: string;
  role: UserRole;
  plan: "free" | "pro" | "agency";
  auditsUsed?: number;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("PageRoast error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", fontFamily: "system-ui" }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 40, maxWidth: 480, width: "100%" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>
              ⚠️
            </div>
            <h2 style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageRoastAI(): JSX.Element {
  //  THEME & VALIDATION 
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [urlError, setUrlError] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);

  //  APP STATE 
  const [appView, setAppView] = useState<AppView>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTab, setUserTab] = useState<UserTab>("dashboard");

  //  FORM STATES 
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ name: "", email: "", password: "" });
  const [auditUrl, setAuditUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showModal, setShowModal] = useState(false);

  //  LANDING PAGE STATES 
  const [landingView, setLandingView] = useState<"hero" | "loading" | "results">("hero");
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [formState, setFormState] = useState({ name: "", email: "", message: "", submitted: false });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("pro");
  const [paymentForm, setPaymentForm] = useState({ name: "", card: "", expiry: "", cvc: "" });
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<"dashboard" | "users" | "plans">("dashboard");
  const [activeReport, setActiveReport] = useState<{ url: string; date: string; score: number; issues: number } | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  //  LANDING PAGE: Loading sequence 
  useEffect(() => {
    if (landingView !== "loading") return;
    setActiveStep(0);
    setCompletedSteps([]);
    let current = 0;
    stepIntervalRef.current = setInterval(() => {
      setCompletedSteps((prev) => [...prev, current]);
      current += 1;
      if (current < LOADING_STEPS.length) {
        setActiveStep(current);
      } else {
        clearInterval(stepIntervalRef.current!);
      }
    }, 700);

    const timer = setTimeout(() => {
      setLandingView("results");
    }, 700 * LOADING_STEPS.length + 400);

    return () => {
      clearInterval(stepIntervalRef.current!);
      clearTimeout(timer);
    };
  }, [landingView]);

  //  VALIDATION HELPERS 
  const isValidUrl = (val: string) => {
    try {
      const u = new URL(val.startsWith("http") ? val : "https://" + val);
      return u.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const validateLoginForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!loginForm.email) newErrors.email = "Email is required";
    else if (!isValidEmail(loginForm.email)) newErrors.email = "Invalid email format";
    if (!loginForm.password) newErrors.password = "Password is required";
    else if (loginForm.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const validateSignupForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!signupForm.name) newErrors.name = "Name is required";
    else if (signupForm.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!signupForm.email) newErrors.email = "Email is required";
    else if (!isValidEmail(signupForm.email)) newErrors.email = "Invalid email format";
    if (!signupForm.password) newErrors.password = "Password is required";
    else if (signupForm.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    return newErrors;
  };

  const validateWaitlistForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.name) newErrors.name = "Name is required";
    if (!formState.email) newErrors.email = "Email is required";
    else if (!isValidEmail(formState.email)) newErrors.email = "Invalid email format";
    return newErrors;
  };

  const validatePaymentForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!paymentForm.name) newErrors.name = "Cardholder name is required";
    const cardClean = paymentForm.card.replace(/\s/g, "");
    if (!cardClean) newErrors.card = "Card number is required";
    else if (!/^\d{16}$/.test(cardClean)) newErrors.card = "Card must be 16 digits";
    if (!paymentForm.expiry) newErrors.expiry = "Expiry date is required";
    else if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiry)) newErrors.expiry = "Format: MM/YY";
    if (!paymentForm.cvc) newErrors.cvc = "CVC is required";
    else if (!/^\d{3,4}$/.test(paymentForm.cvc)) newErrors.cvc = "CVC must be 3-4 digits";
    return newErrors;
  };

  //  HANDLERS 
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateLoginForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setCurrentUser({ name: "User", email: loginForm.email, role: "user", plan: "free", auditsUsed: 0 });
    setAppView("user-dashboard");
    setLoginForm({ email: "", password: "" });
    setErrors({});
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateSignupForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setCurrentUser({ name: signupForm.name, email: signupForm.email, role: "user", plan: "free", auditsUsed: 0 });
    setAppView("user-dashboard");
    setSignupForm({ name: "", email: "", password: "" });
    setErrors({});
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateWaitlistForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setFormState({ ...formState, submitted: true });
    setTimeout(() => setFormState({ name: "", email: "", message: "", submitted: false }), 3000);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validatePaymentForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (currentUser) {
      setCurrentUser({ ...currentUser, plan: selectedPlan });
    }
    setShowPaymentModal(false);
    setShowPaymentSuccess(true);
    setTimeout(() => setShowPaymentSuccess(false), 3000);
    setPaymentForm({ name: "", card: "", expiry: "", cvc: "" });
    setErrors({});
  };

  function handleRoastClick() {
    if (!auditUrl.trim()) return;
    if (!isValidUrl(auditUrl)) {
      setUrlError("Please enter a valid URL, e.g. https://yoursite.com");
      return;
    }
    setUrlError("");
    if (currentUser) {
      setUserTab("roast");
      setAppView("user-dashboard");
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
      }, 3000);
    }
  }

  function handleLandingRoast() {
    if (currentUser) {
      setUserTab("roast");
      setAppView("user-dashboard");
    } else {
      setLandingView("loading");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCurrentUser({
      name: "Alex Kim",
      email: loginForm.email || "alex@example.com",
      role: "user",
      plan: "free",
      auditsUsed: 2,
    });
    setAppView("user-dashboard");
    setLoginForm({ email: "", password: "" });
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setCurrentUser({
      name: signupForm.name || "Alex Kim",
      email: signupForm.email || "alex@example.com",
      role: "user",
      plan: "free",
      auditsUsed: 0,
    });
    setAppView("user-dashboard");
    setSignupForm({ name: "", email: "", password: "" });
  }

  function setDemoUser(role: "user" | "admin" | "guest") {
    if (role === "guest") {
      setCurrentUser(null);
      setAppView("landing");
    } else if (role === "admin") {
      setCurrentUser({
        name: "Admin",
        email: "admin@pageroast.com",
        role: "admin",
        plan: "agency",
      });
      setAppView("user-dashboard");
    } else {
      setCurrentUser({
        name: "Alex Kim",
        email: "alex@example.com",
        role: "user",
        plan: "free",
        auditsUsed: 2,
      });
      setAppView("user-dashboard");
    }
  }

  //  RENDER: LOGIN PAGE 
  if (appView === "login") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        <button
          onClick={() => setAppView("landing")}
          className="absolute top-8 left-8 text-white font-bold text-xl hover:opacity-80 transition-opacity"
        >
          🔥 PageRoast
        </button>

        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-white font-bold text-2xl mb-1">Welcome back</h2>
          <p className="text-zinc-400 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 text-sm block">Password</label>
                <a href="#" className="text-indigo-400 text-xs hover:text-indigo-300">Forgot password?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Sign In →
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#111111] text-zinc-600">or continue with</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <button className="w-full border border-zinc-700 rounded-lg py-2.5 text-zinc-300 text-sm hover:bg-zinc-900/50 transition-colors">
              Continue with Google
            </button>
            <button className="w-full border border-zinc-700 rounded-lg py-2.5 text-zinc-300 text-sm hover:bg-zinc-900/50 transition-colors">
              Continue with GitHub
            </button>
          </div>

          <p className="text-zinc-500 text-sm text-center">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => setAppView("signup")}
              className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Sign up free
            </button>
          </p>
        </div>

        {/* Demo shortcuts */}
        <div className="mt-8 flex gap-2 justify-center text-xs">
          <span className="text-zinc-500">Demo logins:</span>
          <button
            onClick={() => setDemoUser("user")}
            className="border border-zinc-700 rounded px-2 py-1 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            User
          </button>
          <button
            onClick={() => setDemoUser("admin")}
            className="border border-zinc-700 rounded px-2 py-1 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            Admin
          </button>
          <button
            onClick={() => setDemoUser("guest")}
            className="border border-zinc-700 rounded px-2 py-1 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
          >
            Guest
          </button>
        </div>
      </div>
    );
  }

  //  RENDER: SIGNUP PAGE 
  if (appView === "signup") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
        <button
          onClick={() => setAppView("landing")}
          className="absolute top-8 left-8 text-white font-bold text-xl hover:opacity-80 transition-opacity"
        >
          🔥 PageRoast
        </button>

        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-white font-bold text-2xl mb-1">Create your account</h2>
          <p className="text-zinc-400 text-sm mb-8">Start roasting pages in 60 seconds</p>

          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Full Name</label>
              <input
                type="text"
                placeholder="Alex Kim"
                value={signupForm.name}
                onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <p className="text-zinc-500 text-xs">
              By signing up you agree to our{" "}
              <a href="#" className="text-indigo-400 hover:text-indigo-300">
                Terms
              </a>
              {" "} and{" "}
              <a href="#" className="text-indigo-400 hover:text-indigo-300">
                Privacy Policy
              </a>
            </p>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create Free Account →
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#111111] text-zinc-600">or continue with</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <button className="w-full border border-zinc-700 rounded-lg py-2.5 text-zinc-300 text-sm hover:bg-zinc-900/50 transition-colors">
              Continue with Google
            </button>
            <button className="w-full border border-zinc-700 rounded-lg py-2.5 text-zinc-300 text-sm hover:bg-zinc-900/50 transition-colors">
              Continue with GitHub
            </button>
          </div>

          <p className="text-zinc-500 text-sm text-center">
            Already have an account?{" "}
            <button
              onClick={() => setAppView("login")}
              className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  //  RENDER: GUEST RESULTS PAGE 
  if (appView === "results") {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setAppView("landing")}
            className="text-white font-bold text-lg hover:opacity-80 transition-opacity"
          >
            🔥 PageRoast
          </button>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm">Create free account to save this report</span>
            <button
              onClick={() => setAppView("signup")}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Sign Up Free →
            </button>
          </div>
        </div>

        <div className="px-6 py-16 max-w-5xl mx-auto">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Audit Report</h1>
            <p className="text-zinc-400 text-sm mb-4">example.com · Analyzed just now</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
              <span className="text-red-400 text-sm font-mono font-semibold">Score: 42/100</span>
            </div>
          </div>

          {/* Results grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Score ring */}
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 flex flex-col items-center gap-4">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#222222" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="8"
                  strokeDasharray="314"
                  strokeDashoffset="181"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "32px", fontWeight: "bold", fill: "#F5F5F5", fontFamily: "monospace" }}>
                  42
                </text>
              </svg>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#71717A" }}>/100</p>
                <p style={{ fontSize: "14px", color: "#71717A" }} className="mt-2">
                  Conversion Score
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 underline text-sm mt-4 transition-colors"
                >
                  View Full Report →
                </button>
              </div>
            </div>

            {/* Roast Section */}
            <div className="col-span-2">
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
                Honestly? We've seen worse. But not much.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                {roastLines.map((roast, i) => (
                  <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "3px solid var(--danger)", borderRadius: "8px", padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ color: "var(--danger)", fontSize: "14px", marginTop: "2px", flexShrink: 0 }}>✕</span>
                      <p style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>{roast.headline}</p>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginTop: "4px", marginLeft: "22px" }}>
                      {roast.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rewritten Copy + Code */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">AI-Rewritten Hero Copy</h3>
              <textarea
                readOnly
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-300 font-mono resize-none outline-none"
                rows={5}
                defaultValue={`Turn visitors into customers in 14 days — or your money back.
No fluff. No vague promises. Just the exact fixes your page needs.`}
              />
            </div>

            <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold text-sm">Suggested Fix</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} style={{ color: "#6366F1" }} />
                      <span className="text-xs font-mono">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="text-xs font-mono">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed" style={{ backgroundColor: "#0F0F0F" }}>
                <code>{CODE_SNIPPET}</code>
              </pre>
            </div>
          </div>

          {/* Paywall teaser */}
          <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden relative min-h-64 mb-8">
            <div className="p-8 blur-sm pointer-events-none select-none" aria-hidden="true">
              <h3 className="text-white font-semibold text-sm mb-4">Advanced SEO Insights</h3>
              <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-12 bg-zinc-700 rounded" />
                  Core Web Vitals score
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-zinc-700 rounded" />
                  Missing meta descriptions
                </li>
              </ul>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl gap-3">
              <Lock size={32} style={{ color: "#6366F1" }} />
              <div className="text-center">
                <p className="text-white font-semibold text-lg">Advanced SEO Insights</p>
              </div>
              <button
                onClick={() => setAppView("signup")}
                className="mt-4 px-6 py-2 font-semibold text-white text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Unlock Full Report →
              </button>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-white font-bold text-2xl mb-2">Save this report and fix 5x more issues</h2>
            <p className="text-zinc-400 mb-6">Free account includes full audit history and copy-paste code fixes.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setAppView("signup")}
                className="px-6 py-3 font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Sign Up Free →
              </button>
              <button
                onClick={() => setAppView("landing")}
                className="px-6 py-3 font-semibold text-white border border-zinc-700 rounded-lg hover:bg-zinc-900/50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //  RENDER: USER DASHBOARD 
  if (appView === "user-dashboard") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex">
        {/* SIDEBAR */}
        <div className="w-64 fixed left-0 top-0 bottom-0 bg-[#0D0D0D] border-r border-zinc-800 overflow-y-auto flex flex-col">
          <div className="p-6">
            <p className="text-white font-bold text-lg">🔥 PageRoast</p>
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded inline-block ${
                  currentUser?.plan === "free"
                    ? "bg-zinc-800 text-zinc-400"
                    : currentUser?.plan === "agency"
                    ? "bg-violet-600/20 text-violet-400"
                    : "bg-indigo-600/20 text-indigo-400"
                }`}
              >
                {currentUser?.plan === "free" ? "Free Plan" : currentUser?.plan === "agency" ? "Agency" : "Pro"}
              </span>
            </div>
          </div>

          <nav className="flex-1 px-3 mt-8">
            <p className="text-zinc-600 text-xs font-semibold tracking-widest px-3 mb-2">MENU</p>
            {currentUser?.role === "admin" ? (
              // Admin tabs
              [
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "users", label: "Users", icon: Users },
                { id: "plans", label: "Plans", icon: Package },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id as typeof adminTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                    adminTab === item.id
                      ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 pl-[10px]"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))
            ) : (
              // User tabs
              [
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "roast", label: "Roast My Page", icon: Flame },
                { id: "history", label: "History", icon: Clock },
                { id: "subscription", label: "Subscription", icon: CreditCard },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setUserTab(item.id as UserTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                    userTab === item.id
                      ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 pl-[10px]"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))
            )}
          </nav>

          {/* User footer */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {currentUser?.name?.[0]}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{currentUser?.name}</p>
                <p className="text-zinc-500 text-xs">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setAppView("landing");
                }}
                className="ml-auto text-zinc-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="ml-64 min-h-screen bg-[#0A0A0A] p-8 w-full">
          {/*  TAB: DASHBOARD  */}
          {userTab === "dashboard" && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Good morning, {currentUser?.name} 👋</h1>
              <p className="text-zinc-400 text-sm mb-8">Here's your PageRoast overview.</p>

              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { icon: FileSearch, label: "Total Audits", value: "12", trend: "+3 this week", color: "text-indigo-400" },
                  { icon: TrendingUp, label: "Avg. Score", value: "58", trend: "↑ 12 pts from last month", color: "text-yellow-400" },
                  { icon: CheckCircle, label: "Issues Fixed", value: "34", trend: "across all audits", color: "text-green-400" },
                  { icon: Zap, label: "Audits Used", value: "2/3", trend: "1 remaining this month", color: "text-indigo-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111111] border border-zinc-800 rounded-xl p-5">
                    <stat.icon size={20} className={stat.color} />
                    <p className="text-3xl font-bold text-white font-mono mt-3">{stat.value}</p>
                    <p className="text-zinc-400 text-sm">{stat.label}</p>
                    <p className="text-xs text-green-400 mt-1">{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Recent audits table */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white font-semibold text-lg">Recent Audits</h2>
                  <button
                    onClick={() => setUserTab("history")}
                    className="text-indigo-400 text-sm cursor-pointer hover:text-indigo-300"
                  >
                    View all →
                  </button>
                </div>
                <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-6 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                    <span>URL</span>
                    <span>Score</span>
                    <span>Issues</span>
                    <span>Status</span>
                    <span>Date</span>
                    <span>Action</span>
                  </div>
                  {[
                    { url: "getshipfast.co", score: 71, issues: "2", date: "Jan 28 2025" },
                    { url: "launchfast.com", score: 43, issues: "5", date: "Jan 25 2025" },
                    { url: "shipnow.io", score: 58, issues: "3", date: "Jan 22 2025" },
                    { url: "buildfaster.dev", score: 29, issues: "7", date: "Jan 19 2025" },
                    { url: "nextjsstarter.com", score: 82, issues: "1", date: "Jan 15 2025" },
                  ].map((row, i) => (
                    <div key={i} className="px-4 py-3 grid grid-cols-6 gap-4 text-sm border-b border-zinc-800/50 last:border-0">
                      <span className="text-white">{row.url}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono font-semibold w-fit ${
                          row.score >= 70
                            ? "bg-green-500/20 text-green-400"
                            : row.score >= 50
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {row.score}
                      </span>
                      <span className="text-zinc-400">{row.issues} issues</span>
                      <span className="text-zinc-400">Completed</span>
                      <span className="text-zinc-400 text-xs">{row.date}</span>
                      <button className="text-indigo-400 text-xs hover:underline cursor-pointer">View Report</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/*  TAB: ROAST MY PAGE  */}
          {userTab === "roast" && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Roast a New Page</h1>
              <p className="text-zinc-400 text-sm mb-10">Paste any public URL for an instant UX audit.</p>

              <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-10 max-w-2xl mx-auto">
                {currentUser?.plan === "free" && (
                  <div className="mb-8">
                    <p className="text-zinc-400 text-sm mb-2">2 of 3 free audits used this month</p>
                    <div className="bg-zinc-800 rounded-full h-2 mb-2">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: "66%" }}></div>
                    </div>
                    <p
                      className="text-indigo-400 text-xs cursor-pointer hover:text-indigo-300"
                      onClick={() => setUserTab("subscription")}
                    >
                      Upgrade for unlimited audits
                    </p>
                  </div>
                )}

                <input
                  type="url"
                  placeholder="https://yourlandingpage.com"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors mb-4 text-lg"
                />
                <p className="text-zinc-600 text-xs mb-8">
                  Works with any public URL — Webflow, Framer, Squarespace, custom domains.
                </p>

                <button
                  onClick={handleRoastClick}
                  disabled={isLoading}
                  className="w-full py-4 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? "Analyzing..." : "Roast This Page →"}
                </button>

                {isLoading && (
                  <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <ul className="space-y-4">
                      {LOADING_STEPS.map((step, i) => {
                        const isDone = completedSteps.includes(i);
                        const isActive = activeStep === i && !isDone;
                        return (
                          <li key={i} className="flex items-center gap-3">
                            <span style={{ color: isDone ? "#6366F1" : isActive ? "#6366F1" : "#71717A" }} className="text-sm font-bold">
                              {isDone ? "✓" : isActive ? "◆" : "◇"}
                            </span>
                            <span
                              style={{
                                color: isDone ? "#71717A" : isActive ? "#F5F5F5" : "#71717A",
                                textDecoration: isDone ? "line-through" : "none",
                              }}
                              className="text-sm"
                            >
                              {step}
                              {isActive && <span className="animate-pulse ml-1">...</span>}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {showResults && (
                  <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex gap-4 mb-4">
                      <svg width="80" height="80" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#222222" strokeWidth="8" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#6366F1" strokeWidth="8" strokeDasharray="314" strokeDashoffset="181" strokeLinecap="round" transform="rotate(-90 60 60)" />
                        <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "24px", fontWeight: "bold", fill: "#F5F5F5", fontFamily: "monospace" }}>
                          67
                        </text>
                      </svg>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-3">Quick Issues Found</p>
                        <ul className="space-y-2 text-sm text-zinc-300">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            CTA button below fold on mobile
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            No trust signals in hero
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowModal(true)}
                        className="flex-1 py-2 text-sm font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
                      >
                        View Full Report →
                      </button>
                      <button
                        onClick={() => {
                          setShowResults(false);
                          setAuditUrl("");
                          setIsLoading(false);
                        }}
                        className="flex-1 py-2 text-sm font-semibold text-white border border-zinc-700 rounded-lg hover:bg-zinc-900/50 transition-colors"
                      >
                        Start New Audit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/*  TAB: HISTORY  */}
          {userTab === "history" && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Audit History</h1>
              <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-6 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                  <span>URL</span>
                  <span>Score</span>
                  <span>Issues</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span>Action</span>
                </div>
                {[
                  { url: "getshipfast.co", score: 71, issues: "2", date: "Jan 28 2025" },
                  { url: "launchfast.com", score: 43, issues: "5", date: "Jan 25 2025" },
                  { url: "shipnow.io", score: 58, issues: "3", date: "Jan 22 2025" },
                  { url: "buildfaster.dev", score: 29, issues: "7", date: "Jan 19 2025" },
                  { url: "nextjsstarter.com", score: 82, issues: "1", date: "Jan 15 2025" },
                ].map((row, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-6 gap-4 text-sm border-b border-zinc-800/50 last:border-0">
                    <span className="text-white">{row.url}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono font-semibold w-fit ${
                        row.score >= 70
                          ? "bg-green-500/20 text-green-400"
                          : row.score >= 50
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {row.score}
                    </span>
                    <span className="text-zinc-400">{row.issues} issues</span>
                    <span className="text-zinc-400">Completed</span>
                    <span className="text-zinc-400 text-xs">{row.date}</span>
                    <button className="text-indigo-400 text-xs hover:underline cursor-pointer">View Report</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*  TAB: SUBSCRIPTION  */}
          {userTab === "subscription" && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Subscription</h1>
              <p className="text-zinc-400 text-sm mb-8">Manage your plan and billing.</p>

              {/* Current Plan Card */}
              <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 mb-8 flex justify-between items-center">
                <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Current Plan</p>
                  <p className="text-white font-bold text-xl">
                    {currentUser?.plan === "free" ? "Free Plan" : currentUser?.plan === "pro" ? "Pro" : "Agency"}
                  </p>
                  <p className="text-zinc-400 text-sm mt-1">
                    {currentUser?.plan === "free"
                      ? "2 of 3 audits used · Resets Feb 1, 2025"
                      : currentUser?.plan === "pro"
                      ? "Unlimited audits · Renews Feb 1, 2025"
                      : "Unlimited audits + API · Renews Feb 1, 2025"}
                  </p>
                  {currentUser?.plan === "free" && (
                    <div className="w-64 h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: "66%" }} />
                    </div>
                  )}
                </div>
                {currentUser?.plan === "free" && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>

              {/* Plan Comparison Grid */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { name: "Free", price: "$0", features: ["3 audits/month", "Basic reports", "Email support"], id: "free" },
                  { name: "Pro", price: "$19", features: ["Unlimited audits", "Full UX/UI audit", "Rewritten copy", "Copy-paste fixes"], id: "pro" },
                  { name: "Agency", price: "$49", features: ["Everything in Pro", "Unlimited team seats", "White-label reports", "API access"], id: "agency" },
                ].map((plan) => (
                  <div key={plan.id} className="bg-[#111111] border border-zinc-800 rounded-xl p-6">
                    <p className="text-white font-bold text-lg mb-1">{plan.name}</p>
                    <p className="text-indigo-400 font-bold text-2xl mb-6">{plan.price}</p>
                    {currentUser?.plan === plan.id && (
                      <div className="inline-block bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs px-3 py-1 mb-4">
                        Current Plan
                      </div>
                    )}
                    <ul className="space-y-2 text-sm text-zinc-300 mb-6">
                      {plan.features.map((f, i) => (
                        <li key={i}>✓ {f}</li>
                      ))}
                    </ul>
                    {currentUser?.plan !== plan.id && plan.id !== "free" && (
                      <button
                        onClick={() => {
                          setSelectedPlan(plan.id as "pro" | "agency");
                          setShowPaymentModal(true);
                        }}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Billing History */}
              <div>
                <h4 className="text-white font-semibold text-lg mb-4">Billing History</h4>
                {currentUser?.plan === "free" ? (
                  <div className="bg-[#111111] border border-zinc-800 rounded-xl p-12 text-center">
                    <Receipt size={40} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500 text-sm">No payments yet</p>
                  </div>
                ) : (
                  <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-5 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                      <span>Invoice</span>
                      <span>Date</span>
                      <span>Amount</span>
                      <span>Status</span>
                      <span>Action</span>
                    </div>
                    {[
                      { id: "PRO-2025-001", date: "Jan 1 2025", amount: "$19.00", status: "Paid" },
                      { id: "PRO-2024-012", date: "Dec 1 2024", amount: "$19.00", status: "Paid" },
                      { id: "PRO-2024-011", date: "Nov 1 2024", amount: "$19.00", status: "Paid" },
                    ].map((row, i) => (
                      <div key={i} className="px-4 py-3 grid grid-cols-5 gap-4 text-sm border-b border-zinc-800/50 last:border-0 items-center">
                        <span className="text-white font-mono">{row.id}</span>
                        <span className="text-zinc-400">{row.date}</span>
                        <span className="text-white">{row.amount}</span>
                        <span className="text-green-400">●</span>
                        <button className="text-indigo-400 hover:text-indigo-300">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentUser?.role === "admin" && adminTab === "dashboard" && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Admin Overview</h1>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Users, label: "Total Users", value: "1,284", trend: "+48 this week", color: "text-indigo-400" },
                  { icon: FileSearch, label: "Audits Run", value: "9,420", trend: "+312 today", color: "text-violet-400" },
                  { icon: DollarSign, label: "MRR", value: "$4,180", trend: "+$340 this month", color: "text-green-400" },
                  { icon: TrendingUp, label: "Avg Score", value: "54", trend: "across all audits", color: "text-yellow-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111111] border border-zinc-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-white text-3xl font-bold">{stat.value}</p>
                        <p className={`text-xs mt-2 ${stat.trend.startsWith("+") || stat.trend.startsWith("↑") ? "text-green-400" : "text-zinc-500"}`}>
                          {stat.trend}
                        </p>
                      </div>
                      <stat.icon size={24} className={stat.color} />
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="text-white font-semibold text-lg mb-4">Recent Signups</h3>
              <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-6 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                  <span>User</span>
                  <span>Email</span>
                  <span>Plan</span>
                  <span>Audits</span>
                  <span>Joined</span>
                  <span>Status</span>
                </div>
                {[
                  { name: "Alex Kim", email: "alex@example.com", plan: "Free", audits: "2", joined: "Jan 28", status: "Active" },
                  { name: "Priya K.", email: "priya@flowbase.io", plan: "Pro", audits: "8", joined: "Jan 27", status: "Active" },
                  { name: "Dan R.", email: "dan@shipfast.io", plan: "Agency", audits: "31", joined: "Jan 26", status: "Active" },
                  { name: "Marcus T.", email: "marcus@launch.co", plan: "Free", audits: "1", joined: "Jan 25", status: "Active" },
                  { name: "Sara W.", email: "sara@webflow.io", plan: "Pro", audits: "5", joined: "Jan 24", status: "Suspended" },
                  { name: "James L.", email: "james@framer.com", plan: "Free", audits: "0", joined: "Jan 23", status: "Active" },
                ].map((row, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-6 gap-4 text-sm border-b border-zinc-800/50 last:border-0 items-center">
                    <span className="text-white">{row.name}</span>
                    <span className="text-zinc-400">{row.email}</span>
                    <span>
                      <span className={`text-xs px-2 py-0.5 rounded inline-block ${
                        row.plan === "Free" ? "bg-zinc-800 text-zinc-400" :
                        row.plan === "Agency" ? "bg-violet-600/20 text-violet-400" :
                        "bg-indigo-600/20 text-indigo-400"
                      }`}>
                        {row.plan}
                      </span>
                    </span>
                    <span className="text-zinc-400">{row.audits}</span>
                    <span className="text-zinc-400">{row.joined}</span>
                    <span className={`text-xs px-2 py-0.5 rounded inline-block ${
                      row.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    } border ${row.status === "Active" ? "border-green-500/20" : "border-red-500/20"}`}>
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentUser?.role === "admin" && adminTab === "users" && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
              <div className="flex gap-3 mb-6">
                <input placeholder="Search users..." className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm w-64 placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
                <select className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm w-36 outline-none focus:border-indigo-500">
                  <option>All Plans</option>
                  <option>Free</option>
                  <option>Pro</option>
                  <option>Agency</option>
                </select>
                <select className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm w-36 outline-none focus:border-indigo-500">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
                <div className="bg-zinc-900/50 px-4 py-3 grid grid-cols-7 gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50">
                  <span>User</span>
                  <span>Email</span>
                  <span>Plan</span>
                  <span>Audits</span>
                  <span>Joined</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {[
                  { name: "Alex Kim", email: "alex@example.com", plan: "Free", audits: "2", joined: "Jan 28", status: "Active" },
                  { name: "Priya K.", email: "priya@flowbase.io", plan: "Pro", audits: "8", joined: "Jan 27", status: "Active" },
                  { name: "Dan R.", email: "dan@shipfast.io", plan: "Agency", audits: "31", joined: "Jan 26", status: "Active" },
                  { name: "Marcus T.", email: "marcus@launch.co", plan: "Free", audits: "1", joined: "Jan 25", status: "Active" },
                  { name: "Sara W.", email: "sara@webflow.io", plan: "Pro", audits: "5", joined: "Jan 24", status: "Suspended" },
                  { name: "James L.", email: "james@framer.com", plan: "Free", audits: "0", joined: "Jan 23", status: "Active" },
                  { name: "Nina Z.", email: "nina@startup.io", plan: "Free", audits: "3", joined: "Jan 22", status: "Active" },
                  { name: "Omar K.", email: "omar@growth.co", plan: "Pro", audits: "12", joined: "Jan 21", status: "Active" },
                  { name: "Eve L.", email: "eve@design.io", plan: "Agency", audits: "45", joined: "Jan 20", status: "Active" },
                  { name: "Louis C.", email: "louis@web.co", plan: "Free", audits: "1", joined: "Jan 19", status: "Suspended" },
                ].map((row, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-7 gap-4 text-sm border-b border-zinc-800/50 last:border-0 items-center">
                    <span className="text-white">{row.name}</span>
                    <span className="text-zinc-400">{row.email}</span>
                    <span><span className={`text-xs px-2 py-0.5 rounded inline-block ${
                      row.plan === "Free" ? "bg-zinc-800 text-zinc-400" :
                      row.plan === "Agency" ? "bg-violet-600/20 text-violet-400" :
                      "bg-indigo-600/20 text-indigo-400"
                    }`}>{row.plan}</span></span>
                    <span className="text-zinc-400">{row.audits}</span>
                    <span className="text-zinc-400">{row.joined}</span>
                    <span><span className={`text-xs px-2 py-0.5 rounded inline-block ${
                      row.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    } border ${row.status === "Active" ? "border-green-500/20" : "border-red-500/20"}`}>{row.status}</span></span>
                    <div className="flex gap-2">
                      <button className="text-zinc-400 hover:text-indigo-400"><Eye size={16} /></button>
                      <button className="text-zinc-400 hover:text-yellow-400"><Ban size={16} /></button>
                      <button className="text-zinc-400 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentUser?.role === "admin" && adminTab === "plans" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Subscription Plans</h1>
                  <p className="text-zinc-400 text-sm">Edit and manage your pricing tiers.</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  + New Plan
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { id: "free", name: "Free", price: "$0", subscribers: "842 users", features: ["3 audits/month", "Basic reports", "Email support"] },
                  { id: "pro", name: "Pro", price: "$19", subscribers: "156 users", features: ["Unlimited audits", "Full audit report", "Rewritten copy", "Copy-paste fixes"] },
                  { id: "agency", name: "Agency", price: "$49", subscribers: "23 users", features: ["Everything in Pro", "Unlimited team seats", "White-label reports", "API access"] },
                ].map((plan) => (
                  <div key={plan.id} className="bg-[#111111] border border-zinc-800 rounded-xl p-6">
                    {editingPlan === plan.id ? (
                      <div className="space-y-4">
                        <input placeholder="Plan name" defaultValue={plan.name} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500" />
                        <input type="number" placeholder="Price" defaultValue={plan.price.replace("$", "")} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500" />
                        <textarea placeholder="Features (one per line)" defaultValue={plan.features.join("\n")} rows={5} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm font-mono outline-none focus:border-indigo-500 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => setEditingPlan(null)} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700">
                            Save Changes
                          </button>
                          <button onClick={() => setEditingPlan(null)} className="flex-1 border border-zinc-700 text-zinc-400 rounded-lg py-2 text-sm hover:bg-zinc-800/50">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                        <p className="text-indigo-400 font-bold text-2xl mb-2">{plan.price}</p>
                        <p className="text-zinc-500 text-xs mb-4">{plan.subscribers}</p>
                        <ul className="space-y-2 text-sm text-zinc-300 mb-6">
                          {plan.features.map((f, i) => (
                            <li key={i}>✓ {f}</li>
                          ))}
                        </ul>
                        <button onClick={() => setEditingPlan(plan.id)} className="w-full border border-zinc-700 text-zinc-400 rounded-lg px-4 py-2 text-sm hover:bg-zinc-800/50">
                          Edit Plan
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  //  RENDER: LANDING PAGE 
  const themeVars = theme === "dark" ? {
    "--bg-base": "#0A0A0A",
    "--bg-surface": "#111111",
    "--bg-elevated": "#1A1A1A",
    "--border": "#222222",
    "--border-hover": "#333333",
    "--text-primary": "#F5F5F5",
    "--text-muted": "#71717A",
    "--text-hint": "#3F3F46",
    "--input-bg": "#09090B",
    "--input-border": "#27272A",
    "--accent": "#4F46E5",
    "--accent-hover": "#4338CA",
    "--accent-glow": "rgba(79,70,229,0.4)",
    "--success": "#22C55E",
    "--warning": "#EAB308",
    "--danger": "#EF4444",
  } : {
    "--bg-base": "#FAFAFA",
    "--bg-surface": "#FFFFFF",
    "--bg-elevated": "#F4F4F5",
    "--border": "#E4E4E7",
    "--border-hover": "#D4D4D8",
    "--text-primary": "#09090B",
    "--text-muted": "#52525B",
    "--text-hint": "#A1A1AA",
    "--input-bg": "#FFFFFF",
    "--input-border": "#D4D4D8",
    "--accent": "#4F46E5",
    "--accent-hover": "#4338CA",
    "--accent-glow": "rgba(79,70,229,0.4)",
    "--success": "#16A34A",
    "--warning": "#CA8A04",
    "--danger": "#DC2626",
  } as any;

  return (
    <div className={theme} style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "system-ui", ...themeVars }}>
      <style>{`
        @keyframes dot-pulse {
          0%, 20% { content: ""; }
          40% { content: "."; }
          60% { content: ".."; }
          80%, 100% { content: "..."; }
        }
      `}</style>

      {/*  NAVBAR  */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(var(--bg-base-rgb), 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "1rem", paddingBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", fontSize: "1.125rem", color: "var(--text-primary)" }}>
            <span>🔥</span>
            <span>PageRoast</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {["How It Works", "Results", "Showcase", "Testimonials", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{ borderRadius: "0.5rem", padding: "0.5rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} style={{ color: "#F59E0B" }} /> : <Moon size={18} style={{ color: "var(--text-muted)" }} />}
            </button>
            <button
              onClick={() => setAppView("login")}
              style={{ border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "0.5rem", paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", fontSize: "0.875rem", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              Log In
            </button>
            <button
              onClick={() => setAppView("signup")}
              style={{ background: "var(--accent)", color: "#fff", borderRadius: "0.5rem", paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", border: "none", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/*  HERO SECTION  */}
      {landingView === "hero" && (
        <>
          <section className="flex flex-col items-center justify-center min-h-screen px-6 py-20 gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10">
              <span className="text-indigo-400 text-xs font-medium">✦ AI-Powered UX Audits</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight max-w-3xl text-center text-white">
              Your landing page is costing you customers.
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl text-center">
              Paste your URL and get a brutally honest AI audit — with the exact code to fix every issue.
            </p>
            <div style={{ width: "100%", maxWidth: "32rem" }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  type="url"
                  value={auditUrl}
                  onChange={(e) => { setAuditUrl(e.target.value); setUrlError(""); }}
                  onFocus={() => setFocused("hero-url")}
                  onBlur={() => setFocused(null)}
                  placeholder="https://your-landing-page.com"
                  style={{ flex: 1, background: "var(--input-bg)", border: `1px solid ${urlError ? "var(--danger)" : "var(--input-border)"}`, color: "var(--text-primary)", borderRadius: "0.5rem", padding: "0.75rem 1rem", fontSize: "1rem", outline: "none", boxShadow: focused === "hero-url" ? "0 0 0 2px var(--accent-glow)" : "none", transition: "all 0.2s" }}
                  placeholder="https://your-landing-page.com"
                />
                <button
                  onClick={handleLandingRoast}
                  style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", fontWeight: 600, color: "white", fontSize: "1rem", borderRadius: "0.5rem", whiteSpace: "nowrap", transition: "all 0.2s", background: "linear-gradient(to right, var(--accent), #7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 0 24px var(--accent-glow)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 32px var(--accent-glow)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 24px var(--accent-glow)")}
                >
                  Roast My Page →
                </button>
              </div>
              {urlError && (
                <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span>⚠</span> {urlError}
                </p>
              )}
            </div>
          </section>

          {/*  HOW IT WORKS  */}
          <section id="how-it-works" className="px-6 py-24 bg-[#0A0A0A]">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6">
                  <span className="text-indigo-400 text-xs font-medium">Simple Process</span>
                </div>
                <h2 className="text-4xl font-bold text-white">From URL to fixes in 60 seconds.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="absolute top-8 left-0 right-0 h-px border-t border-dashed border-zinc-700 hidden md:block" />
                {[
                  { num: "01", icon: Link, title: "Paste Your URL", desc: "Drop in any landing page URL. We render it exactly as your visitors see it." },
                  { num: "02", icon: ScanSearch, title: "AI Runs the Audit", desc: "Our model checks 40+ UX signals — hierarchy, CTA placement, copy clarity, and mobile layout." },
                  { num: "03", icon: Code2, title: "Get Copy-Paste Fixes", desc: "Every issue comes with an exact React + Tailwind snippet. No guessing, no tickets." },
                ].map((step, i) => (
                  <div key={i} className="bg-[#111111] border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/40 transition-colors relative z-10">
                    <div className="mb-6">
                      <step.icon size={28} style={{ color: "#818CF8" }} className="mb-4" />
                      <div className="text-xs font-mono text-indigo-400 font-bold mb-3">{step.num}</div>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-400">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/*  LOADING (LANDING)  */}
      {landingView === "loading" && (
        <section className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-8 max-w-lg w-full mx-auto">
            <p className="text-white font-semibold mb-6">Analyzing your page...</p>
            <ul className="space-y-4">
              {LOADING_STEPS.map((step, i) => {
                const isDone = completedSteps.includes(i);
                const isActive = activeStep === i && !isDone;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className="w-5 text-center font-bold text-sm flex-shrink-0"
                      style={{
                        color: isDone ? "#6366F1" : isActive ? "#6366F1" : "#71717A",
                      }}
                    >
                      {isDone ? "✓" : isActive ? "◆" : "◇"}
                    </span>
                    <span
                      className="text-sm"
                      style={{
                        color: isDone ? "#71717A" : isActive ? "#F5F5F5" : "#71717A",
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {step}
                      {isActive && <span className="animate-pulse ml-1">...</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((completedSteps.length) / LOADING_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/*  RESULTS (LANDING)  */}
      {landingView === "results" && (
        <section className="px-6 py-16 max-w-5xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 flex flex-col items-center gap-4">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#222222" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="8"
                  strokeDasharray="314"
                  strokeDashoffset="181"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "32px", fontWeight: "bold", fill: "#F5F5F5", fontFamily: "monospace" }}>
                  42
                </text>
              </svg>
              <div className="text-center">
                <p style={{ fontSize: "12px", color: "#71717A" }}>/100</p>
                <p style={{ fontSize: "14px", color: "#71717A" }} className="mt-2">
                  Conversion Score
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 underline text-sm mt-4 transition-colors"
                >
                  View Full Report →
                </button>
              </div>
            </div>

            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-6">Critical Issues</h3>
              <ul className="space-y-4">
                {[
                  "Hero CTA is below the fold on mobile — bleeding 60% of conversions.",
                  "3 competing font sizes in first viewport — no visual hierarchy.",
                  "Zero social proof above the fold — trust must be earned immediately.",
                ].map((truth, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✕</span>
                    <p className="text-sm text-zinc-300 leading-relaxed">{truth}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4">AI-Rewritten Hero Copy</h3>
              <textarea
                readOnly
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm text-zinc-300 font-mono resize-none outline-none leading-relaxed"
                rows={5}
                defaultValue={`Turn visitors into customers in 14 days — or your money back.
No fluff. No vague promises. Just the exact fixes your page needs.`}
              />
            </div>

            <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold text-sm">Suggested Fix</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} style={{ color: "#6366F1" }} />
                      <span className="text-xs font-mono">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="text-xs font-mono">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-6 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed" style={{ backgroundColor: "#0F0F0F" }}>
                <code>{CODE_SNIPPET}</code>
              </pre>
            </div>
          </div>

          <div className="bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden relative min-h-64">
            <div className="p-8 blur-sm pointer-events-none select-none" aria-hidden="true">
              <h3 className="text-white font-semibold text-sm mb-4">Advanced SEO Insights</h3>
              <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-12 bg-zinc-700 rounded" />
                  Core Web Vitals score
                </li>
              </ul>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl gap-3">
              <Lock size={32} style={{ color: "#6366F1" }} />
              <button
                onClick={() => setAppView("signup")}
                className="mt-4 px-6 py-2 font-semibold text-white text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Sign Up to Unlock →
              </button>
            </div>
          </div>
        </section>
      )}

      {/*  PRICING  */}
      <section id="pricing" className="px-6 py-20 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-2">Simple Pricing</h2>
            <p className="text-zinc-400">No subscription traps. Pay once, get lifetime access.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "The Reality Check", price: "$0", features: ["3-point roast summary", "Conversion score", "1 fix preview"], btn: "Get Started", btnBg: "border border-zinc-700" },
              { name: "The Actionable Fix", price: "$19", features: ["Full UX/UI audit", "Rewritten hero copy", "Copy-paste code fixes"], btn: "Fix My Page", btnBg: "bg-indigo-600", recommended: true },
              { name: "The Agency Engine", price: "$49", features: ["Unlimited audits", "White-label PDF reports", "API access"], btn: "Go Pro", btnBg: "border border-zinc-700" },
            ].map((plan, i) => (
              <div key={i} className={`bg-[#111111] border rounded-xl p-6 flex flex-col ${plan.recommended ? "border-indigo-500/50" : "border-zinc-800"}`}>
                {plan.recommended && (
                  <div className="px-4 py-2 font-bold text-white text-xs text-center rounded mb-4 bg-indigo-600">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-zinc-400 text-xs font-mono uppercase mb-2">{plan.name}</p>
                  <p className="text-4xl font-bold text-white">{plan.price}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <span>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setAppView("signup")}
                  className={`w-full py-2 font-semibold text-sm rounded-lg transition-colors ${plan.btnBg === "border border-zinc-700" ? "border border-zinc-700 text-white hover:bg-zinc-900/50" : "bg-indigo-600 text-white hover:bg-indigo-500"}`}
                >
                  {plan.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  FOOTER  */}
      <footer className="border-t border-zinc-800 px-6 py-8 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <p className="text-white font-bold text-lg">🔥 PageRoast AI</p>
            <p className="text-zinc-600 text-xs mt-2">© 2025 PageRoast. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-zinc-500 hover:text-white text-sm transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/*  PAYMENT MODAL  */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start border-b border-zinc-800">
              <div>
                <h3 className="text-white font-bold text-xl">Upgrade to {selectedPlan === "pro" ? "Pro" : "Agency"}</h3>
                <p className="text-zinc-400 text-sm mt-1">${selectedPlan === "pro" ? "19" : "49"} · One-time payment</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-zinc-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="px-8 py-6 space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-4">What's included</h4>
                <div className="space-y-3">
                  {["Full UX/UI audit report", "Rewritten hero copy", "Copy-paste React + Tailwind fixes"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="text-zinc-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-xs uppercase tracking-wide mb-3">Card Information</p>
                <div className="space-y-3">
                  <input
                    placeholder="Name on card"
                    value={paymentForm.name}
                    onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
                  />
                  <input
                    placeholder="4242 4242 4242 4242"
                    value={paymentForm.card}
                    onChange={(e) => setPaymentForm({...paymentForm, card: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="MM / YY"
                      value={paymentForm.expiry}
                      onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
                    />
                    <input
                      placeholder="CVC"
                      value={paymentForm.cvc}
                      onChange={(e) => setPaymentForm({...paymentForm, cvc: e.target.value})}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center text-zinc-500 text-xs">
                <Lock size={14} />
                <span>256-bit SSL encrypted</span>
                <span>·</span>
                <span>Powered by Stripe</span>
              </div>
              <button
                onClick={() => {
                  setCurrentUser({...currentUser!, plan: selectedPlan});
                  setShowPaymentModal(false);
                  setShowPaymentSuccess(true);
                  setTimeout(() => setShowPaymentSuccess(false), 3000);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Pay ${selectedPlan === "pro" ? "19" : "49"} Now →
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  PAYMENT SUCCESS TOAST  */}
      {showPaymentSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 z-50">
          Payment successful! Plan upgraded.
        </div>
      )}

      {/*  FULL AUDIT REPORT MODAL  */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start border-b border-zinc-800">
              <div>
                <h3 className="text-white font-bold text-xl">Full Audit Report</h3>
                <p className="text-zinc-500 text-sm mt-1">pageexample.com · Audited just now</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="px-8 pb-8 space-y-8">
              <div className="pt-4">
                <h4 className="text-white font-semibold mb-4">Score Breakdown</h4>
                <div className="space-y-4">
                  {[
                    { label: "Visual Hierarchy", score: 38, color: "bg-red-500" },
                    { label: "CTA Effectiveness", score: 51, color: "bg-yellow-500" },
                    { label: "Copy Clarity", score: 67, color: "bg-yellow-500" },
                    { label: "Mobile Layout", score: 29, color: "bg-red-500" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-300 text-sm">{metric.label}</span>
                        <span className="text-white font-semibold text-sm">{metric.score}/100</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${metric.color} rounded-full transition-all`} style={{ width: `${metric.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "15px", marginBottom: "12px" }}>What's Working</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                  {strengths.map((strength, i) => (
                    <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "3px solid var(--success)", borderRadius: "8px", padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "4px" }}>
                        <Check size={14} style={{ color: "var(--success)", marginTop: "2px", flexShrink: 0 }} />
                        <p style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>{strength.headline}</p>
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginTop: "4px", marginLeft: "22px" }}>
                        {strength.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">All Issues Found</h4>
                <div className="space-y-3">
                  {[
                    { severity: "CRITICAL", title: "No above-fold CTA", desc: "Primary action button appears 840px below viewport top on mobile.", color: "bg-red-500/20 text-red-400" },
                    { severity: "CRITICAL", title: "Headline lacks specificity", desc: "Current headline scores 3/10 on clarity. Add a quantified outcome.", color: "bg-red-500/20 text-red-400" },
                    { severity: "WARNING", title: "4 font weights in hero section", desc: "Exceeds 2-weight limit. Creates visual noise and weak hierarchy.", color: "bg-yellow-500/20 text-yellow-400" },
                  ].map((issue) => (
                    <div key={issue.title} className="bg-zinc-900 rounded-lg p-4">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-2 ${issue.color}`}>
                        {issue.severity}
                      </div>
                      <h5 className="text-white text-sm font-medium">{issue.title}</h5>
                      <p className="text-zinc-400 text-xs mt-1">{issue.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 px-8 py-4">
              <button
                onClick={() => setAppView("signup")}
                className="w-full py-2 font-semibold text-white text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Upgrade to Fix My Page →
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  VIEW REPORT PAGE  */}
      {appView === "view-report" && activeReport && (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", paddingTop: "64px" }}>
          {/* Top Bar */}
          <div style={{ position: "sticky", top: 0, background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40 }}>
            <button onClick={() => setAppView("user-dashboard")} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "14px", cursor: "pointer", background: "none", border: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
              ← Back to Dashboard
            </button>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "15px" }}>{activeReport.url}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>Audited {activeReport.date}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: activeReport.score >= 70 ? "rgba(34,197,94,0.1)" : activeReport.score >= 50 ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)", color: activeReport.score >= 70 ? "#22c55e" : activeReport.score >= 50 ? "#eab308" : "#ef4444", border: "1px solid", borderColor: activeReport.score >= 70 ? "rgba(34,197,94,0.2)" : activeReport.score >= 50 ? "rgba(234,179,8,0.2)" : "rgba(239,68,68,0.2)", borderRadius: "6px", paddingLeft: "8px", paddingRight: "8px", paddingTop: "4px", paddingBottom: "4px", fontSize: "12px", fontWeight: 600 }}>
                {activeReport.score}/100
              </div>
              <button style={{ border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "8px", paddingLeft: "16px", paddingRight: "16px", paddingTop: "8px", paddingBottom: "8px", fontSize: "14px", cursor: "pointer", background: "none", display: "flex", alignItems: "center", gap: "6px", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "24px", paddingRight: "24px", paddingTop: "32px", paddingBottom: "32px" }}>
            {/* Score + Grades + Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
              {/* Score Ring */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: "0 auto 12px" }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray="314" strokeDashoffset={314 - (314 * activeReport.score / 100)} strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "32px", fontWeight: "bold", fill: "var(--text-primary)", fontFamily: "monospace" }}>
                    {activeReport.score}
                  </text>
                </svg>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Conversion Score</p>
              </div>

              {/* Element Grades */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
                <h4 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "16px" }}>Element Grades</h4>
                {[
                  { label: "Copy Clarity", score: 52 },
                  { label: "CTA Visibility", score: 38 },
                  { label: "Headline Impact", score: 71 },
                  { label: "Visual Design", score: 67 }
                ].map((item, i) => {
                  const gradeColor = item.score >= 85 ? "var(--success)" : item.score >= 65 ? "var(--accent)" : item.score >= 45 ? "var(--warning)" : "var(--danger)";
                  const gradeLabel = item.score >= 85 ? "Exceptional" : item.score >= 65 ? "Good" : item.score >= 45 ? "Needs Work" : "Unsatisfactory";
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < 3 ? "12px" : "0", borderBottom: i < 3 ? "1px solid var(--border)" : "none", marginBottom: i < 3 ? "12px" : "0" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{item.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: gradeColor, background: `${gradeColor}15`, border: `1px solid ${gradeColor}33`, borderRadius: "4px", paddingLeft: "8px", paddingRight: "8px", paddingTop: "4px", paddingBottom: "4px" }}>
                        {gradeLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
                <h4 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "16px" }}>Quick Stats</h4>
                {[
                  { label: "Issues Found", value: activeReport.issues },
                  { label: "Critical", value: "2" },
                  { label: "Warnings", value: "3" },
                  { label: "Audit Date", value: activeReport.date }
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: i < 3 ? "12px" : "0", borderBottom: i < 3 ? "1px solid var(--border)" : "none", marginBottom: i < 3 ? "12px" : "0" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths + Issues */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
              {/* Strengths */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
                <h4 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "16px" }}>What's Working</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                  {strengths.map((item, i) => (
                    <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "3px solid var(--success)", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                        <Check size={14} style={{ color: "var(--success)", flexShrink: 0, marginTop: "2px" }} />
                        <p style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>{item.headline}</p>
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "22px" }}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
                <h4 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "16px" }}>Critical Issues</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                  {[
                    { title: "CTA below fold", desc: "Button is 840px down on mobile" },
                    { title: "Font hierarchy chaos", desc: "3 competing sizes in hero" },
                    { title: "No social proof", desc: "Zero testimonials above fold" }
                  ].map((item, i) => (
                    <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "3px solid var(--danger)", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ color: "var(--danger)", fontSize: "14px", marginTop: "2px" }}>✕</span>
                        <p style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>{item.title}</p>
                      </div>
                      <p style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "22px" }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Roast + Action Items */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "20px" }}>🔥</span>
                <h4 style={{ color: "var(--text-primary)", fontWeight: 600 }}>The Roast</h4>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Personalized for {activeReport.url}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "16px" }}>
                {roastLines.map((item, i) => (
                  <div key={i} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "3px solid var(--danger)", borderRadius: "8px", padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ color: "var(--danger)" }}>✕</span>
                      <p style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 500 }}>{item.headline}</p>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "22px" }}>{item.detail}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "13px" }}>Honestly? We've seen worse. But not much.</p>
            </div>

            {/* Action Items */}
            <div>
              <h4 style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "16px", marginBottom: "16px" }}>Action Items — Fix These First</h4>
              {[
                { priority: "CRITICAL", title: "Move CTA above the fold", copy: "Start for free. See results in 14 days.", code: `<button className="bg-indigo-600 text-white px-6 py-3\n  font-semibold rounded-lg mt-0">\n  Start Free →\n</button>` },
                { priority: "CRITICAL", title: "Rewrite the hero headline", copy: "Cut acquisition cost by 40% — or we'll tell you why not.", code: `<h1 className="text-5xl font-bold leading-tight max-w-2xl">\n  Cut acquisition cost by 40% —\n  or we'll tell you why not.\n</h1>` },
                { priority: "HIGH", title: "Add social proof above the fold", copy: "", code: `<div className="flex items-center gap-3 mt-4">\n  <div className="flex -space-x-2">\n    {[1,2,3].map(i => (\n      <div key={i} className="w-8 h-8 rounded-full bg-indigo-600" />\n    ))}\n  </div>\n  <span className="text-sm">Trusted by 1,200+ founders</span>\n</div>` }
              ].map((fix, i) => (
                <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "bold", paddingLeft: "8px", paddingRight: "8px", paddingTop: "4px", paddingBottom: "4px", borderRadius: "4px", background: fix.priority === "CRITICAL" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)", color: fix.priority === "CRITICAL" ? "var(--danger)" : "var(--warning)", border: fix.priority === "CRITICAL" ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(234,179,8,0.2)" }}>
                      {fix.priority}
                    </span>
                    <p style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 500 }}>{fix.title}</p>
                  </div>
                  {fix.copy && (
                    <div style={{ marginBottom: "16px" }}>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Suggested copy</p>
                      <textarea readOnly value={fix.copy} style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "var(--text-primary)", fontFamily: "monospace", resize: "none", outline: "none" }} rows={2} />
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Code fix</p>
                    <pre style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", borderRadius: "8px", padding: "16px", fontSize: "12px", color: "var(--text-primary)", fontFamily: "monospace", overflowX: "auto" }}>
                      {fix.code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {currentUser?.plan === "free" && (
              <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", padding: "32px", textAlign: "center", marginTop: "24px" }}>
                <h4 style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Unlock the Developer Fix Pack</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>Get the full rewritten copy doc + annotated component file for every fix on this page.</p>
                <button onClick={() => setAppView("checkout")} style={{ background: "var(--accent)", color: "white", borderRadius: "8px", paddingLeft: "32px", paddingRight: "32px", paddingTop: "12px", paddingBottom: "12px", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer" }}>
                  Upgrade to Pro — $19
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/*  CHECKOUT PAGE  */}
      {appView === "checkout" && (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", paddingTop: "64px" }}>
          {/* Top Bar */}
          <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px", paddingBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "18px", color: "var(--text-primary)", cursor: "pointer" }} onClick={() => setAppView("landing")}>
              🔥 PageRoast
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
              <Lock size={14} /> Secure Checkout
            </div>
          </div>

          {/* Main Content */}
          <div style={{ maxWidth: "80rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "24px", paddingRight: "24px", paddingTop: "48px", paddingBottom: "48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "48px" }}>
              {/* Form */}
              <div>
                {!checkoutSuccess ? (
                  <>
                    <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "32px" }}>Complete your purchase</h1>

                    {/* Contact */}
                    <div style={{ marginBottom: "32px" }}>
                      <p style={{ fontSize: "12px", textTransform: "uppercase", tracking: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>Contact</p>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={paymentForm.name}
                        onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                        style={{ width: "100%", background: "var(--input-bg)", border: `1px solid ${errors.email ? "var(--danger)" : "var(--input-border)"}`, borderRadius: "8px", padding: "12px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                      />
                      {errors.email && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>⚠ {errors.email}</p>}
                    </div>

                    {/* Payment Details */}
                    <div style={{ marginBottom: "32px" }}>
                      <p style={{ fontSize: "12px", textTransform: "uppercase", tracking: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>Card Information</p>
                      <div style={{ marginBottom: "12px", position: "relative" }}>
                        <input
                          type="text"
                          placeholder="1234 1234 1234 1234"
                          value={paymentForm.card}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\s/g, "").slice(0, 16);
                            val = val.replace(/(\d{4})/g, "$1 ").trim();
                            setPaymentForm({...paymentForm, card: val});
                          }}
                          style={{ width: "100%", background: "var(--input-bg)", border: `1px solid ${errors.card ? "var(--danger)" : "var(--input-border)"}`, borderRadius: "8px", padding: "12px", color: "var(--text-primary)", fontSize: "14px", outline: "none", paddingRight: "40px" }}
                        />
                        <CreditCard size={18} style={{ position: "absolute", right: "12px", top: "12px", color: "var(--text-muted)", pointerEvents: "none" }} />
                      </div>
                      {errors.card && <p style={{ color: "var(--danger)", fontSize: "12px", marginBottom: "12px" }}>⚠ {errors.card}</p>}

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            value={paymentForm.expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length >= 2) val = val.slice(0, 2) + " / " + val.slice(2, 4);
                              setPaymentForm({...paymentForm, expiry: val});
                            }}
                            style={{ width: "100%", background: "var(--input-bg)", border: `1px solid ${errors.expiry ? "var(--danger)" : "var(--input-border)"}`, borderRadius: "8px", padding: "12px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                          />
                          {errors.expiry && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>⚠ {errors.expiry}</p>}
                        </div>
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            placeholder="CVC"
                            value={paymentForm.cvc}
                            onChange={(e) => setPaymentForm({...paymentForm, cvc: e.target.value.replace(/\D/g, "").slice(0, 4)})}
                            style={{ width: "100%", background: "var(--input-bg)", border: `1px solid ${errors.cvc ? "var(--danger)" : "var(--input-border)"}`, borderRadius: "8px", padding: "12px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                            title="3 digits on back of card"
                          />
                          {errors.cvc && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>⚠ {errors.cvc}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "32px" }}>
                      <button
                        onClick={() => setBillingOpen(!billingOpen)}
                        style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-muted)", cursor: "pointer", background: "none", border: "none" }}
                      >
                        <ChevronDown size={16} style={{ transform: billingOpen ? "rotate(180deg)" : "rotate(0)" }} />
                        Add billing address (optional)
                      </button>
                      {billingOpen && (
                        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                          <input placeholder="Name on card" style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "var(--text-primary)", fontSize: "14px" }} />
                          <select style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "var(--text-primary)", fontSize: "14px" }}>
                            <option>United States</option>
                            <option>United Kingdom</option>
                            <option>Pakistan</option>
                            <option>Other</option>
                          </select>
                          <input placeholder="ZIP / Postal code" style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "8px", padding: "12px", color: "var(--text-primary)", fontSize: "14px" }} />
                        </div>
                      )}
                    </div>

                    {/* Pay Button */}
                    <button
                      onClick={handlePaymentSubmit}
                      style={{ width: "100%", background: "var(--accent)", color: "white", paddingTop: "16px", paddingBottom: "16px", fontSize: "18px", fontWeight: 600, borderRadius: "12px", border: "none", cursor: "pointer" }}
                    >
                      Pay $19.00 →
                    </button>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
                    <CheckCircle size={56} style={{ color: "var(--success)", marginBottom: "16px" }} />
                    <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Payment Successful!</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "32px" }}>Your full audit report is now unlocked.</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => { setAppView("view-report"); setCheckoutSuccess(false); }} style={{ background: "var(--accent)", color: "white", borderRadius: "8px", paddingLeft: "24px", paddingRight: "24px", paddingTop: "12px", paddingBottom: "12px", fontWeight: 600, fontSize: "14px", border: "none", cursor: "pointer" }}>
                        View My Report →
                      </button>
                      <button onClick={() => { setAppView("user-dashboard"); setCheckoutSuccess(false); }} style={{ border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "8px", paddingLeft: "24px", paddingRight: "24px", paddingTop: "12px", paddingBottom: "12px", fontWeight: 600, fontSize: "14px", background: "none", cursor: "pointer" }}>
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div style={{ position: "sticky", top: "96px" }}>
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
                  <h4 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "16px" }}>Order Summary</h4>

                  <div style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid var(--border)" }}>
                    <p style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: "4px" }}>The Actionable Fix</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "8px" }}>One-time purchase · Lifetime access</p>
                    <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px" }}>$19.00</p>
                  </div>

                  <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
                    {["Full UX/UI audit report", "Rewritten hero copy", "Copy-paste React + Tailwind fixes", "Permanent report access"].map((feature, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < 3 ? "8px" : "0", alignItems: "flex-start" }}>
                        <Check size={13} style={{ color: "var(--success)", marginTop: "2px", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Total today</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "20px" }}>$19.00</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { icon: Lock, text: "256-bit SSL encrypted" },
                      { icon: Lock, text: "No subscription. Pay once." },
                      { icon: Lock, text: "Refund if not satisfied" }
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                        <item.icon size={13} />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PageRoastAI;
