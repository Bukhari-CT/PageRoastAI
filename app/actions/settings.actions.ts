"use server";

import { headers } from "next/headers";

import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function setPasswordAction(password: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Not authenticated" };
    }

    const { user } = session;

    // Check if the user already has a credential account
    const existingCredential = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    if (existingCredential) {
      if (existingCredential.password) {
        return { error: "Account already has a password set. Use change password instead." };
      } else {
         // Rare case: credential exists without password, update it
         const hashedPassword = await bcrypt.hash(password, 10);
         await prisma.account.update({
           where: { id: existingCredential.id },
           data: { password: hashedPassword },
         });
         return { error: null };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.email,
        providerId: "credential",
        password: hashedPassword,
      },
    });

    return { error: null };
  } catch (error: any) {
    console.error("Error setting password:", error);
    return { error: "An unexpected error occurred while setting your password." };
  }
}
