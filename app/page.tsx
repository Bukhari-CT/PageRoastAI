import { LandingContainer } from "@/components/features/landing/landing-container";
import { LandingNavbarServer } from "@/components/features/landing/landing-navbar-wrapper";

export default function PageRoastAI() {
  return (
    <div className="min-h-screen">
      <LandingNavbarServer />
      <LandingContainer />
    </div>
  );
}
