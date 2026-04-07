"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/login-form";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  
  return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
