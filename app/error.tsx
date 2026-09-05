// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-foreground mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-8">
          The roast was too hot! We encountered an unexpected error.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
