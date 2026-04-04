"use server";

import { z } from "zod";
import { loginSchema } from "@/lib/validators";

export async function loginAction(formData: any) {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    return { data: null, error: "Validation failed" };
  }

  // Mock login logic
  const isAdmin = result.data.email.startsWith("admin");
  const mockUser = {
    name: isAdmin ? "Admin User" : "Alex Kim",
    email: result.data.email,
    role: isAdmin ? "admin" : "user",
    plan: isAdmin ? "agency" : "free",
    auditsUsed: isAdmin ? 0 : 2,
  };

  return { data: mockUser, error: null };
}
