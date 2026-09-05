"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { setPassword } from "@/lib/settingsApi";

export interface SetPasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialForm: SetPasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function useSetPassword() {
  const [form, setForm] = useState<SetPasswordFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    let resultError: { message?: string } | null = null;

    if (form.currentPassword) {
      const res = await authClient.changePassword({
        newPassword: form.newPassword,
        currentPassword: form.currentPassword,
        revokeOtherSessions: false,
      });
      resultError = res.error;
    } else {
      const res = await setPassword(form.newPassword);
      resultError = res.error ? { message: res.error } : null;
    }

    setIsSubmitting(false);

    if (resultError) {
      setError(resultError.message || "Failed to update password");
      return;
    }

    setSuccess("Password updated successfully!");
    setForm(initialForm);
    setTimeout(() => setSuccess(""), 3000);
  }

  return { form, setForm, isSubmitting, error, success, submit };
}
