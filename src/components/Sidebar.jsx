import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import DisabledMenu from './DisabledMenu.jsx';

const navigation = [
  { name: 'Inspiration Vault', description: 'Collect and tag competitor ads', icon: '🗂️', to: '/download' },
  { name: 'Script Refinery', description: 'Polish transcripts into ad copy', icon: '✏️', to: '/transcribe' },
  { name: 'AI Voice Studio', description: 'Record natural ecommerce voiceovers', icon: '🎧', to: '/tts' },
  { name: 'Workspace Library', description: 'Grab saved drafts and exports', icon: '📦', to: '/workspace' },
  { name: 'General Knowledge', description: 'Edit the global context for prompts', icon: '📚', to: '/knowledge' },
];

const futureFeatures = [
  { name: 'Competitor Ad Library', description: 'Deep pulls from Facebook Ad Library with angle tagging.', icon: '📊' },
  { name: 'Story & Reel Downloader', description: 'One-click saves for TikTok and Instagram verticals.', icon: '🎞️' },
  { name: 'B-roll Finder', description: 'Curated stock footage to match your product shots.', icon: '🎬' },
  { name: 'Script Polisher', description: 'Advanced AI rewrite workflow with variants.', icon: '🪄' },
  { name: 'Multi-voice Sequencer', description: 'Layer multiple AI voices across one spot.', icon: '🎙️' },
  { name: 'Full Project Mode', description: 'Idea → script → audio → video in a guided sprint.', icon: '🚀' },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside
      className={[
        'relative flex h-screen w-72 flex-col gap-8 px-6 py-10 backdrop-blur-2xl transition-all duration-500 ease-out',
        isDark
          ? 'border-r border-white/10 bg-slate-900/40 text-slate-100'
          : 'border-r border-slate-200/70 bg-white/80 text-slate-700 shadow-[0_25px_55px_rgba(15,23,42,0.15)]',
      ].join(' ')}
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-current/10 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-current/70">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.45)]"></span>
          Growth OS Studio
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold theme-text-primary">Launch ads with Voldi&apos;s workflow</h1>
          <p className="text-sm leading-relaxed theme-text-muted">
            Move from swipe file to polished creative without bouncing between tools.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className={[
            'liquid-interactive flex items-center gap-3 px-4 py-3 text-left text-sm font-medium',
            isDark ? 'hover:ring-emerald-300/45' : 'hover:ring-emerald-400/45',
          ].join(' ')}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg">
            {isDark ? '🌤️' : '🌙'}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold theme-text-primary">
              {isDark ? 'Activate Light Mode' : 'Return to Midnight Mode'}
            </p>
            <p className="text-xs theme-text-muted tracking-wide">
              {isDark ? 'Infuse the glass with aurora hues.' : 'Slide back into the midnight studio.'}
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] theme-text-muted">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'liquid-interactive group flex items-center gap-3 px-4 py-3 text-sm font-medium',
                isDark ? 'hover:ring-pink-400/50 text-white/75 hover:text-white' : 'hover:ring-pink-400/50 text-slate-600 hover:text-slate-900',
                isActive
                  ? isDark
                    ? 'ring-2 ring-cyan-300/45 bg-white/10 text-white hover:ring-cyan-300/55'
                    : 'ring-2 ring-sky-400/50 bg-white/90 text-slate-900 hover:ring-sky-400/60'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
            title={item.description}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
            <span
              className={[
                'ml-auto text-xs opacity-0 transition-opacity duration-200',
                isDark ? 'text-white/40' : 'text-slate-400',
                'group-hover:opacity-100',
              ].join(' ')}
            >
              Explore
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] theme-text-muted">Coming Soon</p>
        <DisabledMenu
          icon="📈"
          name="Growth Pulse"
          description="Workflow nudges & launch analytics tuned by live performance data."
        />
        {futureFeatures.map((feature) => (
          <DisabledMenu
            key={feature.name}
            icon={feature.icon}
            name={feature.name}
            description={feature.description}
          />
        ))}
      </div>

      <div
        className={[
          'glass-panel p-4 transition-colors duration-300',
          isDark ? 'text-white/70' : 'text-slate-600',
        ].join(' ')}
      >
        <p className="text-xs uppercase tracking-[0.3em] theme-text-muted">Voldi&apos;s Tip</p>
        <p className="mt-2 text-sm theme-text-secondary">
          Tag every winning hook as soon as you import it—future you will thank you at launch time.
        </p>
      </div>
    </aside>
  );
}
