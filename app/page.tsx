import { LandingContainer } from "@/components/features/landing/landing-container";
import { LandingNavbarServer } from "@/components/features/landing/landing-navbar-wrapper";

/**
 * The audit server action is also invoked from this page, and `maxDuration` is
 * a route-segment config inherited by the actions a page hosts — see
 * app/dashboard/page.tsx for how the 120s budget was derived.
 */
export const maxDuration = 120;

export default function PageRoastAI() {
  return (
    <div className="min-h-screen">
      <LandingNavbarServer />
      <LandingContainer />
    </div>
  );
}
