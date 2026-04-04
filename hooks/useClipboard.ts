"use client";

import { useState, useCallback } from "react";
import { COPY_FEEDBACK_DURATION_MS } from "@/constants";

export function useClipboard(duration = COPY_FEEDBACK_DURATION_MS) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), duration);
    },
    [duration]
  );

  return { copied, copy };
}
