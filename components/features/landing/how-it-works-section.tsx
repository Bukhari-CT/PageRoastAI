import { Link, ScanSearch, Code2 } from "lucide-react";

const STEPS = [
  { num: "01", icon: Link, title: "Paste Your URL", desc: "Drop in any landing page URL. We render it exactly as your visitors see it." },
  { num: "02", icon: ScanSearch, title: "AI Runs the Audit", desc: "Our model checks 40+ UX signals — hierarchy, CTA placement, copy clarity, and mobile layout." },
  { num: "03", icon: Code2, title: "Get Copy-Paste Fixes", desc: "Every issue comes with an exact React + Tailwind snippet. No guessing, no tickets." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24 bg-muted/20 border-y border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-2">
            <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest">The Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight italic">From URL to fixes in 60 seconds.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Stop guessing what's wrong. Let AI handle the heavy lifting while you copy-paste the wins.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-border/50 hidden md:block -translate-y-1/2 z-0" />
          {STEPS.map((step, i) => (
            <div key={i} className="group bg-card border border-border rounded-[2rem] p-8 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 relative z-10 flex flex-col items-center text-center">
              <div className="mb-8 relative flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-500">
                  <step.icon size={28} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="absolute -top-2 -right-2 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full bg-indigo-500/5 border border-indigo-500/10">{step.num}</div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{step.title}</h3>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
