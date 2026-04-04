"use server";

import { z } from "zod";
import { loginSchema } from "@/lib/validators";

export async function loginAction(formData: any) {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    return { data: null, error: "Validation failed" };
  }

  // Mock login logic
  const mockUser = {
    name: "Alex Kim",
    email: result.data.email,
    role: "user",
    plan: "free",
    auditsUsed: 2,
  };

  return { data: mockUser, error: null };
}
