import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { usePreferences } from '../context/PreferencesContext.jsx';
import DisabledMenu from './DisabledMenu.jsx';

const navigationSections = [
  {
    title: 'Studio',
    items: [
      { name: 'Dashboard', description: 'Growth metrics & insights', icon: '📊', to: '/dashboard' },
      { name: 'Inspiration', description: 'Collect competitor ads', icon: '🗂️', to: '/download' },
      { name: 'Script Polish', description: 'Refine transcripts into copy', icon: '✏️', to: '/transcribe' },
      { name: 'Voice Studio', description: 'Generate AI voiceovers', icon: '🎧', to: '/tts' },
    ]
  },
  {
    title: 'Automate',
    items: [
      { name: 'Workflows', description: 'Visual automation builder', icon: '⚡', to: '/workflows' },
      { name: 'Workspace', description: 'Saved drafts & exports', icon: '📦', to: '/workspace' },
    ]
  },
  {
    title: 'Account',
    items: [
      { name: 'Knowledge', description: 'AI context & prompts', icon: '📚', to: '/knowledge' },
      { name: 'Settings', description: 'Profile & preferences', icon: '⚙️', to: '/settings' },
      { name: 'Upgrade', description: 'Pricing & billing', icon: '🚀', to: '/pricing', highlight: true },
    ]
  }
];

const futureFeatures = [
  { name: 'Growth Pulse', description: 'Workflow nudges & launch analytics tuned by live performance data.', icon: '📈' },
  { name: 'Competitor Library', description: 'Deep pulls from Facebook Ad Library with angle tagging.', icon: '📊' },
  { name: 'Full Project Mode', description: 'Idea → script → audio → video in guided sprint.', icon: '🚀' },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { preferences } = usePreferences();
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
          <span className={[
            "flex h-9 w-9 items-center justify-center rounded-xl border text-lg",
            isDark
              ? "border-white/20 bg-white/10"
              : "border-slate-300/50 bg-slate-100/80"
          ].join(' ')}>
            {isDark ? '🌤️' : '🌙'}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold theme-text-primary">
              {isDark ? 'Activate Light Mode' : 'Return to Midnight Mode'}
            </p>
            {preferences.interface.showDescriptions && (
              <p className="text-xs theme-text-muted tracking-wide">
                {isDark ? 'Infuse the glass with aurora hues.' : 'Slide back into the midnight studio.'}
              </p>
            )}
          </div>
          <span className="text-xs uppercase tracking-[0.2em] theme-text-muted">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>

      <nav className="flex-1 space-y-4">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <div className="px-4">
              <h3 className="text-xs uppercase tracking-[0.3em] theme-text-muted font-semibold">
                {section.title}
              </h3>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'liquid-interactive group flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200',
                      item.highlight
                        ? isDark
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-200 hover:ring-purple-300/50'
                          : 'bg-gradient-to-r from-purple-100/80 to-pink-100/80 border-purple-300/40 text-purple-700 hover:ring-purple-300/60'
                        : isDark ? 'hover:ring-pink-400/50 text-white/75 hover:text-white' : 'hover:ring-sky-400/60 text-slate-600 hover:text-slate-900',
                      isActive && !item.highlight
                        ? isDark
                          ? 'active-nav-item ring-2 bg-white/10 text-white'
                          : 'active-nav-item ring-2 ring-sky-400/60 bg-sky-50/90 text-slate-900'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                  title={item.description}
                >
                  <span className="text-base">{item.icon}</span>
                  <div className="flex-1">
                    <span className="block">{item.name}</span>
                    {preferences.interface.showDescriptions && (
                      <span className={`text-xs ${isDark ? 'text-white/40' : 'text-slate-500'} group-hover:text-current transition-colors`}>
                        {item.description}
                      </span>
                    )}
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] theme-text-muted px-4">Coming Soon</p>
        <div className="space-y-1">
          {futureFeatures.map((feature) => (
            <DisabledMenu
              key={feature.name}
              icon={feature.icon}
              name={feature.name}
              description={feature.description}
            />
          ))}
        </div>
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
