import type { AppView } from "@/types";
import { LANDING_PRICING_PLANS } from "@/constants";

interface PricingSectionProps {
  onNavigate: (view: AppView) => void;
}

export function PricingSection({ onNavigate }: PricingSectionProps) {
  return (
    <section id="pricing" className="px-6 py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">Simple Pricing</h2>
          <p className="text-muted-foreground text-lg">No subscription traps. Pay once, get lifetime access.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANDING_PRICING_PLANS.map((plan, i) => (
            <div
              key={i}
              className={`bg-card border rounded-2xl p-8 flex flex-col transition-all hover:shadow-lg ${
                plan.recommended ? "border-indigo-500 shadow-indigo-500/10" : "border-border"
              }`}
            >
              {plan.recommended && (
                <div className="inline-block px-3 py-1 font-bold text-white text-[10px] tracking-wider text-center rounded-full mb-6 bg-indigo-600 w-fit mx-auto">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-8">
                <p className="text-muted-foreground text-xs font-mono uppercase mb-2 tracking-widest">{plan.name}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-bold text-foreground">{plan.price}</p>
                  {plan.price !== "$0" && <span className="text-muted-foreground text-sm">/one-time</span>}
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground group">
                    <span className="text-indigo-500 mt-0.5 group-hover:scale-110 transition-transform">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate("signup")}
                className={`w-full py-3 font-semibold text-sm rounded-xl transition-all cursor-pointer ${
                  plan.buttonStyle === "primary"
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/20"
                    : "border border-border text-foreground hover:bg-secondary"
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
