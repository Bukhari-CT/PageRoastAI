"use client";

import { useState } from "react";
import { LandingNavbar } from "@/components/features/landing/landing-navbar";
import { HeroSection } from "@/components/features/landing/hero-section";
import { HowItWorksSection } from "@/components/features/landing/how-it-works-section";
import { LoadingAnalysis } from "@/components/features/landing/loading-analysis";
import { LandingResultsPreview } from "@/components/features/landing/results-preview";
import { PricingSection } from "@/components/features/landing/pricing-section";
import { Footer } from "@/components/features/landing/footer";
import { LoginForm } from "@/components/features/auth/login-form";
import { SignupForm } from "@/components/features/auth/signup-form";
import { GuestResults } from "@/components/features/report/guest-results";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { ReportView } from "@/components/features/report/report-view";
import { CheckoutPage } from "@/components/features/checkout/checkout-page";
import { useLoadingSteps } from "@/hooks/use-loading-steps";
import { isValidUrl } from "@/lib/validators";
import { LOADING_STEPS } from "@/constants";
import type { AppView, LandingView, User, ActiveReport } from "@/types";

export default function PageRoastAI() {
  // ─── Core State ──────────────────────────────────────────────────────────
  const [appView, setAppView] = useState<AppView>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeReport, setActiveReport] = useState<ActiveReport | null>(null);

  // ─── Landing State ───────────────────────────────────────────────────────
  const [landingView, setLandingView] = useState<LandingView>("hero");
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { activeStep, completedSteps, isFinished } = useLoadingSteps(landingView === "loading");

  // Transition to results when loading finishes
  if (isFinished && landingView === "loading") {
    setLandingView("results");
  }

  // ─── Navigation ──────────────────────────────────────────────────────────
  function navigate(view: AppView) {
    setAppView(view);
    if (view === "landing") {
      setLandingView("hero");
    }
  }

  function handleLogin(user: User) {
    setCurrentUser(user);
    setAppView("user-dashboard");
  }

  function handleLogout() {
    setCurrentUser(null);
    setAppView("landing");
    setLandingView("hero");
  }

  function handleLandingRoast() {
    if (currentUser) {
      setAppView("user-dashboard");
    } else {
      setLandingView("loading");
    }
  }

  // ─── Route: Login ────────────────────────────────────────────────────────
  if (appView === "login") {
    return <LoginForm onNavigate={navigate} onLogin={handleLogin} />;
  }

  // ─── Route: Signup ───────────────────────────────────────────────────────
  if (appView === "signup") {
    return <SignupForm onNavigate={navigate} onSignup={handleLogin} />;
  }

  // ─── Route: Guest Results ────────────────────────────────────────────────
  if (appView === "results") {
    return (
      <GuestResults
        onNavigate={navigate}
        onShowModal={() => setShowModal(true)}
      />
    );
  }

  // ─── Route: Dashboard ───────────────────────────────────────────────────
  if (appView === "user-dashboard" && currentUser) {
    return (
      <DashboardShell
        user={currentUser}
        onNavigate={navigate}
        onLogout={handleLogout}
        onUpdateUser={setCurrentUser}
      />
    );
  }

  // ─── Route: View Report ─────────────────────────────────────────────────
  if (appView === "view-report") {
    const report = activeReport || { url: "example.com", date: "Jan 28 2025", score: 42, issues: 5 };
    return (
      <ReportView
        report={report}
        user={currentUser}
        onNavigate={navigate}
      />
    );
  }

  // ─── Route: Checkout ────────────────────────────────────────────────────
  if (appView === "checkout") {
    return (
      <CheckoutPage
        user={currentUser}
        onNavigate={navigate}
        onUpdateUser={setCurrentUser}
      />
    );
  }

  // ─── Route: Landing Page ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]" style={{ fontFamily: "system-ui" }}>
      <LandingNavbar onNavigate={navigate} />

      {landingView === "hero" && (
        <>
          <HeroSection
            onRoast={handleLandingRoast}
            auditUrl={auditUrl}
            onUrlChange={setAuditUrl}
            urlError={urlError}
            onUrlErrorChange={setUrlError}
          />
          <HowItWorksSection />
        </>
      )}

      {landingView === "loading" && (
        <LoadingAnalysis
          activeStep={activeStep}
          completedSteps={completedSteps}
          totalSteps={LOADING_STEPS.length}
        />
      )}

      {landingView === "results" && (
        <LandingResultsPreview onNavigate={navigate} />
      )}

      <PricingSection onNavigate={navigate} />
      <Footer />
    </div>
  );
}
