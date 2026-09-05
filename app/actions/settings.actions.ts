"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { accountService } from "@diContainer/Resolver";
import { SetPasswordDto } from "@application/Account/AccountDto";

export async function setPasswordAction(password: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return { error: "Not authenticated" };
    }

    const { user } = session;

    const result = await accountService.setPassword(
      SetPasswordDto.create({ userId: user.id, email: user.email, password })
    );

    if (result.statusCode >= 400) {
      const body = result.body as { message?: string };
      return { error: body.message ?? "An unexpected error occurred while setting your password." };
    }

    return { error: null };
  } catch (error: any) {
    console.error("Error setting password:", error);
    return { error: "An unexpected error occurred while setting your password." };
  }
}
