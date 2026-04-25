import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import type { User, UserRole } from "@/types";

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

    let planName = "The Reality Check";
    let monthlyAudits = 18;
    let planId = (authUser.package as string) || "";

    if (planId) {
        const dbPlan = await prisma.plan.findUnique({ where: { id: planId } });
        if (dbPlan) {
            planName = dbPlan.name;
            monthlyAudits = dbPlan.monthlyAudits;
        }
    }

    // Transform Better Auth user to match Dashboard UI expectations
    const dashboardUser: User = {
        name: authUser.name || `${authUser.firstName} ${authUser.lastName}`,
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email,
        role: (authUser.isAdmin ? "admin" : "user") as UserRole,
        planId,
        planName,
        monthlyAudits,
        auditsUsed: 0, // In production, this would be fetched from DB
    };

    return <DashboardShell user={dashboardUser} />;
}
