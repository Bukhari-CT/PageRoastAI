import Link from "next/link";
import { ReportView } from "@/components/features/report/report-view";
import { getReport } from "@services/ReportStore";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const report = getReport(id);

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Report not found</h1>
        <p className="text-muted-foreground max-w-md">
          This report doesn&apos;t exist or the server has restarted since it was generated — reports aren&apos;t
          saved permanently yet. Run a new audit to get a fresh one.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 py-3 font-semibold text-sm transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <ReportView report={report} />;
}
