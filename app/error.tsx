// app/error.tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Something went wrong</h2>
        <p className="text-[var(--text-muted)] mb-8">
          The roast was too hot! We encountered an unexpected error.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-[var(--pr-accent)] hover:bg-[var(--pr-accent-hover)] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-3 rounded-lg font-medium hover:bg-zinc-900 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
