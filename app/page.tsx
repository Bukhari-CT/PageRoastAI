import { LandingContainer } from "@/components/features/landing/landing-container";
import { LandingNavbarServer } from "@/components/features/landing/landing-navbar-wrapper";

export default function PageRoastAI() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]" style={{ fontFamily: "system-ui" }}>
      <LandingNavbarServer />
      <LandingContainer />
    </div>
  );
}
