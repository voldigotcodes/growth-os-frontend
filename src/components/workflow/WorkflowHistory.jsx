import { memo } from 'react';
import EmptyState from '../EmptyState.jsx';

const STATUS_CLASSES = {
  running: 'bg-sky-400/25 text-sky-100',
  failed: 'bg-rose-400/25 text-rose-100',
  completed: 'bg-emerald-400/25 text-emerald-100',
};

function WorkflowHistory({ history = [], onSelect, onRerun, onOpenOutputs, onViewLogs, onDelete, onDeleteAll }) {
  const formatCredits = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value.trim());
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === 'object') {
      const candidates = [value.consumed, value.workflow_runs, value.credits_consumed];
      for (const candidate of candidates) {
        if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
      }
    }
    return null;
  };

  return (
    <div className="glass-panel space-y-4 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold theme-text-primary">Latest Runs</h2>
          <p className="text-xs theme-text-muted">Track outcomes, credits, and outputs for each execution.</p>
        </div>
        {history.length ? (
          <button
            type="button"
            onClick={onDeleteAll}
            className="text-[10px] uppercase tracking-[0.3em] text-white/60 transition hover:text-rose-200"
          >
            Clear All
          </button>
        ) : null}
      </header>
      {history.length === 0 ? (
        <EmptyState
          title="No runs yet"
          description="Execute a workflow to populate your latest runs and keep track of results."
        />
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={entry.id} className="group relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect?.(entry)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect?.(entry);
                  }
                }}
                className="liquid-interactive flex w-full flex-col gap-3 rounded-2xl px-4 py-3 text-left text-sm hover:ring-sky-200/60"
              >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-6 min-w-[72px] items-center justify-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                      STATUS_CLASSES[entry.status] ?? STATUS_CLASSES.completed
                    }`}
                  >
                    {entry.status}
                  </span>
                  <div className="space-y-1">
                    <p className="font-semibold theme-text-primary">{entry.workflowName}</p>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                      {new Date(entry.startedAt).toLocaleString()} · {entry.durationLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] uppercase tracking-[0.3em] theme-text-muted">
                  <p>{entry.status === 'failed' ? 'Review' : 'View'}</p>
                  {formatCredits(entry.credits) !== null && (
                    <p className="mt-1 text-white/70">-{formatCredits(entry.credits)} credits</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/70">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRerun?.(entry);
                  }}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-emerald-300/60 hover:text-emerald-200"
                >
                  Rerun
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenOutputs?.(entry);
                  }}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-sky-300/60 hover:text-sky-200"
                >
                  Open Outputs
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewLogs?.(entry);
                  }}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-pink-300/60 hover:text-pink-200"
                >
                  View Logs
                </button>
              </div>
            </div>
              <button
                type="button"
                onClick={() => onDelete?.(entry)}
                className="absolute -right-2 -top-2 hidden h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-slate-900/70 text-sm text-white/80 shadow-lg transition group-hover:flex hover:bg-rose-500/80"
                aria-label={`Delete run ${entry.workflowName}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(WorkflowHistory);
