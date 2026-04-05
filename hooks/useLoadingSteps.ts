"use client";

import { useState, useEffect, useRef } from "react";
import { LOADING_STEPS, LOADING_STEP_INTERVAL_MS, LOADING_FINISH_DELAY_MS } from "@/constants";

export function useLoadingSteps(isActive: boolean) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setActiveStep(0);
      setCompletedSteps([]);
      setIsFinished(false);
      return;
    }

    let current = 0;
    intervalRef.current = setInterval(() => {
      setCompletedSteps((prev) => [...prev, current]);
      current += 1;
      if (current < LOADING_STEPS.length) {
        setActiveStep(current);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, LOADING_STEP_INTERVAL_MS);

    const timer = setTimeout(() => {
      setIsFinished(true);
    }, LOADING_STEP_INTERVAL_MS * LOADING_STEPS.length + LOADING_FINISH_DELAY_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(timer);
    };
  }, [isActive]);

  return { activeStep, completedSteps, isFinished, steps: LOADING_STEPS };
}
