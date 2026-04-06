import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import type { User, UserRole, PlanId } from "@/types";

/**
 * Dashboard Page - requires server-side session validation.
 * Features a comprehensive UI with audit history, subscription management, and admin tools.
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
        plan: (authUser.package as PlanId) || "free",
        auditsUsed: 0, // In production, this would be fetched from DB
    };

    return <DashboardShell user={dashboardUser} />;
}
