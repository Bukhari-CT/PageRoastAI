import { CheckoutPage as CheckoutComponent } from "@/components/features/checkout/checkout-page";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutPage(props: Props) {
  const searchParams = await props.searchParams;
  const reportIdParam = searchParams?.reportId;
  const reportId = Array.isArray(reportIdParam) ? reportIdParam[0] : (reportIdParam || "demo-report");

  return <CheckoutComponent reportId={reportId} />;
}
