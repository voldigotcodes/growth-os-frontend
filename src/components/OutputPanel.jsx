import GlassCard from './GlassCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const tabs = [
  { id: 'transcript', label: 'Transcript' },
  { id: 'modified', label: 'Modified Text' },
  { id: 'audio', label: 'Audio Preview' },
];

function renderContent(tab, isDark) {
  switch (tab) {
    case 'modified':
      return (
        <div className="space-y-3 text-sm">
          <div
            className={[
              'rounded-2xl border p-4 backdrop-blur-xl transition-colors duration-300',
              isDark
                ? 'border-white/5 bg-white/5 text-white/80'
                : 'border-slate-200/70 bg-white/80 text-slate-600 shadow-[0_15px_40px_rgba(148,163,184,0.2)]',
            ].join(' ')}
          >
            <p className="text-xs uppercase tracking-[0.3em] theme-text-muted">Hook Builder</p>
            <p className="mt-2 theme-text-secondary">
              Rewrote intro for TikTok pacing, added urgency, and front-loaded the hero benefit.
            </p>
          </div>
          <div
            className={[
              'rounded-2xl border p-4 backdrop-blur-xl transition-colors duration-300',
              isDark
                ? 'border-white/5 bg-white/5 text-white/80'
                : 'border-slate-200/70 bg-white/80 text-slate-600 shadow-[0_15px_40px_rgba(148,163,184,0.2)]',
            ].join(' ')}
          >
            <p className="text-xs uppercase tracking-[0.3em] theme-text-muted">Proof Points</p>
            <p className="mt-2 theme-text-secondary">
              Highlighted before/after results, added timeline, and reinforced the guarantee.
            </p>
          </div>
        </div>
      );
    case 'audio':
      return (
        <div
          className={[
            'flex items-center gap-4 rounded-2xl border p-5 backdrop-blur-xl transition-colors duration-300',
            isDark
              ? 'border-white/10 bg-slate-900/40 text-white'
              : 'border-slate-200/70 bg-white/80 text-slate-700 shadow-[0_20px_45px_rgba(148,163,184,0.25)]',
          ].join(' ')}
        >
          <div
            className={[
              'flex h-12 w-12 items-center justify-center rounded-2xl border text-lg',
              isDark ? 'border-white/10 bg-white/10 text-white' : 'border-slate-200/80 bg-white/80 text-slate-700',
            ].join(' ')}
          >
            🔊
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium theme-text-primary">Growth OS Voice Render</p>
            <div
              className={[
                'mt-2 flex items-center gap-3 text-xs transition-colors duration-300',
                isDark ? 'text-white/40' : 'text-slate-400',
              ].join(' ')}
            >
              <div
                className={[
                  'h-1.5 flex-1 overflow-hidden rounded-full',
                  isDark ? 'bg-white/10' : 'bg-slate-200/70',
                ].join(' ')}
              >
                <div
                  className={[
                    'h-full w-1/2 rounded-full',
                    isDark ? 'bg-white/40' : 'bg-gradient-to-r from-emerald-300 via-sky-300 to-pink-300',
                  ].join(' ')}
                ></div>
              </div>
              <span>00:58</span>
            </div>
          </div>
          <button
            type="button"
            className={[
              'liquid-button px-4 py-1 text-xs',
              isDark
                ? 'border-white/15 text-white/70 hover:text-white hover:ring-emerald-300/45'
                : 'border-slate-200/70 text-slate-600 hover:text-slate-900 hover:ring-emerald-200/60',
            ].join(' ')}
          >
            Download Voice Track
          </button>
        </div>
      );
    case 'transcript':
    default:
      return (
        <div className={['space-y-4 text-sm leading-relaxed', isDark ? 'text-white/70' : 'text-slate-600'].join(' ')}>
          <p>
            [00:00] Hook: “I stopped scrolling when I saw what this serum did in three days.”
          </p>
          <p>
            [00:09] Benefit: “Watch how the redness fades while I walk you through the routine.”
          </p>
          <p>
            [00:18] CTA: “Tap the link, grab the launch bundle, and start your 30-day glow challenge.”
          </p>
        </div>
      );
  }
}

export default function OutputPanel({ activeTab = 'transcript', className = '' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const normalized = tabs.some((tab) => tab.id === activeTab.toLowerCase())
    ? activeTab.toLowerCase()
    : 'transcript';

  return (
    <GlassCard title="Output Panel" subtitle="Preview every asset before handoff." className={className}>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === normalized;
          return (
            <button
              key={tab.id}
              type="button"
              className={[
                'liquid-button px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] disabled:cursor-default',
                isDark ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900',
                isActive
                  ? isDark
                    ? 'ring-2 ring-cyan-300/45 bg-white/15 text-white hover:ring-cyan-300/55'
                    : 'ring-2 ring-sky-300/50 bg-white/90 text-slate-900 hover:ring-sky-300/60'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">{renderContent(normalized, isDark)}</div>
    </GlassCard>
  );
}
