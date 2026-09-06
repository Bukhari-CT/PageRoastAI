"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { LoadingAnalysis } from "./loading-analysis";
import { LandingResultsPreview } from "./results-preview";
import { PricingSection } from "./pricing-section";
import { Footer } from "./footer";
import { useLoadingSteps } from "@/hooks/useLoadingSteps";
import { roastUrlAction } from "@/app/actions/roast.actions";
import { auditFailureMessage, storePendingAuditUrl } from "@/lib/auditFeedback";
import { LOADING_STEPS } from "@/constants";
import type { StoredReport } from "@services/ReportStore";
import type { LandingView, AppView } from "@/types";

export function LandingContainer() {
  const router = useRouter();
  const [landingView, setLandingView] = useState<LandingView>("hero");
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [roastResult, setRoastResult] = useState<StoredReport | null>(null);

  const { activeStep, completedSteps } = useLoadingSteps(landingView === "loading");

  async function handleLandingRoast() {
    setLandingView("loading");
    const result = await roastUrlAction(auditUrl);

    if (result.status === "success") {
      setRoastResult(result.report);
      setLandingView("results");
      return;
    }

    // A guest is never audited silently. Their URL is carried across sign-up so
    // they do not have to retype it, and the audit runs once they are signed in.
    if (result.status === "auth_required") {
      storePendingAuditUrl(auditUrl);
      router.push("/signup");
      return;
    }

    setUrlError(auditFailureMessage(result.status));
    setLandingView("hero");
  }

  function navigate(view: AppView) {
    if (view === "landing") {
      setLandingView("hero");
      router.push("/");
    } else {
      router.push(`/${view}`);
    }
  }

  return (
    <>
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

      {landingView === "results" && roastResult && (
        <LandingResultsPreview result={roastResult} onNavigate={navigate} />
      )}

      <PricingSection onNavigate={navigate} />
      <Footer />
    </>
  );
}
