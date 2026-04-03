"use client";

import { useState } from "react";
import { isValidUrl } from "@/lib/validators";

interface HeroSectionProps {
  onRoast: () => void;
  auditUrl: string;
  onUrlChange: (url: string) => void;
  urlError: string;
  onUrlErrorChange: (err: string) => void;
}

function handleValidateAndRoast(
  auditUrl: string,
  onUrlErrorChange: (err: string) => void,
  onRoast: () => void
) {
  const trimmed = auditUrl.trim();
  if (!trimmed) {
    onUrlErrorChange("Please enter a URL to audit.");
    return;
  }
  if (!isValidUrl(trimmed)) {
    onUrlErrorChange("Enter a valid URL (e.g. https://example.com)");
    return;
  }
  onUrlErrorChange("");
  onRoast();
}

export function HeroSection({ onRoast, auditUrl, onUrlChange, urlError, onUrlErrorChange }: HeroSectionProps) {
  const [focused, setFocused] = useState(false);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 py-20 gap-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10">
        <span className="text-indigo-400 text-xs font-medium">✦ AI-Powered UX Audits</span>
      </div>

      <h1 className="text-5xl font-bold leading-tight max-w-3xl text-center text-[var(--text-primary)]">
        Your landing page is costing you customers.
      </h1>

      <p className="text-lg text-[var(--text-muted)] max-w-xl text-center">
        Paste your URL and get a brutally honest AI audit — with the exact code to fix every issue.
      </p>

      <div className="w-full max-w-lg">
        <div className="flex gap-3">
          <input
            type="url"
            value={auditUrl}
            onChange={(e) => { onUrlChange(e.target.value); onUrlErrorChange(""); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="https://your-landing-page.com"
            className="flex-1 bg-[var(--input-bg)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-base outline-none transition-all"
            style={{
              border: `1px solid ${urlError ? "var(--danger)" : "var(--input-border)"}`,
              boxShadow: focused ? "0 0 0 2px var(--accent-glow)" : "none",
            }}
          />
          <button
            onClick={() => handleValidateAndRoast(auditUrl, onUrlErrorChange, onRoast)}
            className="px-6 py-3 font-semibold text-white text-base rounded-lg whitespace-nowrap transition-all cursor-pointer border-none"
            style={{
              background: "linear-gradient(to right, var(--pr-accent), #7c3aed)",
              boxShadow: "0 0 24px var(--accent-glow)",
            }}
          >
            Roast My Page →
          </button>
        </div>
        {urlError && (
          <p className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
            <span>⚠</span> {urlError}
          </p>
        )}
      </div>
    </section>
  );
}
