"use client";

import { useState, useEffect } from "react";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { LoadingAnalysis } from "./loading-analysis";
import { LandingResultsPreview } from "./results-preview";
import { PricingSection } from "./pricing-section";
import { Footer } from "./footer";
import { useLoadingSteps } from "@/hooks/useLoadingSteps";
import { LOADING_STEPS } from "@/constants";
import type { LandingView, AppView } from "@/types";
import { useRouter } from "next/navigation";

export function LandingContainer() {
  const router = useRouter();
  const [landingView, setLandingView] = useState<LandingView>("hero");
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const { activeStep, completedSteps, isFinished } = useLoadingSteps(landingView === "loading");

  // Transition to results when loading finishes
  useEffect(() => {
    if (isFinished && landingView === "loading") {
      setLandingView("results");
    }
  }, [isFinished, landingView]);

  function handleLandingRoast() {
    // In a real app, check for auth
    setLandingView("loading");
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

      {landingView === "results" && (
        <LandingResultsPreview onNavigate={navigate} />
      )}

      <PricingSection onNavigate={navigate} />
      <Footer />
    </>
  );
}
