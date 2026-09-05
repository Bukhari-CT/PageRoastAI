import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { ReportView } from "@/components/features/report/report-view";
import { getReportForViewer } from "@services/ReportStore";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Reports are private to their owner.
 *
 * A missing report, a report owned by someone else, and a legacy anonymous
 * report all render the identical "not found" page, so the response never
 * reveals that a given report id exists.
 */
export default async function ReportPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const viewer = session?.user as { id?: string; isAdmin?: boolean } | undefined;

  const report = viewer?.id
    ? await getReportForViewer(id, { id: viewer.id, isAdmin: viewer.isAdmin })
    : null;

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Report not found</h1>
        <p className="text-muted-foreground max-w-md">
          This report doesn&apos;t exist, or it isn&apos;t available on your account. Run a new
          audit to get a fresh one.
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
