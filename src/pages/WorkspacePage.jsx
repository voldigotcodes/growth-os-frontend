import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { API_BASE, deleteWorkspaceEntry, fetchWorkspace, updateWorkspaceScript } from '../lib/apiClient.js';

const typeMetadata = {
  download: {
    label: 'Saved Downloads',
    detail: 'Clips, swipe files, and media assets ready to reuse.',
    icon: '📥',
  },
  voice: {
    label: 'Voice Tracks',
    detail: 'AI voice renders generated in the studio.',
    icon: '🎧',
  },
  script: {
    label: 'Script Drafts',
    detail: 'Polished scripts exported from the refinery.',
    icon: '📝',
  },
};

function formatDate(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
}

export default function WorkspacePage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editScriptText, setEditScriptText] = useState('');
  const [savingScriptId, setSavingScriptId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWorkspace();
        setItems(data.items ?? []);
      } catch (error) {
        addToast(error.message || 'Unable to load workspace items.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = useMemo(() => {
    const counts = {};
    for (const entry of items) {
      const key = entry.type || 'download';
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(typeMetadata).map(([key, meta]) => ({
      ...meta,
      count: counts[key] || 0,
    }));
  }, [items]);

  const editorInputClasses = [
    'min-h-[160px] w-full rounded-md border px-4 py-3 text-sm shadow-inner focus:outline-none focus:ring-2',
    isDark
      ? 'border-white/10 bg-slate-900/40 text-white/80 focus:border-white/30 focus:ring-white/20'
      : 'border-slate-200/70 bg-white/85 text-slate-700 focus:border-sky-300 focus:ring-sky-200',
  ].join(' ');

  const togglePreview = (entry) => {
    setExpandedId((prev) => {
      const next = prev === entry.id ? null : entry.id;
      if (prev === entry.id) {
        setEditingId(null);
        setEditScriptText('');
      }
      return next;
    });
  };

  const handleCopyScript = (content) => {
    if (!content) {
      addToast('No script text to copy.', 'error');
      return;
    }
    if (!navigator.clipboard) {
      addToast('Clipboard is not available in this environment.', 'error');
      return;
    }
    navigator.clipboard
      .writeText(content)
      .then(() => addToast('Script copied to clipboard.'))
      .catch(() => addToast('Unable to copy script.', 'error'));
  };

  const startEditingScript = (entry) => {
    if (savingScriptId === entry.id) {
      return;
    }
    if (editingId === entry.id) {
      setEditingId(null);
      setEditScriptText('');
      return;
    }
    setExpandedId(entry.id);
    setEditingId(entry.id);
    setEditScriptText(entry.script || '');
  };

  const handleScriptUpdate = async (entry) => {
    const trimmed = editScriptText.trim();
    if (!trimmed) {
      addToast('Script text cannot be empty.', 'error');
      return;
    }
    setSavingScriptId(entry.id);
    try {
      const updated = await updateWorkspaceScript({
        id: entry.id,
        script: trimmed,
      });
      setItems((prev) =>
        prev.map((item) => (item.id === entry.id ? { ...item, ...updated } : item))
      );
      setEditingId(null);
      setEditScriptText('');
      addToast('Script updated.');
    } catch (error) {
      addToast(error.message || 'Unable to update script.', 'error');
    } finally {
      setSavingScriptId(null);
    }
  };

  const handleRemove = async (id) => {
    try {
      await deleteWorkspaceEntry(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      setExpandedId((prev) => (prev === id ? null : prev));
      setEditingId((prev) => (prev === id ? null : prev));
      setEditScriptText('');
      addToast('Removed from workspace.');
    } catch (error) {
      addToast(error.message || 'Unable to remove asset.', 'error');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold theme-text-primary">Workspace Library</h1>
        <p className="max-w-3xl text-sm theme-text-muted">
          Every saved asset—clips, scripts, and voice tracks—lives here. Share with editors, revisit winning
          angles, or rebuild launch kits without leaving Growth OS.
        </p>
      </header>

      <GlassCard title="Collections" subtitle="At-a-glance view of what you&apos;ve stored.">
        <div className="grid gap-4 sm:grid-cols-3">
          {summary.map((entry) => (
            <div key={entry.label} className="liquid-interactive flex flex-col gap-2 px-4 py-3">
              <p className="text-sm font-semibold theme-text-primary">
                <span className="mr-2">{entry.icon}</span>
                {entry.label}
              </p>
              <p className="text-xs theme-text-muted">{entry.detail}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] theme-text-muted">
                {entry.count} Stored
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Workspace Assets" subtitle="Filter, copy, or share assets without leaving the glass UI.">
        {loading ? (
          <p className="text-sm theme-text-muted">Loading workspace items…</p>
        ) : items.length === 0 ? (
          <p className="text-sm theme-text-muted">
            No assets yet. Save a download or generate a voice track to see it appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((entry) => {
              const meta = typeMetadata[entry.type || 'download'] || typeMetadata.download;
              const isScript = (entry.type || 'download') === 'script';
              const scriptContent = entry.script || '';
              const isExpanded = expandedId === entry.id;
              const isEditing = editingId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="liquid-interactive flex flex-col gap-3 border border-white/10 px-4 py-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold theme-text-primary">
                        <span className="mr-2 text-lg">{meta.icon}</span>
                        {entry.title || 'Workspace Asset'}
                      </p>
                      <p className="text-xs theme-text-muted">
                        {meta.label} • Added {formatDate(entry.saved_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isScript && (
                        <>
                          <button
                            type="button"
                            className="liquid-button text-xs"
                            onClick={() => togglePreview(entry)}
                          >
                            {isExpanded ? 'Hide Script' : 'Preview Script'}
                          </button>
                          <button
                            type="button"
                            className="liquid-button text-xs"
                            onClick={() => handleCopyScript(scriptContent)}
                            disabled={!scriptContent}
                          >
                            Copy Script
                          </button>
                          <button
                            type="button"
                            className="liquid-button text-xs"
                            onClick={() => startEditingScript(entry)}
                          >
                            {isEditing ? 'Cancel Edit' : 'Edit Script'}
                          </button>
                        </>
                      )}
                      {entry.file_url && (
                        <a
                          href={`${API_BASE}${entry.file_url}`}
                          download
                          className="liquid-button text-xs"
                        >
                          Download
                        </a>
                      )}
                      <button type="button" className="liquid-button text-xs" onClick={() => handleRemove(entry.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  {entry.tags?.length ? (
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] theme-text-muted">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {entry.url && (
                    <p className="break-words text-xs theme-text-muted">
                      Source: <span className="theme-text-primary">{entry.url}</span>
                    </p>
                  )}
                  {isScript && isExpanded && (
                    <div className="space-y-3 rounded-md border border-white/10 bg-white/5 p-4 text-sm">
                      {isEditing ? (
                        <>
                          <textarea
                            className={editorInputClasses}
                            value={editScriptText}
                            onChange={(event) => setEditScriptText(event.target.value)}
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="liquid-button text-xs"
                              onClick={() => handleScriptUpdate(entry)}
                              disabled={savingScriptId === entry.id}
                            >
                              {savingScriptId === entry.id ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button
                              type="button"
                              className="liquid-button text-xs"
                              onClick={() => {
                                setEditingId(null);
                                setEditScriptText('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap theme-text-secondary">
                          {scriptContent || 'No script text stored yet.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
