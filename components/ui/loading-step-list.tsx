import { LOADING_STEPS } from "@/constants";

interface LoadingStepListProps {
  activeStep: number;
  completedSteps: number[];
}

export function LoadingStepList({ activeStep, completedSteps }: LoadingStepListProps) {
  return (
    <ul className="space-y-4">
      {LOADING_STEPS.map((step, i) => {
        const isDone = completedSteps.includes(i);
        const isActive = activeStep === i && !isDone;
        return (
          <li key={i} className="flex items-center gap-3">
            <span
              className="w-5 text-center font-bold text-sm flex-shrink-0"
              style={{ color: isDone || isActive ? "#6366F1" : "#71717A" }}
            >
              {isDone ? "✓" : isActive ? "◆" : "◇"}
            </span>
            <span
              className="text-sm"
              style={{
                color: isDone ? "#71717A" : isActive ? "var(--text-primary)" : "#71717A",
                textDecoration: isDone ? "line-through" : "none",
              }}
            >
              {step}
              {isActive && <span className="animate-pulse ml-1">...</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
