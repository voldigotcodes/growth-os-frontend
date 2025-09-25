import { useEffect, useState } from 'react';
import { useFeatureFlags } from '../context/FeatureFlagContext.jsx';

const DEFAULT_SHORTCUTS = [
  { combo: '⌘/Ctrl + K', description: 'Open command palette' },
  { combo: '⌘/Ctrl + S', description: 'Save workflow' },
  { combo: '⌘/Ctrl + Enter', description: 'Run workflow' },
];

export default function ShortcutHints({ shortcuts = DEFAULT_SHORTCUTS }) {
  const { flags } = useFeatureFlags();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!flags.progressiveDisclosure) return;
    const timeout = window.setTimeout(() => setVisible(true), 2500);
    return () => window.clearTimeout(timeout);
  }, [flags.progressiveDisclosure]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 rounded-3xl border border-white/15 bg-slate-950/70 px-4 py-3 text-xs text-white/70 shadow-[0_12px_35px_rgba(15,23,42,0.5)]">
      {shortcuts.map((shortcut) => (
        <div key={shortcut.combo} className="flex items-center gap-3">
          <span className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 font-mono text-[11px] text-white/85">
            {shortcut.combo}
          </span>
          <span>{shortcut.description}</span>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="self-end text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-white"
      >
        Hide
      </button>
    </div>
  );
}
