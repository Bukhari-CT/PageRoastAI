import type { AppView } from "@/types";
import { LANDING_PRICING_PLANS } from "@/constants";

interface PricingSectionProps {
  onNavigate: (view: AppView) => void;
}

export function PricingSection({ onNavigate }: PricingSectionProps) {
  return (
    <section id="pricing" className="px-6 py-20 bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Simple Pricing</h2>
          <p className="text-[var(--text-muted)]">No subscription traps. Pay once, get lifetime access.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANDING_PRICING_PLANS.map((plan, i) => (
            <div
              key={i}
              className={`bg-[var(--bg-surface)] border rounded-xl p-6 flex flex-col ${
                plan.recommended ? "border-indigo-500/50" : "border-[var(--border-color)]"
              }`}
            >
              {plan.recommended && (
                <div className="px-4 py-2 font-bold text-white text-xs text-center rounded mb-4 bg-indigo-600">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-6">
                <p className="text-[var(--text-muted)] text-xs font-mono uppercase mb-2">{plan.name}</p>
                <p className="text-4xl font-bold text-[var(--text-primary)]">{plan.price}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <span>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate("signup")}
                className={`w-full py-2 font-semibold text-sm rounded-lg transition-colors cursor-pointer ${
                  plan.buttonStyle === "primary"
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 border-none"
                    : "border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-zinc-900/50"
                }`}
              >
                {plan.buttonLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
