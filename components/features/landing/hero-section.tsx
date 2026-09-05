"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidUrl } from "@/lib/utils";

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
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 pt-32 pb-20 gap-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10">
        <span className="text-indigo-400 text-xs font-medium">✦ AI-Powered UX Audits</span>
      </div>

      <h1 className="text-5xl font-bold leading-tight max-w-3xl text-center text-foreground">
        Your landing page is costing you customers.
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl text-center">
        Paste your URL and get a brutally honest AI audit — with the exact code to fix every issue.
      </p>

      <div className="w-full max-w-lg">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="url"
            value={auditUrl}
            onChange={(e) => { onUrlChange(e.target.value); onUrlErrorChange(""); }}
            placeholder="https://your-landing-page.com"
            className={`flex-1 h-12 text-base ${urlError ? "border-destructive ring-destructive" : ""}`}
          />
          <Button
            onClick={() => handleValidateAndRoast(auditUrl, onUrlErrorChange, onRoast)}
            size="lg"
            className="h-12 px-8 font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-[0_0_24px_rgba(79,70,229,0.4)]"
          >
            Roast My Page →
          </Button>
        </div>
        {urlError && (
          <p className="text-destructive text-xs mt-1 flex items-center gap-1">
            <span>⚠</span> {urlError}
          </p>
        )}
      </div>
    </section>
  );
}
