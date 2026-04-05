import { SCORE_RING_RADIUS, SCORE_RING_CIRCUMFERENCE } from "@/constants";
import { getScoreOffset } from "@/lib/formatting";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, label = "Conversion Score" }: ScoreRingProps) {
  const offset = getScoreOffset(score, SCORE_RING_CIRCUMFERENCE);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={SCORE_RING_RADIUS}
          fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth}
        />
        <circle
          cx="60" cy="60" r={SCORE_RING_RADIUS}
          fill="none" stroke="#6366F1" strokeWidth={strokeWidth}
          strokeDasharray={SCORE_RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text
          x="60" y="60" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: "32px", fontWeight: "bold", fill: "var(--text-primary)", fontFamily: "monospace" }}
        >
          {score}
        </text>
      </svg>
      <div className="text-center">
        <p className="text-xs text-zinc-500">/100</p>
        <p className="text-sm text-zinc-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
