import { memo } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

const steps = [
  { title: 'Add a tool', description: 'Drag an automation tile from the palette.' },
  { title: 'Connect the ports', description: 'Match glowing badges with the same icon & type.' },
  { title: 'Save & run', description: 'Give it a name, hit run, and watch the glass glow.' },
];

function OnboardingOverlay() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-8 text-center">
      <div className={[
        "liquid-glass-onboard relative w-full max-w-md rounded-[28px] border p-8",
        isDark
          ? "border-white/15 bg-white/8 shadow-[0_40px_80px_rgba(15,23,42,0.4)]"
          : "border-slate-300/30 bg-white/90 shadow-[0_40px_80px_rgba(148,163,184,0.3)]"
      ].join(' ')}>
        <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-rose-400/40 via-sky-400/30 to-emerald-400/40 blur-3xl opacity-60" aria-hidden />
        <div className="relative z-10 space-y-6">
          <div className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[11px] uppercase tracking-[0.35em]",
            isDark
              ? "border-white/20 bg-white/10 text-white/70"
              : "border-slate-300/40 bg-slate-100/80 text-slate-600"
          ].join(' ')}>
            Workflow Automator
          </div>
          <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Build your first glass pipeline</h2>
          <ol className={`space-y-4 text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
            {steps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3 text-left">
                <span className={[
                  "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                  isDark
                    ? "border-white/20 bg-white/10 text-white/90"
                    : "border-slate-300/40 bg-slate-100/80 text-slate-700"
                ].join(' ')}>
                  {index + 1}
                </span>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{step.title}</p>
                  <p className={isDark ? 'text-white/75' : 'text-slate-600'}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={`text-xs uppercase tracking-[0.35em] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            Tip · Hold shift while dragging to snap nodes
          </p>
        </div>
      </div>
      <div className="h-18 w-18 pointer-events-none">
        <div className="liquid-orb" aria-hidden />
      </div>
    </div>
  );
}

export default memo(OnboardingOverlay);
