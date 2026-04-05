import { ReportView } from "@/components/features/report/report-view";

export default function ReportPage({ params }: { params: { id: string } }) {
  return <ReportView reportId={params.id} />;
}
