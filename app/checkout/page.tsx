import { CheckoutPage as CheckoutComponent } from "@/components/features/checkout/checkout-page";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutPage(props: Props) {
  const searchParams = await props.searchParams;
  const reportId = (searchParams?.reportId as string) || "demo-report";

  return <CheckoutComponent reportId={reportId} />;
}
