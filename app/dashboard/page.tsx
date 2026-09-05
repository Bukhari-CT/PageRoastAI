import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import { listReportsForUser } from "@services/ReportStore";
import { resolvePlan } from "@/shared/config/plans";
import type { AuditRow, User, UserRole } from "@/types";

/** How many audits the history tab shows before pagination becomes worthwhile. */
const HISTORY_LIMIT = 20;

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

    const reports = await listReportsForUser(authUser.id, HISTORY_LIMIT);
    const history: AuditRow[] = reports.map((report) => ({
        id: report.id,
        url: report.url,
        score: report.score,
        issues: report.criticalIssues.length,
        tier: report.tier,
        createdAt: report.createdAt,
    }));

    return <DashboardShell user={dashboardUser} history={history} />;
}
