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

export async function getAdminUsersAction() {
  try {
    const currentUser = await checkAdmin();
    
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id }
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        package: true,
        createdAt: true,
        lockedUntil: true,
      }
    });

    return { data: users, error: null };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return { data: null, error: error.message || "Failed to fetch users" };
  }
}

export async function toggleUserBlockAction(userId: string, block: boolean) {
  try {
    const currentUser = await checkAdmin();
    
    if (userId === currentUser.id) {
      return { data: null, error: "Cannot change block status of your own admin account" };
    }
    
    // Set lockedUntil to a date far in the future to block, or null to unblock
    // Also reset failedPasswordAttempts on unblock to ensure smooth sign-in
    const updateData = block 
      ? { lockedUntil: new Date("2099-12-31T23:59:59Z") }
      : { lockedUntil: null, failedPasswordAttempts: 0 };
    
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { data: { success: true }, error: null };
  } catch (error: any) {
    console.error("Error toggling user block status:", error);
    return { data: null, error: "Failed to update user block status" };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const currentUser = await checkAdmin();
    
    if (userId === currentUser.id) {
      return { data: null, error: "Cannot delete your own admin account" };
    }
    
    await prisma.user.delete({
      where: { id: userId },
    });

    return { data: { success: true }, error: null };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return { data: null, error: "Failed to delete user" };
  }
}
