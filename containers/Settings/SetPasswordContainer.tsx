"use client";

import { useSetPassword } from "@/hooks/useSetPassword";
import { SetPasswordForm } from "@/components/Settings/SetPasswordForm";

export function SetPasswordContainer() {
  const { form, setForm, isSubmitting, error, success, submit } = useSetPassword();

  return (
    <SetPasswordForm
      form={form}
      onFormChange={setForm}
      onSubmit={submit}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
    />
  );
}
