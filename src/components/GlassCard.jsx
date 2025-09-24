import { useTheme } from '../context/ThemeContext.jsx';

const darkGlow =
  "before:absolute before:-inset-x-10 before:-top-36 before:h-64 before:rounded-full before:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_60%)] before:blur-3xl before:content-[''] before:opacity-0 hover:before:opacity-100";

const lightGlow =
  "before:absolute before:-inset-x-10 before:-top-32 before:h-64 before:rounded-full before:bg-[radial-gradient(circle_at_top,_rgba(110,231,183,0.4),_rgba(56,189,248,0.35)_40%,_rgba(244,114,182,0.3)_70%,_transparent)] before:blur-3xl before:content-[''] before:opacity-0 hover:before:opacity-100";

export default function GlassCard({
  title,
  subtitle,
  actions,
  className = '',
  children,
  allowOverflow = false,
  interactive = true,
  liquid = true,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerClass = [
    'relative rounded-3xl glass-panel p-8 transition-all duration-300',
    allowOverflow ? 'overflow-visible' : 'overflow-hidden',
    interactive ? '' : 'glass-static',
    liquid ? 'liquid' : '',
    isDark ? 'shadow-soft hover:border-white/25' : 'shadow-[0_35px_65px_rgba(148,163,184,0.25)] hover:border-sky-300/70',
    isDark ? darkGlow : lightGlow,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={containerClass}>
      {(title || actions) && (
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-xl font-semibold theme-text-primary">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm theme-text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>
      )}
      <div className={['relative z-10 space-y-6', isDark ? 'text-white/80' : 'text-slate-600'].join(' ')}>
        {children}
      </div>
    </section>
  );
}
