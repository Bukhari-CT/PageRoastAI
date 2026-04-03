import { Link, ScanSearch, Code2 } from "lucide-react";

const STEPS = [
  { num: "01", icon: Link, title: "Paste Your URL", desc: "Drop in any landing page URL. We render it exactly as your visitors see it." },
  { num: "02", icon: ScanSearch, title: "AI Runs the Audit", desc: "Our model checks 40+ UX signals — hierarchy, CTA placement, copy clarity, and mobile layout." },
  { num: "03", icon: Code2, title: "Get Copy-Paste Fixes", desc: "Every issue comes with an exact React + Tailwind snippet. No guessing, no tickets." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24 bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6">
            <span className="text-indigo-400 text-xs font-medium">Simple Process</span>
          </div>
          <h2 className="text-4xl font-bold text-[var(--text-primary)]">From URL to fixes in 60 seconds.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="absolute top-8 left-0 right-0 h-px border-t border-dashed border-zinc-700 hidden md:block" />
          {STEPS.map((step, i) => (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 hover:border-indigo-500/40 transition-colors relative z-10">
              <div className="mb-6">
                <step.icon size={28} className="mb-4 text-indigo-400" />
                <div className="text-xs font-mono text-indigo-400 font-bold mb-3">{step.num}</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{step.title}</h3>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
