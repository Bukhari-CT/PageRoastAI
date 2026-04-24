"use server";

import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.isAdmin) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function getPlansAction() {
  try {
    await checkAdmin();
    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    });
    return { data: plans, error: null };
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return { data: null, error: error.message || "Failed to fetch plans" };
  }
}

export async function getActivePlansAction() {
  try {
    const plans = await prisma.plan.findMany({
      where: { enabled: true },
      orderBy: { price: "asc" },
    });
    return { data: plans, error: null };
  } catch (error: any) {
    console.error("Error fetching active plans:", error);
    return { data: null, error: "Failed to fetch active plans" };
  }
}

export async function createPlanAction(data: { name: string; price: string; features: string[]; enabled?: boolean; monthlyAudits?: number }) {
  try {
    await checkAdmin();
    
    const willBeEnabled = data.enabled ?? true;
    
    if (willBeEnabled) {
      const activeCount = await prisma.plan.count({ where: { enabled: true } });
      if (activeCount >= 3) {
        return { data: null, error: "Cannot enable plan. Maximum of 3 plans can be active at one time." };
      }
    }

    const newPlan = await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        features: data.features,
        enabled: willBeEnabled,
        monthlyAudits: data.monthlyAudits ?? 0,
      },
    });

    return { data: newPlan, error: null };
  } catch (error: any) {
    console.error("Error creating plan:", error);
    return { data: null, error: "Failed to create plan" };
  }
}

export async function updatePlanAction(id: string, data: { name: string; price: string; features: string[]; enabled?: boolean; monthlyAudits?: number }) {
  try {
    await checkAdmin();

    if (data.enabled === true) {
      // Check if it's currently disabled and we are enabling it
      const currentPlan = await prisma.plan.findUnique({ where: { id } });
      if (currentPlan && !currentPlan.enabled) {
        const activeCount = await prisma.plan.count({ where: { enabled: true } });
        if (activeCount >= 3) {
          return { data: null, error: "Cannot enable plan. Maximum of 3 plans can be active at one time." };
        }
      }
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        features: data.features,
        ...(data.enabled !== undefined && { enabled: data.enabled }),
        ...(data.monthlyAudits !== undefined && { monthlyAudits: data.monthlyAudits }),
      },
    });
    return { data: updated, error: null };
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return { data: null, error: "Failed to update plan" };
  }
}

export async function togglePlanAction(id: string, enabled: boolean) {
  try {
    await checkAdmin();
    
    if (enabled) {
      const activeCount = await prisma.plan.count({ where: { enabled: true } });
      if (activeCount >= 3) {
        return { data: null, error: "Cannot enable plan. Maximum of 3 plans can be active at one time." };
      }
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: { enabled },
    });
    
    return { data: updated, error: null };
  } catch (error: any) {
    console.error("Error toggling plan:", error);
    return { data: null, error: "Failed to toggle plan" };
  }
}
