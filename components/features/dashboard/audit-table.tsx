import type { AuditRow } from "@/types";
import { getScoreColorClass } from "@/lib/formatting";

interface AuditTableProps {
  rows: AuditRow[];
  onViewReport?: (row: AuditRow) => void;
  columns?: number;
}

export function AuditTable({ rows, onViewReport, columns = 6 }: AuditTableProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
      <div className={`bg-zinc-900/50 px-4 py-3 grid grid-cols-${columns} gap-4 text-zinc-500 text-xs font-semibold uppercase tracking-wide border-b border-zinc-800/50`}>
        <span>URL</span>
        <span>Score</span>
        <span>Issues</span>
        <span>Status</span>
        <span>Date</span>
        <span>Action</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className={`px-4 py-3 grid grid-cols-${columns} gap-4 text-sm border-b border-zinc-800/50 last:border-0`}>
          <span className="text-[var(--text-primary)]">{row.url}</span>
          <span className={`px-2 py-1 rounded text-xs font-mono font-semibold w-fit ${getScoreColorClass(row.score)}`}>
            {row.score}
          </span>
          <span className="text-[var(--text-muted)]">{row.issues} issues</span>
          <span className="text-[var(--text-muted)]">Completed</span>
          <span className="text-[var(--text-muted)] text-xs">{row.date}</span>
          <button
            onClick={() => onViewReport?.(row)}
            className="text-indigo-400 text-xs hover:underline cursor-pointer"
          >
            View Report
          </button>
        </div>
      ))}
    </div>
  );
}
