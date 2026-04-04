import type { AuditRow } from "@/types";
import { getScoreColorClass } from "@/lib/formatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface AuditTableProps {
  rows: AuditRow[];
  onViewReport?: (row: AuditRow) => void;
}

export function AuditTable({ rows, onViewReport }: AuditTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">URL</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Score</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Issues</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">Date</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} className="border-border hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium text-foreground max-w-[200px] truncate">{row.url}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${getScoreColorClass(row.score)}`}>
                  {row.score}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{row.issues} issues</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span className="text-muted-foreground text-xs">Completed</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{row.date}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onViewReport?.(row)}
                  className="text-indigo-400 h-auto p-0 hover:text-indigo-300"
                >
                  View Report
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
