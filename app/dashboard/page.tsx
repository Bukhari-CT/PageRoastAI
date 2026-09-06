import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { listReportsForUser } from "@services/ReportStore";
import { getAuditUsage } from "@application/Usage/AuditUsageService";
import { resolvePlan } from "@/shared/config/plans";
import type { AuditRow, User, UserRole } from "@/types";

/** How many audits the history tab shows before pagination becomes worthwhile. */
const HISTORY_LIMIT = 20;

/**
 * Duration budget for this route, inherited by the server actions it hosts.
 *
 * `maxDuration` is an app *segment* config — Next reads it from a page, layout
 * or route handler, not from an arbitrary "use server" module — so the audit
 * action picks it up from the pages that invoke it.
 *
 * 120s covers the bounded pipeline: page fetch budget 15s + two Gemini attempts
 * at 30s plus backoff (~62s) + database work, with headroom. Vercel enforces
 * its own plan ceiling on top of this (Hobby is far lower), which the
 * deployment phase must confirm.
 */
export const maxDuration = 120;

/**
 * Dashboard Page - requires server-side session validation.
 *
 * Audit history is loaded here rather than through a client fetch: the page is
 * already a server component with the session in hand, so a second round trip
 * and a new API surface would buy nothing.
 */
export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const { user: authUser } = session;

    // Transform Better Auth user to match Dashboard UI expectations
    const dashboardUser: User = {
        name: authUser.name || `${authUser.firstName} ${authUser.lastName}`,
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email,
        role: (authUser.isAdmin ? "admin" : "user") as UserRole,
        plan: resolvePlan(authUser.package).id,
    };

    const [reports, usage] = await Promise.all([
        listReportsForUser(authUser.id, HISTORY_LIMIT),
        getAuditUsage(authUser.id, dashboardUser.plan),
    ]);
    const history: AuditRow[] = reports.map((report) => ({
        id: report.id,
        url: report.url,
        score: report.score,
        issues: report.criticalIssues.length,
        planId: report.planId,
        createdAt: report.createdAt,
    }));

    return <DashboardShell user={dashboardUser} history={history} usage={usage} />;
}
