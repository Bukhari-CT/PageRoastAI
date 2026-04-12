"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/login-form";
import { sanitizeCallbackUrl } from "@/lib/utils";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  
  return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
