import { Fragment, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFeatureFlags } from '../context/FeatureFlagContext.jsx';
import { useNavigate } from 'react-router-dom';
import { trackUsage } from '../lib/telemetry.js';

const COMMANDS = [
  { id: 'go-dashboard', label: 'Go to Dashboard', action: 'navigate', payload: '/dashboard' },
  { id: 'go-workflows', label: 'Open Workflow Automator', action: 'navigate', payload: '/workflows' },
  { id: 'go-workspace', label: 'Open Workspace Library', action: 'navigate', payload: '/workspace' },
  { id: 'run-workflow', label: 'Run current workflow', action: 'event', payload: 'workflow.run' },
];

export default function GlobalCommandPalette({ onCommand }) {
  const { flags } = useFeatureFlags();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!flags.globalSearch) return;
    const handleKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flags.globalSearch]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return COMMANDS.filter((command) => command.label.toLowerCase().includes(lower));
  }, [query]);

  if (!flags.globalSearch || !open) {
    return null;
  }

  const handleSelect = (command) => {
    setOpen(false);
    trackUsage('command_palette_used', { id: command.id });
    if (command.action === 'navigate') {
      navigate(command.payload);
    } else if (command.action === 'event') {
      onCommand?.(command.payload);
      window.dispatchEvent(new CustomEvent('command:trigger', { detail: command.payload }));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/50 backdrop-blur-xl">
      <div className="mt-24 w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_65px_rgba(15,23,42,0.65)]">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search destinations and commands"
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
        />
        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-white/60">No matches. Try different keywords.</p>
          ) : (
            filtered.map((command) => (
              <button
                key={command.id}
                type="button"
                onClick={() => handleSelect(command)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/10"
              >
                <span>{command.label}</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Enter</span>
              </button>
            ))
          )}
        </div>
        <div className="mt-6 text-xs uppercase tracking-[0.3em] text-white/40">Press Esc to close · Cmd/Ctrl + K</div>
      </div>
    </div>,
    document.body
  );
}
