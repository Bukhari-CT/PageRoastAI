"use client";

import { useSearchParams } from "next/navigation";
import { CheckoutPage as CheckoutComponent } from "@/components/features/checkout/checkout-page";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId") || "demo-report";

  return <CheckoutComponent reportId={reportId} />;
}
