import Link from "next/link";
import type { AuditRow } from "@/types";
import { formatReportDate, getScoreColorClass } from "@/lib/formatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditTableProps {
  rows: AuditRow[];
}

export function AuditTable({ rows }: AuditTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-transparent p-12 text-center">
        <p className="text-foreground font-semibold">No audits yet</p>
        <p className="text-muted-foreground text-sm mt-1">
          Your audit history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">URL</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Score</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Issues</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Date</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground max-w-[280px] truncate">{row.url}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${getScoreColorClass(row.score)}`}>
                    {row.score}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.issues} {row.issues === 1 ? "issue" : "issues"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatReportDate(row.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/report/${row.id}`}
                    className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 text-sm font-medium"
                  >
                    View Report
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
