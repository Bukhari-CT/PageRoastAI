"use client";

import { useState } from "react";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { LoadingAnalysis } from "./loading-analysis";
import { LandingResultsPreview } from "./results-preview";
import { PricingSection } from "./pricing-section";
import { Footer } from "./footer";
import { useLoadingSteps } from "@/hooks/useLoadingSteps";
import { roastUrlAction, type RoastActionResult } from "@/app/actions/roast.actions";
import { LOADING_STEPS } from "@/constants";
import type { LandingView, AppView } from "@/types";
import { useRouter } from "next/navigation";

export function LandingContainer() {
  const router = useRouter();
  const [landingView, setLandingView] = useState<LandingView>("hero");
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [roastResult, setRoastResult] = useState<RoastActionResult | null>(null);

  const { activeStep, completedSteps } = useLoadingSteps(landingView === "loading");

  async function handleLandingRoast() {
    setLandingView("loading");
    const result = await roastUrlAction(auditUrl);
    if (result.error) {
      setUrlError(result.error);
      setLandingView("hero");
      return;
    }
    setRoastResult(result.data);
    setLandingView("results");
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
