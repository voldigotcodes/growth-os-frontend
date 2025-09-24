import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard.jsx';
import { useToast } from '../components/ToastContext.jsx';
import { API_BASE, deleteWorkspaceEntry, fetchWorkspace } from '../lib/apiClient.js';

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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleRemove = async (id) => {
    try {
      await deleteWorkspaceEntry(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
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
                    <p className="text-xs theme-text-muted break-words">
                      Source: <span className="theme-text-primary">{entry.url}</span>
                    </p>
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
